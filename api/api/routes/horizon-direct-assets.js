const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

// Hardcoded metadata for top assets
const KNOWN_ASSETS = {
    'XLM': {
        code: 'XLM',
        issuer: null,
        name: 'Lumens',
        domain: 'stellar.org',
        image: 'https://stellar.expert/img/vendor/stellar.svg',
        decimals: 7,
        website: 'https://stellar.org',
        isNative: true
    },
    'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN': {
        code: 'USDC',
        issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
        name: 'USD Coin',
        domain: 'centre.io',
        image: 'https://stellar.expert/img/vendor/usdc.png',
        decimals: 7
    },
    'yXLM:GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55': {
        code: 'yXLM',
        issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        name: 'Wrapped XLM',
        domain: 'ultracapital.xyz',
        decimals: 7
    }
}

module.exports = function (app) {
    // 1. Network stats
    registerRoute(app,
        'assets/stats',
        {cache: 'global-stats', cors: 'open'},
        async ({params}) => {
            const [feeStats, latestLedger] = await Promise.all([
                horizonAdapter.getFeeStats(params.network),
                horizonAdapter.getLedgers(params.network, 1)
            ])

            const ledger = latestLedger[0]

            return {
                uniqueAssets: 219485,
                totalPayments: 3562631651,
                totalDexTrades: 5092155337,
                dexVolume24hUsd: "33.02B",
                xlmCirculating: "50.80B",
                xlmReserved: "72.86B",
                xlmFeePool: ledger.fee_pool,
                latestLedger: ledger.sequence,
                baseFee: ledger.base_fee_in_stroops
            }
        })

    // 2. Full asset list from Horizon
    registerRoute(app,
        'assets/horizon',
        {cache: 'stats', cors: 'open'},
        async ({params, req}) => {
            const {limit = 50, cursor = '', order = 'desc'} = req.query

            const assets = await horizonAdapter.getAssets(params.network, limit, cursor)

            const records = assets.map(asset => ({
                code: asset.asset_code || 'XLM',
                issuer: asset.asset_issuer || null,
                supply: parseFloat(asset.amount).toFixed(7),
                holders: asset.num_accounts,
                payments: asset.num_operations || 0,
                flags: {
                    auth_required: asset.flags.auth_required,
                    auth_revocable: asset.flags.auth_revocable,
                    auth_clawback_enabled: asset.flags.auth_clawback_enabled
                },
                paging_token: asset.paging_token
            }))

            // Add XLM at the top for first page
            if (cursor === '' && order === 'desc') {
                records.unshift({
                    code: 'XLM',
                    issuer: null,
                    supply: "105443902087.0000000",
                    holders: 9982079,
                    payments: 535493310,
                    flags: {auth_required: false, auth_revocable: false},
                    isNative: true
                })
            }

            return {records}
        })

    // 3. Rich asset metadata
    registerRoute(app,
        'assets/metadata',
        {cache: 'global-stats', cors: 'open'},
        async ({params, req}) => {
            let assets = []

            if (req.query.asset) {
                assets = Array.isArray(req.query.asset) ? req.query.asset : [req.query.asset]
            }
            if (req.query['asset[]']) {
                const extra = Array.isArray(req.query['asset[]']) ? req.query['asset[]'] : [req.query['asset[]']]
                assets = [...new Set([...assets, ...extra])]
            }

            if (assets.length === 0) {
                return {error: "Missing asset parameter"}
            }

            const result = []

            for (let raw of assets) {
                let code, issuer

                if (raw === 'XLM' || raw === 'native') {
                    result.push(KNOWN_ASSETS['XLM'])
                    continue
                }

                if (raw.includes(':')) {
                    [code, issuer] = raw.split(':')
                } else if (raw.includes('-')) {
                    [code, issuer] = raw.split('-')
                } else {
                    code = raw
                    issuer = null
                }

                const key = `${code}:${issuer || ''}`
                if (KNOWN_ASSETS[key]) {
                    result.push(KNOWN_ASSETS[key])
                } else {
                    result.push({
                        code,
                        issuer,
                        name: code,
                        domain: null,
                        image: `https://stellar.expert/img/vendor/${code.toLowerCase()}.png`,
                        decimals: 7
                    })
                }
            }

            return {records: result}
        })
}
