// api/routes/unified-search.js — GLOBAL SEARCH FOR EVERYTHING ON STELLAR
const {registerRoute} = require('../router')
const fetch = require('node-fetch')
const horizonAdapter = require('../../connectors/horizon-adapter')
const {queryAssetStats} = require('../../business-logic/asset/asset-stats')
const {queryAccountStats} = require('../../business-logic/account/account-stats')

const EXPERT = 'https://api.stellar.expert/explorer/public'

// Cache for 30 seconds
const cache = new Map()
const getCached = (key, fn) => {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.ts < 30000) return Promise.resolve(hit.data)
    return fn().then(data => {
        cache.set(key, {data, ts: Date.now()})
        return data
    })
}

// Format asset for UI
const formatAsset = (s) => s === 'native' ? 'XLM' : s

module.exports = function (app) {
    registerRoute(app,
        'search/unified',
        {cache: false, cors: 'open'},
        async ({params, query}) => {
            let q = (query.q || query.query || query.search || '').trim()
            const network = params.network || 'public'
            
            if (!q) {
                return {
                    records: [],
                    suggestions: [
                        {text: 'XLM', type: 'asset'},
                        {text: 'USDC', type: 'asset'},
                        {text: 'Top pools', type: 'link', url: '/liquidity-pools'},
                        {text: 'Whales', type: 'link', url: '/analytics/whales'},
                        {text: 'Soroban stats', type: 'link', url: '/network/soroban'}
                    ]
                }
            }

            const results = []
            const lower = q.toLowerCase()

            try {
                // 1. Account (56-char public key starting with G)
                if (q.length === 56 && q.startsWith('G')) {
                    try {
                        const acc = await horizonAdapter.getAccount(network, q)
                        if (acc) {
                            const xlmBalance = acc.balances.find(b => b.asset_type === 'native')?.balance || 0
                            results.push({
                                type: 'account',
                                title: `Account ${q.slice(0, 8)}…${q.slice(-6)}`,
                                subtitle: `${parseFloat(xlmBalance).toFixed(2)} XLM`,
                                url: `/explorer/${network}/account/${q}`,
                                icon: 'user',
                                priority: 10
                            })
                        }
                    } catch (e) {
                        // Account not found
                    }
                }

                // 2. Transaction hash (64 hex chars)
                if (q.length === 64 && /^[0-9a-fA-F]+$/.test(q)) {
                    try {
                        const tx = await horizonAdapter.getTransaction(network, q)
                        if (tx) {
                            results.push({
                                type: 'transaction',
                                title: `Transaction ${q.slice(0, 8)}…`,
                                subtitle: `${tx.operation_count} ops • ${new Date(tx.created_at).toLocaleDateString()}`,
                                url: `/explorer/${network}/tx/${q}`,
                                icon: 'exchange',
                                priority: 10
                            })
                        }
                    } catch (e) {
                        // Transaction not found
                    }
                }

                // 3. Ledger (numeric, 7+ digits)
                if (/^\d+$/.test(q) && q.length >= 7) {
                    try {
                        const ledger = await horizonAdapter.getLedger(network, parseInt(q))
                        if (ledger) {
                            results.push({
                                type: 'ledger',
                                title: `Ledger ${ledger.sequence.toLocaleString()}`,
                                subtitle: `${ledger.successful_transaction_count} txs • ${ledger.operation_count} ops`,
                                url: `/explorer/${network}/ledger/${ledger.sequence}`,
                                icon: 'book',
                                priority: 9
                            })
                        }
                    } catch (e) {
                        // Ledger not found
                    }
                }

                // 4. Assets - Try exact match first, then fuzzy
                if (q.length >= 2 && q.length <= 12) {
                    try {
                        // Try exact match
                        const exactAsset = await queryAssetStats(network, q.toUpperCase())
                        if (exactAsset) {
                            results.push({
                                type: 'asset',
                                title: exactAsset.asset || q.toUpperCase(),
                                subtitle: `Supply: ${parseFloat(exactAsset.supply || 0).toLocaleString()}`,
                                url: `/explorer/${network}/asset/${exactAsset.asset || q}`,
                                icon: 'coins',
                                priority: 10
                            })
                        }
                    } catch (e) {
                        // Try fuzzy search
                        try {
                            const assets = await horizonAdapter.getAssets(network, 200)
                            const matches = assets.filter(a =>
                                a.asset_code.toLowerCase().includes(lower)
                            ).slice(0, 5)

                            matches.forEach(a => {
                                results.push({
                                    type: 'asset',
                                    title: a.asset_code,
                                    subtitle: `${parseInt(a.num_accounts || 0).toLocaleString()} holders`,
                                    url: `/explorer/${network}/asset/${a.asset_code}-${a.asset_issuer}`,
                                    icon: 'coins',
                                    priority: 8
                                })
                            })
                        } catch (err) {
                            console.error('Fuzzy asset search failed:', err.message)
                        }
                    }
                }

                // 5. Liquidity Pools
                if (/pool|lp|liquidity/i.test(q) || q.length === 64) {
                    try {
                        const pools = await horizonAdapter.getLiquidityPools(network, 10)
                        pools.forEach(pool => {
                            const assets = pool.reserves.map(r => formatAsset(r.asset)).join(' / ')
                            const tvl = pool.reserves.reduce((s, r) => s + parseFloat(r.amount), 0).toFixed(0)
                            if (assets.toLowerCase().includes(lower) || pool.id.includes(q)) {
                                results.push({
                                    type: 'pool',
                                    title: assets,
                                    subtitle: `TVL ~${tvl} XLM • Fee ${pool.fee_bp / 100}%`,
                                    url: `/explorer/${network}/liquidity-pool/${pool.id}`,
                                    icon: 'tint',
                                    priority: 7
                                })
                            }
                        })
                    } catch (e) {
                        // Pools not available
                    }
                }

                // 6. Soroban Contracts (56-char starting with C)
                if (q.length === 56 && q.startsWith('C')) {
                    results.push({
                        type: 'contract',
                        title: `Soroban Contract ${q.slice(0, 8)}…`,
                        subtitle: 'Smart contract on Stellar',
                        url: `/explorer/${network}/contract/${q}`,
                        icon: 'cogs',
                        priority: 10
                    })
                }

                // 7. AI Suggestions (natural language)
                const aiSuggestions = []
                if (/whale|rich|big|large/i.test(q)) {
                    aiSuggestions.push({
                        type: 'suggestion',
                        title: 'Top 100 Whales',
                        subtitle: 'Accounts with largest XLM holdings',
                        url: `/explorer/${network}/analytics/whales`,
                        icon: 'chart-line',
                        priority: 5
                    })
                }
                if (/pool|lp|liquidity/i.test(q)) {
                    aiSuggestions.push({
                        type: 'suggestion',
                        title: 'Top Liquidity Pools',
                        subtitle: 'Sorted by TVL',
                        url: `/explorer/${network}/liquidity-pools`,
                        icon: 'tint',
                        priority: 5
                    })
                }
                if (/usdc|usd|stable/i.test(q)) {
                    aiSuggestions.push({
                        type: 'suggestion',
                        title: 'USDC Token',
                        subtitle: 'Circle USD Coin on Stellar',
                        url: `/explorer/${network}/asset/USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`,
                        icon: 'dollar-sign',
                        priority: 5
                    })
                }
                if (/soroban|contract|wasm/i.test(q)) {
                    aiSuggestions.push({
                        type: 'suggestion',
                        title: 'Soroban Statistics',
                        subtitle: 'Smart contract analytics',
                        url: `/explorer/${network}/network/soroban`,
                        icon: 'cogs',
                        priority: 5
                    })
                }

                // Combine and sort by priority
                const allResults = [...results, ...aiSuggestions]
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, 15)

                return {
                    records: allResults,
                    suggestions: allResults.length === 0 ? [
                        {text: 'Try: XLM, USDC, AQUA', type: 'hint'},
                        {text: 'Account addresses start with G', type: 'hint'},
                        {text: 'Transaction hashes are 64 hex characters', type: 'hint'},
                        {text: 'Contract addresses start with C', type: 'hint'}
                    ] : [],
                    _meta: {
                        query: q,
                        count: allResults.length,
                        network: network
                    }
                }

            } catch (err) {
                console.error('Unified search error:', err.message)
                return {
                    records: [],
                    suggestions: [
                        {text: 'XLM', type: 'asset'},
                        {text: 'USDC', type: 'asset'},
                        {text: 'AQUA', type: 'asset'},
                        {text: 'Top pools', type: 'link'}
                    ],
                    error: err.message
                }
            }
        })
}
