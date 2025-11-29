const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

module.exports = function (app) {
    // Trades - comprehensive with all filters
    registerRoute(app, 'trades/list', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            // Build asset objects if provided
            let baseAsset = null
            let counterAsset = null
            
            if (query.base_asset_type) {
                if (query.base_asset_type === 'native') {
                    baseAsset = horizonAdapter.getServer(params.network).Asset.native()
                } else {
                    baseAsset = new (horizonAdapter.getServer(params.network).Asset)(
                        query.base_asset_code,
                        query.base_asset_issuer
                    )
                }
            }
            
            if (query.counter_asset_type) {
                if (query.counter_asset_type === 'native') {
                    counterAsset = horizonAdapter.getServer(params.network).Asset.native()
                } else {
                    counterAsset = new (horizonAdapter.getServer(params.network).Asset)(
                        query.counter_asset_code,
                        query.counter_asset_issuer
                    )
                }
            }
            
            const trades = await horizonAdapter.getTrades(
                params.network,
                baseAsset,
                counterAsset,
                query.limit || 50,
                query.cursor
            )
            return {records: trades}
        })

    // Payments
    registerRoute(app, 'payments/recent', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const payments = await horizonAdapter.getPayments(params.network, query.limit || 50, query.cursor)
            return {records: payments}
        })

    // Effects
    registerRoute(app, 'effects/recent', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const effects = await horizonAdapter.getEffects(params.network, query.limit || 50, query.cursor)
            return {records: effects}
        })

    // Offers
    registerRoute(app, 'offers/list', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const offers = await horizonAdapter.getOffers(params.network, {
                seller: query.seller,
                selling: query.selling,
                buying: query.buying,
                cursor: query.cursor,
                order: query.order,
                limit: query.limit || 50
            })
            return {records: offers}
        })

    registerRoute(app, 'offers/:offerId', {cache: 'stats', cors: 'open'},
        async ({params}) => {
            return await horizonAdapter.getOffer(params.network, params.offerId)
        })

    // Paths
    registerRoute(app, 'paths/strict-receive', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            return await horizonAdapter.getPaths(params.network, {
                source: query.source,
                destination: query.destination,
                destinationAsset: query.destination_asset,
                destinationAmount: query.destination_amount
            })
        })

    registerRoute(app, 'paths/strict-send', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            return await horizonAdapter.getStrictSendPaths(params.network, {
                sourceAsset: query.source_asset,
                sourceAmount: query.source_amount,
                destination: query.destination
            })
        })

    // Fee Stats
    registerRoute(app, 'fee-stats', {cache: 'stats', cors: 'open'},
        async ({params}) => {
            return await horizonAdapter.getFeeStats(params.network)
        })

    // Liquidity Pools
    registerRoute(app, 'liquidity-pools/list', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const pools = await horizonAdapter.getLiquidityPools(params.network, query.limit || 50, query.cursor)
            return {records: pools}
        })

    registerRoute(app, 'liquidity-pools/:poolId', {cache: 'stats', cors: 'open'},
        async ({params}) => {
            return await horizonAdapter.getLiquidityPool(params.network, params.poolId)
        })

    // Claimable Balances
    registerRoute(app, 'claimable-balances/list', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const balances = await horizonAdapter.getClaimableBalances(params.network, {
                claimant: query.claimant,
                asset: query.asset,
                sponsor: query.sponsor,
                cursor: query.cursor,
                order: query.order,
                limit: query.limit || 50
            })
            return {records: balances}
        })

    registerRoute(app, 'claimable-balances/:balanceId', {cache: 'stats', cors: 'open'},
        async ({params}) => {
            return await horizonAdapter.getClaimableBalance(params.network, params.balanceId)
        })

    // Orderbook
    registerRoute(app, 'orderbook', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            return await horizonAdapter.getOrderbook(params.network, query.selling, query.buying)
        })

    // Trade Aggregations
    registerRoute(app, 'trade-aggregations', {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            return await horizonAdapter.getTradeAggregations(
                params.network,
                query.base,
                query.counter,
                query.start_time,
                query.end_time,
                query.resolution
            )
        })
}
