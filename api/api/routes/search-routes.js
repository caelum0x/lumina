const {registerRoute} = require('../router')
const apiCache = require('../api-cache')
const TxQuery = require('../../business-logic/archive/tx-query')
const {queryAccountStats} = require('../../business-logic/account/account-stats')
const {queryAssetStats} = require('../../business-logic/asset/asset-stats')
const {queryContractStats} = require('../../business-logic/contracts/contract-stats')
const {fetchLedger} = require('../../business-logic/ledger/ledger-resolver')
const {Federation, StrKey} = require('@stellar/stellar-sdk')
const horizonAdapter = require('../../connectors/horizon-adapter')

/**
 * Detect search type from query string
 * @param {string} query - Search query
 * @return {Array<string>} - Array of detected search types
 */
function detectSearchType(query) {
    const res = []
    if (!query) return res
    
    if (['xlm', 'native', 'lumen'].includes(query.toLowerCase())) return ['asset']
    
    // Account addresses (G...)
    if (StrKey.isValidEd25519PublicKey(query)) {
        res.push('account')
        res.push('asset') // Could also be asset issuer
    }
    
    // Contract addresses (C...)
    if (StrKey.isValidContract(query)) {
        res.push('contract')
        res.push('asset')
    }
    
    // Transaction hash (64 hex chars)
    if (query.length === 64 && /^[a-f0-9]{64}$/i.test(query)) {
        res.push('transaction')
    }
    
    // Federation address
    if (/^(.+)\*([^.]+\..+)$/.test(query)) {
        res.push('federation')
    }
    
    // Soroban domains
    if (/^([a-z0-9-+]+)\.xlm$/i.test(query)) {
        res.push('sorobandomains')
    }
    
    // Ledger sequence (numeric)
    if (/^\d{1,19}$/.test(query)) {
        if (query.length <= 10) {
            res.push('ledger')
        }
        res.push('offer')
        if (query.length > 10 && query.length < 20) {
            res.push('transaction')
            res.push('operation')
        }
        if (query.length > 12) return res
    }
    
    // Default: search accounts and assets
    if (res.length === 0) {
        res.push('account')
        res.push('asset')
    }
    
    return res
}

apiCache.createBucket('search', 2000, '30 seconds')

/**
 * Unified search endpoint
 * Searches across accounts, assets, transactions, contracts, and ledgers
 */
async function performSearch(network, query) {
    if (!query || query.trim().length === 0) {
        return {
            query: query,
            results: [],
            error: 'Search query is required'
        }
    }

    const searchTypes = detectSearchType(query)
    const results = {
        query: query,
        types: searchTypes,
        accounts: [],
        assets: [],
        transactions: [],
        contracts: [],
        ledgers: []
    }

    try {
        // Search accounts
        if (searchTypes.includes('account')) {
            try {
                // Try as account address
                if (query.length === 56 && /^G[A-Z0-9]{55}$/.test(query)) {
                    let account = null
                    try {
                        account = await queryAccountStats(network, query, {})
                    } catch (e) {
                        // DB failed, try Horizon
                        const horizonAccount = await horizonAdapter.getAccount(network, query)
                        if (horizonAccount) {
                            account = {
                                address: query,
                                balance: horizonAccount.balances?.find(b => b.asset_type === 'native')?.balance || 0
                            }
                        }
                    }
                    if (account) {
                        results.accounts.push({
                            address: query,
                            name: account.name || null,
                            balance: account.balance || 0,
                            link: `/explorer/${network}/account/${query}`
                        })
                    }
                }
            } catch (e) {
                // Account not found, continue
            }
        }

        // Search assets
        if (searchTypes.includes('asset')) {
            try {
                // Try exact match first
                const asset = await queryAssetStats(network, query, {})
                if (asset) {
                    results.assets.push({
                        asset: query,
                        code: asset.code || query,
                        issuer: asset.issuer || null,
                        supply: asset.supply || 0,
                        link: `/explorer/${network}/asset/${query}`
                    })
                }
            } catch (e) {
                // Exact match not found, try fuzzy search
                if (query.length >= 2 && /^[a-z0-9]+$/i.test(query)) {
                    try {
                        const assets = await horizonAdapter.getAssets(network, 200)
                        const matches = assets.filter(a => 
                            a.asset_code.toLowerCase().includes(query.toLowerCase())
                        ).slice(0, 10) // Limit to 10 results
                        
                        for (const match of matches) {
                            results.assets.push({
                                asset: `${match.asset_code}-${match.asset_issuer}`,
                                code: match.asset_code,
                                issuer: match.asset_issuer,
                                supply: parseFloat(match.amount) || 0,
                                accounts: parseInt(match.num_accounts) || 0,
                                link: `/explorer/${network}/asset/${match.asset_code}-${match.asset_issuer}`
                            })
                        }
                    } catch (err) {
                        console.error('Fuzzy asset search failed:', err.message)
                    }
                }
            }
        }

        // Search transactions
        if (searchTypes.includes('transaction')) {
            try {
                const tx = await TxQuery.fetchTx(network, query)
                if (tx) {
                    results.transactions.push({
                        hash: query,
                        id: tx.id || tx.hash,
                        source: tx.source_account || null,
                        amount: tx.amount || 0,
                        link: `/explorer/${network}/tx/${query}`
                    })
                }
            } catch (e) {
                // Transaction not found, continue
            }
        }

        // Search contracts
        if (searchTypes.includes('contract')) {
            try {
                if (query.length === 56 && /^C[A-Z0-9]{55}$/.test(query)) {
                    const contract = await queryContractStats(network, query, {})
                    if (contract) {
                        results.contracts.push({
                            address: query,
                            link: `/explorer/${network}/contract/${query}`
                        })
                    }
                }
            } catch (e) {
                // Contract not found, continue
            }
        }

        // Search ledgers
        if (searchTypes.includes('ledger')) {
            try {
                const sequence = parseInt(query, 10)
                if (!isNaN(sequence) && sequence > 0) {
                    const ledger = await fetchLedger(network, sequence)
                    if (ledger) {
                        results.ledgers.push({
                            sequence: sequence,
                            timestamp: ledger.ts || null,
                            link: `/explorer/${network}/ledger/${sequence}`
                        })
                    }
                }
            } catch (e) {
                // Ledger not found, continue
            }
        }

        // Resolve federation addresses
        if (searchTypes.includes('federation')) {
            try {
                const {account_id} = await Federation.Server.resolve(query)
                if (account_id) {
                    const account = await queryAccountStats(network, account_id, {})
                    if (account) {
                        results.accounts.push({
                            address: account_id,
                            federation: query,
                            name: account.name || null,
                            balance: account.balance || 0,
                            link: `/explorer/${network}/account/${account_id}`
                        })
                    }
                }
            } catch (e) {
                // Federation resolution failed, continue
            }
        }

        // Resolve Soroban domains
        if (searchTypes.includes('sorobandomains')) {
            try {
                const resolved = await fetch(`https://sorobandomains-query.lightsail.network/api/v1/query?q=${encodeURIComponent(query.trim().toLowerCase())}&type=domain`)
                    .then(res => res.json())
                if (resolved?.address) {
                    const account = await queryAccountStats(network, resolved.address, {})
                    if (account) {
                        results.accounts.push({
                            address: resolved.address,
                            domain: query,
                            name: account.name || null,
                            balance: account.balance || 0,
                            link: `/explorer/${network}/account/${resolved.address}`
                        })
                    }
                }
            } catch (e) {
                // Domain resolution failed, continue
            }
        }

    } catch (error) {
        console.error('Search error:', error)
        results.error = error.message || 'Search failed'
    }

    // Calculate total results
    results.total = results.accounts.length + 
                   results.assets.length + 
                   results.transactions.length + 
                   results.contracts.length + 
                   results.ledgers.length

    // Add helpful suggestions if no results found
    if (results.total === 0 && !results.error) {
        results.suggestions = []
        
        if (query.length === 56) {
            if (query.startsWith('G')) {
                results.suggestions.push('This looks like an account address. Make sure it\'s correct.')
                results.suggestions.push('Try searching on Horizon directly if the account is new.')
            } else if (query.startsWith('C')) {
                results.suggestions.push('This looks like a contract address. Make sure it\'s deployed.')
            }
        } else if (query.length === 64 && /^[a-f0-9]+$/i.test(query)) {
            results.suggestions.push('This looks like a transaction hash. Make sure it\'s correct.')
            results.suggestions.push('Recent transactions may take a few seconds to appear.')
        } else if (/^\d+$/.test(query)) {
            results.suggestions.push('This looks like a ledger sequence or operation ID.')
            results.suggestions.push('Try a different number or check if it exists on the network.')
        } else if (query.length >= 2 && query.length <= 12) {
            results.suggestions.push(`Try searching for assets containing "${query.toUpperCase()}"`)
            results.suggestions.push('Use the full asset code for exact matches (e.g., USDC, AQUA)')
        } else {
            results.suggestions.push('Try searching for:')
            results.suggestions.push('  • Asset codes (XLM, USDC, AQUA)')
            results.suggestions.push('  • Account addresses (G...)')
            results.suggestions.push('  • Transaction hashes (64 hex characters)')
            results.suggestions.push('  • Ledger sequences (numbers)')
            results.suggestions.push('  • Contract addresses (C...)')
        }
    }

    return results
}

module.exports = function (app) {
    registerRoute(app,
        'search',
        {cache: 'search', cors: 'open'},
        async ({params, query}) => {
            const searchQuery = query.q || query.query || query.search || ''
            return await performSearch(params.network, searchQuery)
        })
}

