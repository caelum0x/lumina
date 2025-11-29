const db = require('../connectors/mongodb-connector')

class AggregationService {
    constructor(network = 'public') {
        this.network = network
    }

    async getDailyStats(days = 30) {
        if (!db[this.network]) return []
        
        const now = Date.now()
        const startTime = now - (days * 86400000)
        
        try {
            const result = await db[this.network].collection('ledgers').aggregate([
                {$match: {ts: {$gte: startTime}}},
                {$group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: {$toDate: '$ts'}
                        }
                    },
                    transactions: {$sum: '$tx'},
                    operations: {$sum: '$ops'},
                    failed: {$sum: '$failed'},
                    count: {$sum: 1}
                }},
                {$sort: {_id: 1}}
            ]).toArray()
            
            return result.map(r => ({
                date: r._id,
                transactions: r.transactions,
                operations: r.operations,
                failed: r.failed,
                ledgers: r.count
            }))
        } catch (e) {
            console.error('[Aggregation] Daily stats error:', e.message)
            return []
        }
    }

    async getHourlyStats(hours = 24) {
        if (!db[this.network]) return []
        
        const now = Date.now()
        const startTime = now - (hours * 3600000)
        
        try {
            const result = await db[this.network].collection('ledgers').aggregate([
                {$match: {ts: {$gte: startTime}}},
                {$group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d %H:00',
                            date: {$toDate: '$ts'}
                        }
                    },
                    transactions: {$sum: '$tx'},
                    operations: {$sum: '$ops'},
                    timestamp: {$first: '$ts'}
                }},
                {$sort: {_id: 1}}
            ]).toArray()
            
            return result.map(r => ({
                time: r.timestamp,
                transactions: r.transactions,
                operations: r.operations
            }))
        } catch (e) {
            console.error('[Aggregation] Hourly stats error:', e.message)
            return []
        }
    }
}

module.exports = AggregationService
