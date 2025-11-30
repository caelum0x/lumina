// api/routes/unified-search.js — GLOBAL SEARCH FOR EVERYTHING ON STELLAR
const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')
const sorobanRpc = require('../../connectors/soroban-rpc')
const {queryAssetStats} = require('../../business-logic/asset/asset-stats')

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

// Detect query type
const detectType = (q) => {
    if (q.length === 56 && q.startsWith('G')) return 'account'
    if (q.length === 56 && q.startsWith('C')) return 'contract'
    if (q.length === 64 && /^[0-9a-fA-F]+$/.test(q)) return 'transaction'
    if (/^\d+$/.test(q) && q.length >= 7) return 'ledger'
    if (q.length >= 2 && q.length <= 12) return 'asset'
    return 'fuzzy'
}

module.exports = function (app) {
    registerRoute(app,
        'search/unified',
        {cache: false, cors: 'open'},
        async ({params, query}) => {
            let q = (query.q || query.query || query.search || '').trim()
            const network = params.network || 'public'
            const limit = parseInt(query.limit) || 15
            
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
            const type = detectType(q)

            try {
                // 1. Account (56-char public key starting with G)
                if (type === 'account') {
                    try {
                        const acc = await horizonAdapter.getAccount(network, q)
                        if (acc) {
                            const xlmBalance = acc.balances.find(b => b.asset_type === 'native')?.balance || 0
                            results.push({
                                type: 'account',
                                title: `Account ${q.slice(0, 8)}…${q.slice(-6)}`,
                                subtitle: `${parseFloat(xlmBalance).toFixed(2)} XLM • ${acc.balances.length} assets`,
                                url: `/explorer/${network}/account/${q}`,
                                icon: 'user',
                                priority: 10
                            })
                        }
                    } catch (e) {}
                }

                // 2. Transaction hash (64 hex chars)
                if (type === 'transaction') {
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
                    } catch (e) {}
                }

                // 3. Ledger (numeric, 7+ digits)
                if (type === 'ledger') {
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
                    } catch (e) {}
                }

                // 4. Assets - Try exact match first, then fuzzy
                if (type === 'asset' || type === 'fuzzy') {
                    try {
                        const assets = await horizonAdapter.getAssets(network, 200)
                        const matches = assets.filter(a =>
                            a.asset_code.toLowerCase().includes(lower)
                        ).slice(0, 5)

                        matches.forEach(a => {
                            results.push({
                                type: 'asset',
                                title: a.asset_code,
                                subtitle: `${parseInt(a.num_accounts || 0).toLocaleString()} holders • ${parseFloat(a.amount || 0).toFixed(0)} supply`,
                                url: `/explorer/${network}/asset/${a.asset_code}-${a.asset_issuer}`,
                                icon: 'coins',
                                priority: 8
                            })
                        })
                    } catch (err) {}
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
                    } catch (e) {}
                }

                // 6. Soroban Contracts (56-char starting with C)
                if (type === 'contract') {
                    try {
                        // Get contract info from RPC
                        const contract = await sorobanRpc.getContract(network, q)
                        results.push({
                            type: 'contract',
                            title: `Contract ${q.slice(0, 8)}…${q.slice(-6)}`,
                            subtitle: contract.executable?.wasm_hash ? `WASM: ${contract.executable.wasm_hash.slice(0, 8)}…` : 'Smart contract',
                            url: `/explorer/${network}/contract/${q}`,
                            icon: 'cogs',
                            priority: 10
                        })

                        // Get recent events for this contract
                        try {
                            const latestLedger = await sorobanRpc.getLatestLedger(network)
                            const startLedger = Math.max(1, latestLedger.sequence - 1000)
                            const events = await sorobanRpc.getEvents(network, startLedger, [{
                                type: 'contract',
                                contractIds: [q]
                            }], 5)
                            
                            if (events.events && events.events.length > 0) {
                                results.push({
                                    type: 'contract_events',
                                    title: `${events.events.length} Recent Events`,
                                    subtitle: `Last event at ledger ${events.events[0].ledger}`,
                                    url: `/explorer/${network}/contract/${q}#events`,
                                    icon: 'bolt',
                                    priority: 8
                                })
                            }
                        } catch (e) {}
                    } catch (e) {
                        // Contract not found or RPC error
                        results.push({
                            type: 'contract',
                            title: `Contract ${q.slice(0, 8)}…`,
                            subtitle: 'Smart contract on Stellar',
                            url: `/explorer/${network}/contract/${q}`,
                            icon: 'cogs',
                            priority: 10
                        })
                    }
                }

                // 7. Soroban Deployments & Invocations (keyword search)
                if (/soroban|contract|deploy|invoke|wasm/i.test(q)) {
                    try {
                        // Get recent contract deployments
                        if (/deploy|contract/i.test(q)) {
                            const deployOps = await horizonAdapter.getOperations(network, 10, null, null)
                            const deployments = deployOps.filter(op => op.type === 'invoke_host_function' && 
                                (op.function === 'HostFunctionTypeHostFunctionTypeCreateContract' || 
                                 op.function === 'create_contract'))
                            
                            deployments.slice(0, 3).forEach(op => {
                                results.push({
                                    type: 'deployment',
                                    title: `Contract Deployment`,
                                    subtitle: `Ledger ${op.transaction?.ledger || 'N/A'} • ${new Date(op.created_at).toLocaleDateString()}`,
                                    url: `/explorer/${network}/operation/${op.id}`,
                                    icon: 'upload',
                                    priority: 7
                                })
                            })
                        }

                        // Get recent invocations
                        if (/invoke|call/i.test(q)) {
                            const invokeOps = await horizonAdapter.getOperations(network, 10, null, null)
                            const invocations = invokeOps.filter(op => op.type === 'invoke_host_function')
                            
                            invocations.slice(0, 3).forEach(op => {
                                results.push({
                                    type: 'invocation',
                                    title: `Contract Invocation`,
                                    subtitle: `${new Date(op.created_at).toLocaleDateString()}`,
                                    url: `/explorer/${network}/operation/${op.id}`,
                                    icon: 'play',
                                    priority: 6
                                })
                            })
                        }
                    } catch (e) {}
                }

                // 8. Operations (if searching by type)
                if (/operation|payment|create_account|invoke/i.test(q)) {
                    try {
                        const ops = await horizonAdapter.getOperations(network, 5)
                        ops.slice(0, 3).forEach(op => {
                            results.push({
                                type: 'operation',
                                title: `${op.type.replace(/_/g, ' ')}`,
                                subtitle: `${new Date(op.created_at).toLocaleString()}`,
                                url: `/explorer/${network}/operation/${op.id}`,
                                icon: 'cog',
                                priority: 6
                            })
                        })
                    } catch (e) {}
                }

                // 8. Offers (if searching by offer ID or "offer")
                if (/offer/i.test(q) || (/^\d+$/.test(q) && q.length < 7)) {
                    try {
                        const offers = await horizonAdapter.getOffers(network, {limit: 5})
                        offers.slice(0, 3).forEach(offer => {
                            results.push({
                                type: 'offer',
                                title: `Offer #${offer.id}`,
                                subtitle: `${offer.selling.asset_code || 'XLM'} → ${offer.buying.asset_code || 'XLM'}`,
                                url: `/explorer/${network}/offer/${offer.id}`,
                                icon: 'handshake',
                                priority: 6
                            })
                        })
                    } catch (e) {}
                }

                // 9. Payments (if account-related search)
                if (type === 'account' && results.length > 0) {
                    try {
                        const payments = await horizonAdapter.getAccountPayments(network, q, 3)
                        payments.forEach(p => {
                            results.push({
                                type: 'payment',
                                title: `Payment ${parseFloat(p.amount || 0).toFixed(2)} ${p.asset_code || 'XLM'}`,
                                subtitle: `${new Date(p.created_at).toLocaleDateString()}`,
                                url: `/explorer/${network}/tx/${p.transaction_hash}`,
                                icon: 'money-bill',
                                priority: 5
                            })
                        })
                    } catch (e) {}
                }

                // 10. Effects (if account-related search)
                if (type === 'account' && results.length > 0) {
                    try {
                        const effects = await horizonAdapter.getAccountEffects(network, q, 3)
                        effects.forEach(e => {
                            results.push({
                                type: 'effect',
                                title: e.type.replace(/_/g, ' '),
                                subtitle: `${new Date(e.created_at).toLocaleDateString()}`,
                                url: `/explorer/${network}/tx/${e.transaction_hash || e.id}`,
                                icon: 'bolt',
                                priority: 4
                            })
                        })
                    } catch (err) {}
                }

                // 11. Claimable Balances
                if (/claimable|balance/i.test(q) || (q.length === 56 && !q.startsWith('G') && !q.startsWith('C'))) {
                    try {
                        const balances = await horizonAdapter.getClaimableBalances(network, {limit: 3})
                        balances.forEach(b => {
                            results.push({
                                type: 'claimable_balance',
                                title: `Claimable ${b.amount} ${b.asset.split(':')[0] || 'XLM'}`,
                                subtitle: `${b.claimants.length} claimants`,
                                url: `/explorer/${network}/claimable-balance/${b.id}`,
                                icon: 'gift',
                                priority: 6
                            })
                        })
                    } catch (e) {}
                }

                // 12. AI Suggestions (natural language)
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
                    aiSuggestions.push({
                        type: 'suggestion',
                        title: 'Recent Contract Deployments',
                        subtitle: 'Latest smart contracts on Stellar',
                        url: `/explorer/${network}/operations?type=invoke_host_function`,
                        icon: 'upload',
                        priority: 5
                    })
                }
                if (/event|emit/i.test(q) && type === 'contract') {
                    aiSuggestions.push({
                        type: 'suggestion',
                        title: 'Contract Events',
                        subtitle: 'View emitted events for this contract',
                        url: `/explorer/${network}/contract/${q}#events`,
                        icon: 'bolt',
                        priority: 5
                    })
                }
                if (/state|storage|data/i.test(q) && type === 'contract') {
                    aiSuggestions.push({
                        type: 'suggestion',
                        title: 'Contract State',
                        subtitle: 'View persistent storage data',
                        url: `/explorer/${network}/contract/${q}#state`,
                        icon: 'database',
                        priority: 5
                    })
                }

                // Combine and sort by priority
                const allResults = [...results, ...aiSuggestions]
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, limit)

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
                        network: network,
                        type: type
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
