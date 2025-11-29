#!/usr/bin/env node

/**
 * Comprehensive Stellar Data Ingestion Script
 * Fetches accounts, assets, transactions, operations, and ledgers from Horizon
 */

const fetch = require('node-fetch')
const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://subasiarhan3_db_user:ETKnWiMmraGFX5P@lumina.vcg0rkz.mongodb.net/lumina_public?retryWrites=true&w=majority&appName=lumina'
const HORIZON_URL = process.env.HORIZON_URL_PUBLIC || 'https://horizon.stellar.org'

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return await response.json()
        } catch (e) {
            if (i === retries - 1) throw e
            await new Promise(r => setTimeout(r, 1000 * (i + 1)))
        }
    }
}

async function ingestAssets(db, limit = 200) {
    console.log(`\n💎 Ingesting assets from Horizon...`)
    
    const data = await fetchWithRetry(`${HORIZON_URL}/assets?order=desc&limit=${limit}`)
    const assets = data._embedded?.records || []
    
    const collection = db.collection('assets')
    const ops = []
    
    for (const asset of assets) {
        if (!asset.asset_code || !asset.asset_issuer) continue
        
        ops.push({
            updateOne: {
                filter: { _id: `${asset.asset_code}-${asset.asset_issuer}` },
                update: {
                    $set: {
                        asset: asset.asset_code,
                        issuer: asset.asset_issuer,
                        code: asset.asset_code,
                        supply: parseFloat(asset.amount) || 0,
                        accounts: parseInt(asset.num_accounts) || 0,
                        trustlines: parseInt(asset.num_accounts) || 0,
                        payments: 0,
                        trades: 0,
                        volume: 0,
                        price: 0,
                        rating: parseInt(asset.num_accounts) || 0,
                        created: new Date(),
                        updated: new Date()
                    }
                },
                upsert: true
            }
        })
    }
    
    if (ops.length > 0) {
        await collection.bulkWrite(ops, { ordered: false }).catch(e => {
            if (!e.message.includes('duplicate')) console.error('Asset insert error:', e.message)
        })
    }
    
    console.log(`✅ Ingested ${assets.length} assets`)
    return assets.length
}

async function ingestLedgers(db, limit = 200) {
    console.log(`\n📊 Ingesting ledgers from Horizon...`)
    
    const data = await fetchWithRetry(`${HORIZON_URL}/ledgers?order=desc&limit=${limit}`)
    const ledgers = data._embedded?.records || []
    
    const collection = db.collection('ledgers')
    const ops = []
    
    for (const ledger of ledgers) {
        ops.push({
            updateOne: {
                filter: { _id: ledger.sequence },
                update: {
                    $set: {
                        sequence: ledger.sequence,
                        ts: new Date(ledger.closed_at).getTime(),
                        hash: ledger.hash,
                        prev_hash: ledger.prev_hash,
                        tx: ledger.successful_transaction_count || 0,
                        failed: ledger.failed_transaction_count || 0,
                        ops: ledger.operation_count || 0,
                        closed_at: ledger.closed_at,
                        total_coins: ledger.total_coins,
                        fee_pool: ledger.fee_pool,
                        base_fee: ledger.base_fee_in_stroops,
                        base_reserve: ledger.base_reserve_in_stroops,
                        protocol_version: ledger.protocol_version
                    }
                },
                upsert: true
            }
        })
    }
    
    if (ops.length > 0) {
        await collection.bulkWrite(ops, { ordered: false }).catch(e => {
            if (!e.message.includes('duplicate')) console.error('Ledger insert error:', e.message)
        })
    }
    
    console.log(`✅ Ingested ${ledgers.length} ledgers`)
    return ledgers.length
}

async function ingestTransactions(db, limit = 200) {
    console.log(`\n💸 Ingesting transactions from Horizon...`)
    
    const data = await fetchWithRetry(`${HORIZON_URL}/transactions?order=desc&limit=${limit}`)
    const transactions = data._embedded?.records || []
    
    const collection = db.collection('transactions')
    const ops = []
    
    for (const tx of transactions) {
        ops.push({
            updateOne: {
                filter: { _id: tx.id },
                update: {
                    $set: {
                        hash: tx.hash,
                        ledger: tx.ledger,
                        ts: new Date(tx.created_at).getTime(),
                        source: tx.source_account,
                        fee: parseInt(tx.fee_charged) || 0,
                        ops: tx.operation_count || 0,
                        successful: tx.successful,
                        memo: tx.memo,
                        memo_type: tx.memo_type,
                        created_at: tx.created_at
                    }
                },
                upsert: true
            }
        })
    }
    
    if (ops.length > 0) {
        await collection.bulkWrite(ops, { ordered: false }).catch(e => {
            if (!e.message.includes('duplicate')) console.error('Transaction insert error:', e.message)
        })
    }
    
    console.log(`✅ Ingested ${transactions.length} transactions`)
    return transactions.length
}

async function ingestAccounts(db, limit = 100) {
    console.log(`\n👤 Ingesting accounts from transactions...`)
    
    // Horizon doesn't support listing all accounts, so we extract them from transactions
    const transactions = await db.collection('transactions').find({}).limit(limit).toArray()
    const uniqueAccounts = [...new Set(transactions.map(tx => tx.source))]
    
    console.log(`   Found ${uniqueAccounts.length} unique accounts from transactions`)
    
    const collection = db.collection('accounts')
    let ingested = 0
    
    for (const accountId of uniqueAccounts.slice(0, 50)) { // Limit to 50 to avoid rate limits
        try {
            const response = await fetchWithRetry(`${HORIZON_URL}/accounts/${accountId}`)
            
            await collection.updateOne(
                { _id: accountId },
                {
                    $set: {
                        address: accountId,
                        sequence: response.sequence,
                        subentry_count: response.subentry_count || 0,
                        home_domain: response.home_domain || '',
                        thresholds: response.thresholds,
                        flags: response.flags,
                        balances: response.balances || [],
                        signers: response.signers || [],
                        updated: new Date()
                    }
                },
                { upsert: true }
            )
            ingested++
        } catch (e) {
            // Skip accounts that fail
        }
    }
    
    console.log(`✅ Ingested ${ingested} accounts`)
    return ingested
}

async function calculateNetworkStats(db) {
    console.log(`\n📈 Calculating network statistics...`)
    
    const ledgers = await db.collection('ledgers')
        .find({})
        .sort({ sequence: -1 })
        .limit(200)
        .toArray()
    
    if (ledgers.length === 0) return
    
    const latest = ledgers[0]
    const stats = {
        _id: -1,
        last_ledger: latest.sequence,
        last_ledger_time: latest.closed_at,
        operations: ledgers.reduce((sum, l) => sum + (l.ops || 0), 0),
        transactions: ledgers.reduce((sum, l) => sum + (l.tx || 0), 0),
        successful_transactions: ledgers.reduce((sum, l) => sum + (l.tx || 0), 0),
        failed_transactions: ledgers.reduce((sum, l) => sum + (l.failed || 0), 0),
        reserve: latest.base_reserve,
        total_xlm: latest.total_coins,
        finalized: true,
        updated: new Date()
    }
    
    await db.collection('network_stats').updateOne(
        { _id: -1 },
        { $set: stats },
        { upsert: true }
    )
    
    console.log(`✅ Network stats calculated`)
}

async function createIndexes(db) {
    console.log(`\n🔍 Creating database indexes...`)
    
    await db.collection('assets').createIndex({ asset: 1, issuer: 1 })
    await db.collection('assets').createIndex({ accounts: -1 })
    await db.collection('ledgers').createIndex({ sequence: -1 })
    await db.collection('ledgers').createIndex({ ts: -1 })
    await db.collection('transactions').createIndex({ ledger: -1 })
    await db.collection('transactions').createIndex({ ts: -1 })
    await db.collection('transactions').createIndex({ source: 1 })
    await db.collection('accounts').createIndex({ address: 1 })
    
    console.log(`✅ Indexes created`)
}

async function main() {
    console.log('🚀 Lumina Comprehensive Data Ingestion\n')
    console.log('Connecting to MongoDB...')
    
    const client = new MongoClient(MONGODB_URI)
    
    try {
        await client.connect()
        console.log('✅ Connected to MongoDB\n')
        
        const db = client.db('lumina_public')
        
        // Ingest all data types
        const assetCount = await ingestAssets(db, 200)
        const ledgerCount = await ingestLedgers(db, 200)
        const txCount = await ingestTransactions(db, 200)
        const accountCount = await ingestAccounts(db, 100)
        
        await calculateNetworkStats(db)
        await createIndexes(db)
        
        console.log('\n✅ Data ingestion complete!')
        console.log('\n📊 Summary:')
        console.log(`   - Assets: ${assetCount} ingested, ${await db.collection('assets').countDocuments()} total`)
        console.log(`   - Ledgers: ${ledgerCount} ingested, ${await db.collection('ledgers').countDocuments()} total`)
        console.log(`   - Transactions: ${txCount} ingested, ${await db.collection('transactions').countDocuments()} total`)
        console.log(`   - Accounts: ${accountCount} ingested, ${await db.collection('accounts').countDocuments()} total`)
        console.log(`   - Network stats: ${await db.collection('network_stats').countDocuments()} records`)
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        console.error(error.stack)
        process.exit(1)
    } finally {
        await client.close()
        console.log('\n👋 Disconnected from MongoDB')
    }
}

main()
