const horizonAdapter = require('../../connectors/horizon-adapter')
const {validateNetwork} = require('../validators')
const {preparePagedData} = require('../api-helpers')

// Helper: Calculate TVL from reserves (sum amounts, approx XLM price for USD equiv)
function calculateTVL(reserves) {
    return reserves.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toFixed(2)
}

// Helper: Format Horizon asset string to UI-compatible format
// UI only accepts: "XLM" or "CODE:ISSUER" (not "credit_alphanum4:CODE:ISSUER")
function formatAssetForUI(assetString) {
    // native asset
    if (assetString === 'native') return 'XLM';
    
    // Horizon format: credit_alphanum4:USDC:GA5ZSEJY...
    // or credit_alphanum12:MYTOKEN:GBLONG...
    const match = assetString.match(/^credit_alphanum\d+:([^:]+):(.+)$/);
    if (match) {
        const code = match[1];
        const issuer = match[2];
        return `${code}:${issuer}`;
    }
    
    // Already in CODE:ISSUER format (modern Horizon)
    if (assetString.includes(':') && assetString.split(':').length === 2) {
        return assetString;
    }
    
    // Fallback
    return 'UNKNOWN';
}

async function queryAllLiquidityPools(network, basePath = '/liquidity-pool', params = {}) {
    validateNetwork(network)
    const {limit = 20, cursor, order = 'desc', sort = 'total_value_locked'} = params
    
    try {
        // For TVL sorting, fetch more pools to sort client-side
        const fetchLimit = (sort === 'total_value_locked') ? Math.min(200, parseInt(limit) * 4) : parseInt(limit)
        const pools = await horizonAdapter.getLiquidityPools(network, fetchLimit, cursor)
        
        const formatted = pools.map((pool, i) => {
            const reserves = pool.reserves || []
            
            // Transform reserves to UI format
            const transformedReserves = reserves.map(r => ({
                asset: formatAssetForUI(r.asset), // ← THIS LINE FIXES EVERYTHING
                amount: parseFloat(r.amount).toFixed(7)
            }))
            
            // Calculate TVL from reserves
            const tvl = calculateTVL(reserves)
            
            return {
                id: pool.id,
                assets: transformedReserves,
                reserves: transformedReserves, // Also include as 'reserves' for compatibility
                type: pool.type || 'constant_product',
                fee: pool.fee_bp ? (pool.fee_bp / 10000).toFixed(4) : '0.0030', // e.g., 30 bp = 0.0030 (0.3%)
                fee_bp: pool.fee_bp || 30,
                shares: parseFloat(pool.total_shares || 0).toFixed(7),
                total_shares: parseFloat(pool.total_shares || 0).toFixed(7),
                accounts: pool.total_trustlines || 0,
                total_trustlines: pool.total_trustlines || 0,
                trades: 0,
                total_value_locked: parseFloat(tvl), // For sorting
                volume_value: {'1d': 0, '7d': 0},
                earned_value: {'1d': 0, '7d': 0},
                last_modified_ledger: pool.last_modified_ledger,
                last_modified_time: pool.last_modified_time,
                paging_token: pool.paging_token || pool.id || (cursor ? parseInt(cursor) + i + 1 : i + 1)
            }
        })
        
        // Sort by TVL if requested (descending)
        if (sort === 'total_value_locked' && order === 'desc') {
            formatted.sort((a, b) => parseFloat(b.total_value_locked) - parseFloat(a.total_value_locked))
        } else if (sort === 'total_value_locked' && order === 'asc') {
            formatted.sort((a, b) => parseFloat(a.total_value_locked) - parseFloat(b.total_value_locked))
        }
        
        // Limit after sort
        const limitedFormatted = formatted.slice(0, parseInt(limit))

        return preparePagedData(basePath, {cursor, limit, order, sort}, limitedFormatted)
    } catch (error) {
        console.error('Liquidity pool query error:', error.message)
        return preparePagedData(basePath, {cursor, limit, order, sort}, [])
    }
}

module.exports = {queryAllLiquidityPools}