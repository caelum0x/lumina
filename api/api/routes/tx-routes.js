const {registerRoute} = require('../router')
const apiCache = require('../api-cache')
const TxQuery = require('../../business-logic/archive/tx-query')
const {subscribeToTransactions} = require('../../business-logic/archive/tx-stream')
const horizonAdapter = require('../../connectors/horizon-adapter')
const corsMatcher = require('../cors-matcher')

apiCache.createBucket('tx', 4000, '10 seconds')

module.exports = function (app) {
    // Recent transactions from Horizon
    registerRoute(app,
        'tx/recent',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const txs = await horizonAdapter.getTransactions(params.network, query.limit || 50, query.cursor)
            const formatted = txs.map(tx => ({
                hash: tx.hash,
                source: tx.source_account,
                ts: new Date(tx.created_at).getTime(),
                operations: tx.operation_count || 0,
                successful: tx.successful
            }))
            return {_embedded: {records: formatted}}
        })

    registerRoute(app,
        'tx',
        {cache: 'tx', billingCategory: 'txHistory'},
        ({params, path, query}) => new TxQuery(params.network, path, query).toArray())

    registerRoute(app,
        'tx/count',
        {cache: 'tx'/*, billingCategory: 'txHistory'*/},
        async ({params, path, query}) => {
            const res = await new TxQuery(params.network, path, query).count()
            return {
                transactions: res
            }
        })

    //transaction by id or hash
    registerRoute(app,
        'tx/:id',
        {cache: 'tx'},
        ({params}) => TxQuery.fetchTx(params.network, params.id))

    //transactions for a given ledger sequence
    registerRoute(app,
        'ledger/:sequence/tx',
        {cache: 'tx'},
        ({params}) => TxQuery.fetchLedgerTransactions(params.network, params.sequence))

    // Server-Sent Events stream for real-time transactions
    app.get('/explorer/:network/tx/stream', function (req, res) {
        const {network} = req.params
        const {limit = 200, includeEffects = 'false', minAmount} = req.query

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering

        // CORS headers
        const origin = req.header('Origin')
        if (origin && (corsMatcher.match(origin) || req.billingProcessed)) {
            res.setHeader('Access-Control-Allow-Origin', origin)
            res.setHeader('Access-Control-Allow-Credentials', 'true')
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*')
        }

        // Send initial connection message
        res.write('data: {"type":"connected","network":"' + network + '"}\n\n')

        // Subscribe to transaction stream
        const unsubscribe = subscribeToTransactions(network, (transactions) => {
            try {
                // Handle both single transaction and array of transactions
                const txArray = Array.isArray(transactions) ? transactions : [transactions]
                
                // Filter transactions if needed
                let filtered = txArray
                if (minAmount) {
                    const min = parseFloat(minAmount)
                    filtered = txArray.filter(tx => {
                        const amount = parseFloat(tx.amount || tx.total_coins || 0)
                        return amount >= min
                    })
                }

                // Limit the number of transactions sent
                if (filtered.length > limit) {
                    filtered = filtered.slice(-limit)
                }

                // Send each transaction as SSE event
                for (const tx of filtered) {
                    if (!tx) continue // Skip null/undefined transactions
                    try {
                        const data = JSON.stringify(tx)
                        res.write(`data: ${data}\n\n`)
                    } catch (error) {
                        console.error('Error serializing transaction for SSE:', error, tx)
                    }
                }
            } catch (error) {
                console.error('Error processing transaction stream:', error)
                // Send error to client
                try {
                    res.write(`event: error\ndata: ${JSON.stringify({error: 'Failed to process transaction'})}\n\n`)
                } catch (e) {
                    // Connection may be closed
                }
            }
        })

        // Handle client disconnect
        req.on('close', () => {
            try {
                unsubscribe()
            } catch (error) {
                console.error('Error unsubscribing from transaction stream:', error)
            }
            try {
                res.end()
            } catch (error) {
                // Connection already closed
            }
        })

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
            try {
                res.write(': heartbeat\n\n')
            } catch (error) {
                clearInterval(heartbeat)
                try {
                    unsubscribe()
                } catch (e) {
                    console.error('Error unsubscribing on heartbeat failure:', e)
                }
                try {
                    res.end()
                } catch (e) {
                    // Connection already closed
                }
            }
        }, 30000) // Send heartbeat every 30 seconds

        // Clean up on error
        req.on('error', (error) => {
            console.error('SSE request error:', error)
            clearInterval(heartbeat)
            try {
                unsubscribe()
            } catch (e) {
                console.error('Error unsubscribing on request error:', e)
            }
            try {
                res.end()
            } catch (e) {
                // Connection already closed
            }
        })

        // Handle response errors
        res.on('error', (error) => {
            console.error('SSE response error:', error)
            clearInterval(heartbeat)
            try {
                unsubscribe()
            } catch (e) {
                console.error('Error unsubscribing on response error:', e)
            }
        })
    })
}