const {registerRoute} = require('../router')
const fetch = require('node-fetch')

module.exports = function (app) {
    // List all assets - proxy from StellarExpert for enriched data
    registerRoute(app,
        'asset/horizon/list',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const limit = query.limit || 50
            const cursor = query.cursor || ''
            
            const response = await fetch(`https://api.stellar.expert/explorer/${params.network}/asset?limit=${limit}&cursor=${cursor}&order=desc&sort=rating`)
            const data = await response.json()
            
            // Transform to match frontend expectations
            const transformed = (data._embedded?.records || []).map(a => ({
                asset: a.asset,
                supply: a.supply,
                created: a.created,
                trustlines: a.trustlines || [0, 0, 0],
                payments: a.payments || 0,
                price7d: a.price7d || []
            }))
            
            return {
                _embedded: {records: transformed},
                _links: data._links || {
                    self: {href: ''},
                    next: {href: ''},
                    prev: {href: ''}
                }
            }
        })

    // Get single asset details
    registerRoute(app,
        'asset/horizon/:code/:issuer',
        {cache: 'stats', cors: 'open'},
        async ({params}) => {
            const asset = params.code === 'XLM' ? 'XLM' : `${params.code}:${params.issuer}`
            const response = await fetch(`https://api.stellar.expert/explorer/${params.network}/asset/${asset}`)
            return await response.json()
        })
}
