const db = require('../../connectors/mongodb-connector')
const horizonProxy = require('../../connectors/horizon-proxy')
const QueryBuilder = require('../query-builder')
const {validateNetwork} = require('../validators')

async function queryAssetsOverallStats(network) {
    validateNetwork(network)
    
    try {
        const q = new QueryBuilder({
            supply: {$ne: 0},
            payments: {$gt: 0}
        })

        const [res] = await db[network].collection('assets').aggregate([
            {
                $match: q.query
            },
            {
                $group: {
                    _id: null,
                    total_assets: {'$sum': 1},
                    payments: {$sum: '$payments'},
                    trades: {$sum: '$trades'},
                    volume: {$sum: '$quoteVolume'}
                }
            },
            {
                $project: {_id: 0}
            }
        ])
            .toArray()
        
        // If database has data, return it
        if (res && res.total_assets > 0) {
            return res
        }
    } catch (error) {
        console.log('Database query failed, falling back to Horizon:', error.message)
    }
    
    // Fallback to Horizon proxy
    console.log('Using Horizon proxy for asset stats')
    return await horizonProxy.getAssetStats(network)

    res.volume = Math.round(res.volume)
    return res
}

module.exports = {queryAssetsOverallStats}