const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

// Helper: Format Horizon asset string to UI-compatible format
// UI only accepts: "XLM" or "CODE:ISSUER" (not "credit_alphanum4:CODE:ISSUER")
function formatAssetForUI(assetString) {
    // native asset
    if (assetString === 'native') return 'XLM';
    
    // Horizon format: credit_alphanum4:USDC:GA5ZSEJY...
    // or credit_alphanum12:MYTOKEN:GBLONG...
    const match = assetString.match(/^credit_alphanum\d+:([^:]+):(.+)$/);
    if (!match) {
        // Fallback – try to extract from any format
        if (assetString.includes(':')) {
            const parts = assetString.split(':');
            if (parts.length >= 3) {
                // credit_alphanumX:CODE:ISSUER format
                return `${parts[parts.length - 2]}:${parts[parts.length - 1]}`;
            } else if (parts.length === 2) {
                // CODE:ISSUER format (already correct)
                return assetString;
            }
        }
        // If it's just an issuer address, we can't format it properly
        // Return a safe fallback
        return 'UNKNOWN:UNKNOWN';
    }
    
    const code = match[1];
    const issuer = match[2];
    
    return `${code}:${issuer}`;
}

console.log('[POOLS-LIVE] Module loaded, registering routes...')

module.exports = function (app) {
    console.log('[POOLS-LIVE] Registering liquidity-pool endpoint')
    // Main pools list endpoint (what frontend calls)
    registerRoute(app,
        'liquidity-pool',
        {cache: '', cors: 'open'},
        async ({params, query = {}}) => {
            try {
                const pools = await horizonAdapter.getLiquidityPools(params.network, query.limit || 50, query.cursor)
                console.log('[POOLS DEBUG] First pool reserves:', JSON.stringify(pools[0]?.reserves))
                const result = {
                    _embedded: {
                        records: pools.map(p => ({
                            id: p.id,
                            assets: p.reserves.map(r => {
                                const formattedAsset = formatAssetForUI(r.asset);
                                console.log('[POOLS DEBUG] Reserve asset:', r.asset, '->', formattedAsset)
                                return {
                                    asset: formattedAsset, // ← FIXED: Use formatted asset
                                    amount: r.amount
                                }
                            }),
                            total_shares: parseFloat(p.total_shares),
                            total_trustlines: p.total_trustlines,
                            fee_bp: p.fee_bp,
                            total_value_locked: 0,
                            earned_value: {'7d': 0}
                        }))
                    },
                    _links: {
                        self: {href: ''},
                        next: {href: ''},
                        prev: {href: ''}
                    }
                }
                console.log('[POOLS DEBUG] Returning assets:', JSON.stringify(result._embedded.records[0]?.assets))
                return result
            } catch (e) {
                return {_embedded: {records: []}, _links: {}}
            }
        })

    // Top pools by volume
    registerRoute(app,
        'liquidity-pools/top',
        {cache: 'stats', cors: 'open'},
        async ({params}) => {
            try {
                const pools = await horizonAdapter.getLiquidityPools(params.network, 20)
                return {
                    _embedded: {
                        records: pools.map(p => ({
                            id: p.id,
                            assets: p.reserves.map(r => ({
                                asset: formatAssetForUI(r.asset), // ← FIXED: Use formatted asset
                                amount: r.amount
                            })),
                            total_shares: parseFloat(p.total_shares),
                            total_trustlines: p.total_trustlines,
                            fee_bp: p.fee_bp
                        }))
                    }
                }
            } catch (e) {
                return {_embedded: {records: []}}
            }
        })

    // Live pool swap stream
    app.get('/explorer/:network/liquidity-pools/stream', (req, res) => {
        console.log('[Pool Stream] Client connected')
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        })

        res.write('data: {"status":"connected"}\n\n')
        console.log('[Pool Stream] Sent connection message')

        let cursor = 'now'
        const poll = async () => {
            try {
                const ops = await horizonAdapter.getOperations(req.params.network, 20, cursor)
                for (const op of ops) {
                    if (op.type === 'liquidity_pool_deposit' || op.type === 'liquidity_pool_withdraw') {
                        res.write(`data: ${JSON.stringify({
                            type: 'pool_swap',
                            pool_id: op.liquidity_pool_id,
                            timestamp: op.created_at
                        })}\n\n`)
                    }
                    cursor = op.paging_token
                }
            } catch (e) {}
        }

        poll()
        const interval = setInterval(poll, 3000)
        req.on('close', () => clearInterval(interval))
    })
}
