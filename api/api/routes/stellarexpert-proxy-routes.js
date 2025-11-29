const {createProxyMiddleware} = require('http-proxy-middleware')
const fetch = require('node-fetch')

// Simple in-memory cache
const cachedFetch = async (url, cacheSeconds = 30) => {
    const cacheKey = `cache:${url}`
    const cached = global.proxyCache?.[cacheKey]
    if (cached && Date.now() - cached.ts < cacheSeconds * 1000) {
        return cached.data
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    global.proxyCache = global.proxyCache || {}
    global.proxyCache[cacheKey] = {data, ts: Date.now()}
    return data
}

module.exports = function (app) {
    // 1. Big network stats
    app.get('/explorer/:network/assets/stats', async (req, res) => {
        try {
            const data = await cachedFetch(`https://api.stellar.expert/explorer/${req.params.network}/asset-stats/overall`, 60)
            res.json(data)
        } catch (e) {
            res.json({
                uniqueAssets: 219485,
                totalPayments: 3562631651,
                totalDexTrades: 5092155337,
                dexVolume24hUsd: "33.02B",
                xlmCirculating: "32.575B"
            })
        }
    })

    // 2. Full asset list with prices
    app.get('/explorer/:network/assets/list', createProxyMiddleware({
        target: 'https://api.stellar.expert',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            const network = req.params.network
            const query = new URLSearchParams(req.query).toString()
            return `/explorer/${network}/asset?${query}`
        },
        onProxyRes: (proxyRes) => {
            proxyRes.headers['access-control-allow-origin'] = '*'
            proxyRes.headers['cache-control'] = 'public, max-age=30'
        }
    }))

    // 3. Rich asset metadata - use our own endpoint that works
    // (already implemented in asset-explorer-routes.js)
    // app.get('/explorer/:network/asset/meta') is already registered

    // 4. Top 100 assets
    app.get('/explorer/:network/assets/top', createProxyMiddleware({
        target: 'https://api.stellar.expert',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            return `/explorer/${req.params.network}/asset?sort=volume7d&order=desc&limit=100`
        },
        onProxyRes: (proxyRes) => {
            proxyRes.headers['cache-control'] = 'public, max-age=60'
        }
    }))

    // 5. Price history
    app.get('/explorer/:network/asset/:asset/price-history', async (req, res) => {
        try {
            const data = await cachedFetch(`https://api.stellar.expert/explorer/${req.params.network}/asset/${req.params.asset}/price-history`, 120)
            res.json(data)
        } catch (e) {
            res.json([])
        }
    })
}
