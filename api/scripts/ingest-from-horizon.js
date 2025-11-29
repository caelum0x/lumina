#!/usr/bin/env node

/**
 * Simple script to ingest recent Stellar data from Horizon into MongoDB
 * This populates the database with recent ledgers, transactions, and assets
 */

const fetch = require('node-fetch')
const { MongoClient } = require('mongodb')

const MONGODB_URI = 'mongodb+srv://subasiarhan3_db_user:ETKnWiMmraGFX5P@lumina.vcg0rkz.mongodb.net/lumina_public?retryWrites=true&w=majority&appName=lumina'
const HORIZON_URL = 'https://horizon.stellar.org'

async function ingestLedgers(db, limit = 1000) {
    console.log(`\n📊 Ingesting ${limit} recent ledgers...`)
    
    const response = await fetch(`${HORIZON_URL}/ledgers?order=desc&limit=${limit}`)
    const data = await response.json()
    
    if (!data._embedded || !data._embedded.records) {
        console.log('⚠️  No ledgers returned from Horizon')
        return
    }
    
    const ledgers = data._embedded.records
    
    const collection = db.collection('ledgers')
    
    for (const ledger of ledgers) {
        await collection.updateOne(
            { _id: ledger.sequence },
            {
                $set: {
                    sequence: ledger.sequence,
                    hash: ledger.hash,
                    prev_hash: ledger.prev_hash,
                    transaction_count: ledger.successful_transaction_count + ledger.failed_transaction_count,
                    successful_transaction_count: ledger.successful_transaction_count,
                    failed_transaction_count: ledger.failed_transaction_count,
                    operation_count: ledger.operation_count,
                    closed_at: ledger.closed_at,
                    total_coins: ledger.total_coins,
                    fee_pool: ledger.fee_pool,
                    base_fee_in_stroops: ledger.base_fee_in_stroops,
                    base_reserve_in_stroops: ledger.base_reserve_in_stroops,
                    protocol_version: ledger.protocol_version,
                    header_xdr: ledger.header_xdr
                }
            },
            { upsert: true }
        )
    }
    
    console.log(`✅ Ingested ${ledgers.length} ledgers`)
}

async function ingestAssets(db, limit = 200) {
    console.log(`\n💎 Ingesting ${limit} assets...`)
    
    const response = await fetch(`${HORIZON_URL}/assets?order=desc&limit=${limit}`)
    const data = await response.json()
    
    if (!data._embedded || !data._embedded.records) {
        console.log('⚠️  No assets returned from Horizon')
        return
    }
    
    const assets = data._embedded.records
    
    const collection = db.collection('assets')
    
    for (const asset of assets) {
        if (!asset.asset_code || !asset.asset_issuer) continue
        
        await collection.updateOne(
            { _id: `${asset.asset_code}-${asset.asset_issuer}` },
            {
                $set: {
                    asset: asset.asset_code,
                    issuer: asset.asset_issuer,
                    supply: parseFloat(asset.amount) || 0,
                    trustlines: parseInt(asset.num_accounts) || 0,
                    payments: parseInt(asset.num_accounts) || 0,
                    trades: 0,
                    volume: 0,
                    price: 0,
                    rating: parseInt(asset.num_accounts) || 0,
                    created: new Date()
                }
            },
            { upsert: true }
        )
    }
    
    console.log(`✅ Ingested ${assets.length} assets`)
}

async function calculateNetworkStats(db) {
    console.log(`\n📈 Calculating network statistics...`)
    
    const ledgers = await db.collection('ledgers')
        .find({})
        .sort({ sequence: -1 })
        .limit(200)
        .toArray()
    
    if (ledgers.length === 0) {
        console.log('⚠️  No ledgers found')
        return
    }
    
    const latest = ledgers[0]
    const stats = {
        _id: -1, // Latest stats marker
        last_ledger: latest.sequence,
        last_ledger_time: latest.closed_at,
        operations: ledgers.reduce((sum, l) => sum + l.operation_count, 0),
        transactions: ledgers.reduce((sum, l) => sum + l.transaction_count, 0),
        successful_transactions: ledgers.reduce((sum, l) => sum + l.successful_transaction_count, 0),
        failed_transactions: ledgers.reduce((sum, l) => sum + l.failed_transaction_count, 0),
        reserve: latest.base_reserve_in_stroops,
        total_xlm: latest.total_coins,
        finalized: true
    }
    
    await db.collection('network_stats').updateOne(
        { _id: -1 },
        { $set: stats },
        { upsert: true }
    )
    
    console.log(`✅ Network stats calculated`)
}

async function main() {
    console.log('🚀 Lumina Data Ingestion from Horizon\n')
    console.log('Connecting to MongoDB Atlas...')
    
    const client = new MongoClient(MONGODB_URI)
    
    try {
        await client.connect()
        console.log('✅ Connected to MongoDB Atlas\n')
        
        const db = client.db('lumina_public')
        
        // Ingest data
        await ingestLedgers(db, 200)
        await ingestAssets(db, 200)
        await calculateNetworkStats(db)
        
        console.log('\n✅ Data ingestion complete!')
        console.log('\n📊 Summary:')
        console.log(`   - Ledgers: ${await db.collection('ledgers').countDocuments()}`)
        console.log(`   - Assets: ${await db.collection('assets').countDocuments()}`)
        console.log(`   - Network stats: ${await db.collection('network_stats').countDocuments()}`)
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    } finally {
        await client.close()
        console.log('\n👋 Disconnected from MongoDB')
    }
}

main()
