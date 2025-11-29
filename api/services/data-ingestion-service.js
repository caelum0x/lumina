const horizonAdapter = require('../connectors/horizon-adapter')
const db = require('../connectors/mongodb-connector')

class DataIngestionService {
    constructor(network = 'public') {
        this.network = network
        this.running = false
        this.lastLedger = null
    }

    async start() {
        if (this.running) return
        this.running = true
        console.log(`[Ingestion] Starting for ${this.network}...`)
        
        try {
            // Initial sync - last 200 ledgers (~20 minutes)
            await this.syncRecentLedgers(200)
        } catch (e) {
            console.error('[Ingestion] Initial sync failed:', e.message)
        }
        
        // Continuous sync every 10 seconds
        this.interval = setInterval(async () => {
            try {
                await this.syncNewLedgers()
            } catch (e) {
                console.error('[Ingestion] Sync error:', e.message)
            }
        }, 10000)
    }

    async syncRecentLedgers(count) {
        try {
            const ledgers = await horizonAdapter.getLedgers(this.network, count)
            if (ledgers && ledgers.length > 0) {
                await this.storeLedgers(ledgers)
                console.log(`[Ingestion] Synced ${ledgers.length} recent ledgers`)
            }
        } catch (e) {
            console.error('[Ingestion] Recent sync error:', e.message)
        }
    }

    async syncNewLedgers() {
        try {
            const ledgers = await horizonAdapter.getLedgers(this.network, 5)
            if (!ledgers || ledgers.length === 0) return
            
            const newest = ledgers[0].sequence
            if (this.lastLedger && newest <= this.lastLedger) return
            
            await this.storeLedgers(ledgers)
            this.lastLedger = newest
        } catch (e) {
            // Silent fail for continuous sync
        }
    }

    async storeLedgers(ledgers) {
        if (!db[this.network] || !db[this.network].collection) return
        
        const docs = ledgers.map(l => ({
            _id: l.sequence,
            sequence: l.sequence,
            ts: new Date(l.closed_at).getTime(),
            hash: l.hash,
            tx: l.successful_transaction_count || 0,
            failed: l.failed_transaction_count || 0,
            ops: l.operation_count || 0,
            closed_at: l.closed_at
        }))

        try {
            const ops = docs.map(doc => ({
                updateOne: {
                    filter: {_id: doc._id},
                    update: {$set: doc},
                    upsert: true
                }
            }))
            
            await db[this.network].collection('ledgers').bulkWrite(ops, {ordered: false})
        } catch (e) {
            if (!e.message.includes('duplicate key')) {
                console.error('[Ingestion] Store error:', e.message)
            }
        }
    }

    stop() {
        this.running = false
        if (this.interval) clearInterval(this.interval)
        console.log(`[Ingestion] Stopped for ${this.network}`)
    }
}

module.exports = DataIngestionService
