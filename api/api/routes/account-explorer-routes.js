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
        ({params, query}) => queryAccountStatsHistory(params.network, params.account, query))

    registerRoute(app,
        'account/:account/history/trades',
        {cache: 'tx'},
        ({params, query, path}) => {
            const {filter, network, account} = params
            return queryAccountTrades(network, account, path, query)
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