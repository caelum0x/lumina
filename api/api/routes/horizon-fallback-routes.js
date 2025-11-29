const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

/**
 * Horizon-only fallback routes for when MongoDB is empty
 * These provide immediate functionality without requiring historical data
 */
module.exports = function (app) {
    // Override asset endpoint with Horizon-only version
    registerRoute(app,
        'asset',
        {cache: 'stats', cors: 'open'},
        async ({params, req}) => {
            try {
                const limit = parseInt(req.query.limit) || 20
                const cursor = req.query.cursor
                const assets = await horizonAdapter.getAssets(params.network, limit, cursor)
                
                return {
                    _embedded: {
                        records: assets.map(a => ({
                            asset: `${a.asset_code}:${a.asset_issuer}`,
                            code: a.asset_code,
                            issuer: a.asset_issuer,
                            accounts: parseInt(a.num_accounts) || 0,
                            supply: parseFloat(a.amount) || 0,
                            domain: a.home_domain || null,
                            rating: 3,
                            paging_token: a.paging_token
                        }))
                    },
                    _links: {
                        self: {href: req.path},
                        next: {
                            href: assets.length >= limit ? 
                                `${req.path}?cursor=${assets[assets.length-1].paging_token}&limit=${limit}` : 
                                ''
                        },
                        prev: {href: ''}
                    }
                }
            } catch (e) {
                console.error('[Horizon Fallback] Assets error:', e.message)
                return {
                    _embedded: {records: []},
                    _links: {self: {href: req.path}, next: {href: ''}, prev: {href: ''}}
                }
            }
        })
}
