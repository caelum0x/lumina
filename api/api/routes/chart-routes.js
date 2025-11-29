const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')
const AggregationService = require('../../services/aggregation-service')

module.exports = function (app) {
    // Volume chart data - use aggregated if available
    registerRoute(app,
        'chart/volume',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const period = query.period || '24h'
            const agg = new AggregationService(params.network)
            
            if (period === '30d') {
                const daily = await agg.getDailyStats(30)
                if (daily.length > 0) {
                    return {
                        data: daily.map(d => ({
                            time: new Date(d.date).getTime(),
                            value: d.operations
                        })),
                        period: '30d'
                    }
                }
            }
            
            // Fallback to Horizon
            const ledgers = await horizonAdapter.getLedgers(params.network, 100)
            const data = ledgers.map(l => ({
                time: new Date(l.closed_at).getTime(),
                value: l.operation_count || 0
            }))
            return {data, period: '24h'}
        })

    // Transaction count chart
    registerRoute(app,
        'chart/transactions',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const period = query.period || '24h'
            const agg = new AggregationService(params.network)
            
            if (period === '30d') {
                const daily = await agg.getDailyStats(30)
                if (daily.length > 0) {
                    return {
                        data: daily.map(d => ({
                            time: new Date(d.date).getTime(),
                            value: d.transactions
                        })),
                        period: '30d'
                    }
                }
            }
            
            // Fallback to Horizon
            const ledgers = await horizonAdapter.getLedgers(params.network, 100)
            const data = ledgers.map(l => ({
                time: new Date(l.closed_at).getTime(),
                value: (l.successful_transaction_count || 0) + (l.failed_transaction_count || 0)
            }))
            return {data, period: '24h'}
        })

    // Asset trades chart
    registerRoute(app,
        'chart/trades/:base/:counter',
        {cache: 'stats', cors: 'open'},
        async ({params}) => {
            const server = horizonAdapter.getServer(params.network)
            const now = Date.now()
            const dayAgo = now - 86400000
            
            const agg = await server.tradeAggregations(
                params.base === 'native' ? {type: 'native'} : {type: 'credit_alphanum4', code: params.base.split(':')[0], issuer: params.base.split(':')[1]},
                params.counter === 'native' ? {type: 'native'} : {type: 'credit_alphanum4', code: params.counter.split(':')[0], issuer: params.counter.split(':')[1]},
                dayAgo,
                now,
                3600000
            ).limit(24).order('desc').call()
            
            const data = agg.records.map(r => ({
                time: new Date(r.timestamp).getTime(),
                open: parseFloat(r.open),
                high: parseFloat(r.high),
                low: parseFloat(r.low),
                close: parseFloat(r.close),
                volume: parseFloat(r.base_volume)
            }))
            
            return {data, period: '24h'}
        })

    // Analytics endpoint - daily stats
    registerRoute(app,
        'chart/analytics/daily',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const days = parseInt(query.days) || 30
            const agg = new AggregationService(params.network)
            const stats = await agg.getDailyStats(days)
            return {data: stats, period: `${days}d`}
        })

    // Analytics endpoint - hourly stats
    registerRoute(app,
        'chart/analytics/hourly',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const hours = parseInt(query.hours) || 24
            const agg = new AggregationService(params.network)
            const stats = await agg.getHourlyStats(hours)
            return {data: stats, period: `${hours}h`}
        })
}
