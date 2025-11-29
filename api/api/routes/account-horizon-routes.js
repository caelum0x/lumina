const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

module.exports = function (app) {
    // List accounts with filters
    registerRoute(app,
        'account/list',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const accounts = await horizonAdapter.getAccounts(params.network, {
                signer: query.signer,
                asset: query.asset,
                sponsor: query.sponsor,
                liquidity_pool: query.liquidity_pool,
                cursor: query.cursor,
                order: query.order,
                limit: query.limit || 10
            })
            return {records: accounts}
        })

    // Get single account
    registerRoute(app,
        'account/:address/details',
        {cache: 'stats', cors: 'open'},
        async ({params}) => {
            return await horizonAdapter.getAccount(params.network, params.address)
        })

    // Get account transactions
    registerRoute(app,
        'account/:address/transactions',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const txs = await horizonAdapter.getAccountTransactions(
                params.network,
                params.address,
                query.limit || 50,
                query.cursor
            )
            return {records: txs}
        })

    // Get account operations
    registerRoute(app,
        'account/:address/operations',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const ops = await horizonAdapter.getAccountOperations(
                params.network,
                params.address,
                query.limit || 50,
                query.cursor
            )
            return {records: ops}
        })

    // Get account payments
    registerRoute(app,
        'account/:address/payments',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const payments = await horizonAdapter.getAccountPayments(
                params.network,
                params.address,
                query.limit || 50,
                query.cursor
            )
            return {records: payments}
        })

    // Get account effects
    registerRoute(app,
        'account/:address/effects',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const effects = await horizonAdapter.getAccountEffects(
                params.network,
                params.address,
                query.limit || 50,
                query.cursor
            )
            return {records: effects}
        })

    // Get account offers
    registerRoute(app,
        'account/:address/offers',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const offers = await horizonAdapter.getAccountOffers(
                params.network,
                params.address,
                query.limit || 50,
                query.cursor
            )
            return {records: offers}
        })

    // Get account trades
    registerRoute(app,
        'account/:address/trades',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const trades = await horizonAdapter.getAccountTrades(
                params.network,
                params.address,
                query.limit || 50,
                query.cursor
            )
            return {records: trades}
        })

    // Get account data
    registerRoute(app,
        'account/:address/data',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            return await horizonAdapter.getAccountData(
                params.network,
                params.address,
                query.key
            )
        })
}
