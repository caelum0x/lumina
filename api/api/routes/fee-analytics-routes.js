const {registerRoute} = require('../router')
const db = require('../../connectors/mongodb-connector')

module.exports = function (app) {
    registerRoute(app,
        'fee-analytics',
        {cache: 'stats', cors: 'open'},
        async ({params}) => {
            try {
                // Get recent ledgers from MongoDB
                const ledgers = await db[params.network].collection('ledgers')
                    .find({})
                    .sort({_id: -1})
                    .limit(200)
                    .toArray()
                
                if (!ledgers || ledgers.length === 0) {
                    throw new Error('No ledgers found')
                }
                
                const fees = ledgers.map(l => l.base_fee || 100)
                const avgFee = fees.reduce((a, b) => a + b, 0) / fees.length
                const minFee = Math.min(...fees)
                const maxFee = Math.max(...fees)
                
                const latest = ledgers[0]
                
                return {
                    current: {
                        base_fee: latest.base_fee || 100,
                        base_fee_xlm: ((latest.base_fee || 100) / 10000000).toFixed(7),
                        base_reserve: latest.base_reserve || 5000000,
                        base_reserve_xlm: ((latest.base_reserve || 5000000) / 10000000).toFixed(1)
                    },
                    stats: {
                        avg_fee: avgFee,
                        avg_fee_xlm: (avgFee / 10000000).toFixed(7),
                        min_fee: minFee,
                        min_fee_xlm: (minFee / 10000000).toFixed(7),
                        max_fee: maxFee,
                        max_fee_xlm: (maxFee / 10000000).toFixed(7)
                    },
                    recommendation: avgFee <= 100 ? 'low' : avgFee <= 1000 ? 'normal' : 'high'
                }
            } catch (e) {
                console.error('Fee analytics error:', e.message)
                // Return safe defaults
                return {
                    current: {
                        base_fee: 100,
                        base_fee_xlm: '0.0000100',
                        base_reserve: 5000000,
                        base_reserve_xlm: '0.5'
                    },
                    stats: {
                        avg_fee: 100,
                        avg_fee_xlm: '0.0000100',
                        min_fee: 100,
                        min_fee_xlm: '0.0000100',
                        max_fee: 100,
                        max_fee_xlm: '0.0000100'
                    },
                    recommendation: 'low'
                }
            }
        })
}
