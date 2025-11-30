const {registerRoute} = require('../router')
const {queryAccountStats} = require('../../business-logic/account/account-stats')
const {queryAccountStatsHistory} = require('../../business-logic/account/account-stats-history')
const {queryAllAccounts} = require('../../business-logic/account/account-list')
const {queryAccountBalanceHistory} = require('../../business-logic/account/account-balance-history')
const {queryAccountTrades} = require('../../business-logic/dex/trades')
const {queryAccountClaimableBalances} = require('../../business-logic/claimable-balances/claimable-balances')
const {estimateAccountValue} = require('../../business-logic/account/account-value-estimator')
const horizonAdapter = require('../../connectors/horizon-adapter')

module.exports = function (app) {
    registerRoute(app,
        'account',
        {cache: 'stats'},
        ({params, query, path}) => queryAllAccounts(params.network, path, query))

    registerRoute(app,
        'account/:account',
        {cache: 'stats'},
        async ({params, query}) => {
            try {
                return await queryAccountStats(params.network, params.account, query)
            } catch (err) {
                if (err.status === 404 || err.message?.includes('not found')) {
                    try {
                        const horizonAccount = await horizonAdapter.getAccount(params.network, params.account)
                        return {
                            account: horizonAccount.account_id,
                            created: horizonAccount.created_at,
                            deleted: false,
                            payments: 0,
                            trades: 0,
                            activity: {yearly: 'none', monthly: 'none'},
                            assets: [],
                            balances: horizonAccount.balances || [],
                            signers: horizonAccount.signers || [],
                            thresholds: horizonAccount.thresholds || {low_threshold: 0, med_threshold: 0, high_threshold: 0},
                            flags: horizonAccount.flags || {},
                            _fromHorizon: true
                        }
                    } catch (horizonErr) {
                        throw err
                    }
                }
                throw err
            }
        })

    registerRoute(app,
        'account/:account/stats-history',
        {cache: 'stats'},
        async ({params, query}) => {
            try {
                return await queryAccountStatsHistory(params.network, params.account, query)
            } catch (err) {
                return []
            }
        })

    registerRoute(app,
        'account/:account/history/trades',
        {cache: 'tx'},
        async ({params, query, path}) => {
            const {filter, network, account} = params
            try {
                const result = await queryAccountTrades(network, account, path, query)
                return result
            } catch (err) {
                // Fallback to Horizon when account not in DB
                try {
                    const limit = query.limit || 40
                    const trades = await horizonAdapter.getAccountTrades(network, account, limit)
                    const queryString = new URLSearchParams(query).toString()
                    const fullPath = queryString ? `${path}?${queryString}` : path
                    
                    // Transform Horizon format to expected format
                    const transformedTrades = (trades || []).map(t => {
                        const baseAsset = t.base_asset_type === 'native' ? 'XLM' : 
                            `${t.base_asset_code}-${t.base_asset_issuer}`
                        const counterAsset = t.counter_asset_type === 'native' ? 'XLM' : 
                            `${t.counter_asset_code}-${t.counter_asset_issuer}`
                        
                        return {
                            paging_token: t.paging_token,
                            ts: t.ledger_close_time ? Math.floor(new Date(t.ledger_close_time).getTime() / 1000) : undefined,
                            offer: t.base_is_seller ? t.base_offer_id : t.counter_offer_id,
                            seller: t.base_is_seller ? t.base_account : t.counter_account,
                            buyer: t.base_is_seller ? t.counter_account : t.base_account,
                            sold_asset: t.base_is_seller ? baseAsset : counterAsset,
                            bought_asset: t.base_is_seller ? counterAsset : baseAsset,
                            sold_amount: t.base_is_seller ? t.base_amount : t.counter_amount,
                            bought_amount: t.base_is_seller ? t.counter_amount : t.base_amount,
                            price: t.price,
                            operation: t._links?.operation?.href,
                            _fromHorizon: true
                        }
                    })
                    
                    return {
                        _embedded: {records: transformedTrades},
                        _links: {self: {href: fullPath}, prev: {href: fullPath}, next: {href: fullPath}},
                        _meta: {fallback: 'horizon'}
                    }
                } catch (horizonErr) {
                    const queryString = new URLSearchParams(query).toString()
                    const fullPath = queryString ? `${path}?${queryString}` : path
                    return {_embedded: {records: []}, _links: {self: {href: fullPath}, prev: {href: fullPath}, next: {href: fullPath}}}
                }
            }
        })

    registerRoute(app,
        'account/:account/balance/:asset/history',
        {cache: 'balance'},
        async ({params}) => {
            try {
                return await queryAccountBalanceHistory(params.network, params.account, params.asset)
            } catch (err) {
                return {records: [], _meta: {fallback: true}}
            }
        })

    registerRoute(app,
        'account/:account/claimable-balances',
        {cache: 'balance'},
        async ({params, query, path}) => {
            try {
                const result = await queryAccountClaimableBalances(params.network, params.account, path, query)
                if (!result) {
                    const queryString = new URLSearchParams(query).toString()
                    const fullPath = queryString ? `${path}?${queryString}` : path
                    return {_embedded: {records: []}, _links: {self: {href: fullPath}, prev: {href: fullPath}, next: {href: fullPath}}}
                }
                return result
            } catch (err) {
                const queryString = new URLSearchParams(query).toString()
                const fullPath = queryString ? `${path}?${queryString}` : path
                return {_embedded: {records: []}, _links: {self: {href: fullPath}, prev: {href: fullPath}, next: {href: fullPath}}, _meta: {error: err.message}}
            }
        })

    registerRoute(app,
        'account/:account/value',
        {cache: 'stats'},
        async ({params, query}) => {
            try {
                return await estimateAccountValue(params.network, params.account, query.currency, query.ts)
            } catch (err) {
                return {value: 0, _meta: {fallback: true}}
            }
        })

}