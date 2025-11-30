(async function () {
    const http = require('http')
    const express = require('express')
    const bodyParser = require('body-parser')
    const qs = require('qs')

    process.env.TZ = 'Etc/UTC'

    // Validate environment variables
    try {
        const {validateEnvironment} = require('./utils/env-validator')
        validateEnvironment(process.env.NODE_ENV === 'production')
    } catch (error) {
        console.error('❌ Environment validation failed:', error.message)
        if (process.env.NODE_ENV === 'production') {
            process.exit(1)
        }
    }

    await require('./connectors/mongodb-connector').init()
    await require('./connectors/elastic-connector').enumerateIndexes()
    
    // Initialize Redis
    const redis = require('./connectors/redis-connector')
    await redis.connect().catch(err => console.error('Redis connection failed:', err))
    
    const {port} = require('./app.config')

    const proxyValidator = require('./business-logic/proxy-validator')

    const app = express()
    app.disable('x-powered-by')
    
    // Enable qs query parser for array parameters like ?asset[]=XLM
    app.set('query parser', (str) => qs.parse(str, { arrayLimit: 1000 }))

    // Initialize Sentry (optional - only if package is installed)
    try {
        const {initSentry, errorHandler} = require('./sentry')
        initSentry(app)
        app.sentryErrorHandler = errorHandler
    } catch (err) {
        console.log('Sentry not available (optional)')
        app.sentryErrorHandler = null
    }

    app.use(proxyValidator)
    if (process.env.MODE === 'development') {
        const logger = require('morgan')
        app.use(logger('dev'))
    }

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))

    // CORS middleware
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        if (req.method === 'OPTIONS') return res.sendStatus(200)
        next()
    })

    // Health check endpoint
    app.get('/', (req, res) => {
        res.json({
            status: 'ok',
            service: 'Lumina 3D Modern Stellar Explorer API',
            version: '0.28.7',
            timestamp: new Date().toISOString()
        })
    })

    //rewrite requests from the old path convention format
    app.use(function (req, res, next) {
        if (req.url.startsWith('/api/')) {
            req.url = req.url.replace('/api/', '/')
        }
        next()
    })
    
    // Request logging for debugging
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
        next()
    })
    
    //register API routes
    require('./api/routes/explorer-routes')(app)
    require('./api/routes/relation-routes')(app)
    require('./api/routes/ticker-routes')(app)
    require('./api/routes/payments-routes')(app)
    require('./api/routes/directory-routes')(app)
    require('./api/routes/price-routes')(app)
    require('./api/routes/demolisher-routes')(app)
    require('./api/routes/asset-list-routes')(app)
    require('./api/routes/server-info-routes')(app)
    require('./api/routes/stream-routes')(app)
    require('./api/routes/health-routes')(app)
    require('./api/routes/pools-live')(app)
    require('./api/routes/unified-search')(app)
    require('./api/routes/asset-details')(app)
    require('./api/routes/latest-transactions')(app)
    require('./api/routes/oauth-routes')(app)
    require('./api/routes/domain-meta-routes')(app)
    
    // Explorer routes for core entities
    require('./api/routes/account-explorer-routes')(app)
    require('./api/routes/asset-explorer-routes')(app)
    require('./api/routes/tx-routes')(app)
    require('./api/routes/ledger-explorer-routes')(app)
    require('./api/routes/market-explorer-routes')(app)
    require('./api/routes/offer-explorer-routes')(app)
    require('./api/routes/liquidity-pool-explorer-routes')(app)
    require('./api/routes/claimable-balance-explorer-routes')(app)
    
    // Soroban/Contract routes
    require('./api/routes/contract-explorer-routes')(app)
    require('./api/routes/contract-validation-routes')(app)
    require('./api/routes/soroban-search-routes')(app)
    require('./api/routes/contract-data-explorer-routes')(app)
    require('./api/routes/soroban-stats-explorer-routes')(app)
    
    // Search routes
    require('./api/routes/search-routes')(app)
    
    // Chart routes
    require('./api/routes/chart-routes')(app)
    
    // Fee analytics
    require('./api/routes/fee-analytics-routes')(app)
    
    // Address labels
    require('./api/routes/address-labels-routes')(app)
    
    // Network stats
    require('./api/routes/network-stats-routes')(app)
    
    // Mainnet liquidity pools router (alternative endpoint with TVL sorting)
    app.use('/explorer/public', require('./api/routes/liquidity-pools'))
    
    // Metrics endpoint for Prometheus monitoring
    app.use('/explorer/public', require('./api/routes/metrics'))
    
    // Comprehensive Soroban statistics
    app.use('/explorer/public', require('./api/routes/soroban-comprehensive-stats'))
    
    // Soroban stats endpoint (for UI)
    app.use('/explorer/public', require('./api/routes/soroban'))
    
    // Whales, topology, AI
    app.use('/explorer/:network', require('./api/routes/whales'))
    app.use('/explorer/:network', require('./api/routes/topology'))
    app.use('/explorer/:network', require('./api/routes/ai-routes'))
    
    // Horizon routes
    require('./api/routes/account-horizon-routes')(app)
    require('./api/routes/asset-horizon-routes')(app)
    require('./api/routes/horizon-complete-routes')(app)
    require('./api/routes/horizon-direct-assets')(app)
    
    // Stellar Expert proxy
    require('./api/routes/stellarexpert-proxy-routes')(app)
    
    // Horizon fallbacks (must be LAST to act as catch-all)
    require('./api/routes/horizon-fallback-routes')(app)
    require('./api/routes/fee-analytics-routes')(app)
    require('./api/routes/address-labels-routes')(app)

    // Sentry error handler (optional - only if available)
    if (app.sentryErrorHandler) {
        app.use(app.sentryErrorHandler())
    }

    // error handler
    app.use((err, req, res, next) => {
        if (err?.isBlockedByCors)
            return res.status(403).end()
        if (err) {
            console.error(err)
        }
        res.status(500).end()
    })

    //404 handler
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*')
        res.status(404).send('API endpoint was not found')
    })

    const serverPort = parseInt(process.env.PORT || port || '3000')
    app.set('port', serverPort)

    const server = http.createServer(app)

    server.on('listening', () => {
        console.log(`Lumina 3D Modern Stellar Explorer API server started on ${server.address().port} port.`)
        
        // Start background data ingestion
        const {startIngestion} = require('./services/start-ingestion')
        startIngestion(['public'])
        
        console.log('✅ Continuous data ingestion ENABLED')
    })
    
    server.on('error', (error) => {
        if (error.syscall !== 'listen') {
            throw error
        }
        const bind = typeof serverPort === 'string' ? 'Pipe ' + serverPort : 'Port ' + serverPort
        switch (error.code) {
            case 'EACCES':
                console.error(`❌ ${bind} requires elevated privileges`)
                process.exit(1)
                break
            case 'EADDRINUSE':
                console.error(`❌ ${bind} is already in use`)
                process.exit(1)
                break
            default:
                throw error
        }
    })

    process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error)
        // Log to error tracking service in production
        if (process.env.NODE_ENV === 'production') {
            // In production, you might want to gracefully shutdown
            // For now, we'll log and continue
        }
    })

    process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
        // Log to error tracking service in production
    })

    server.listen(serverPort)
})()