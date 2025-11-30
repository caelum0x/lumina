const {registerRoute} = require('../router')
const apiCache = require('../api-cache')
const TxQuery = require('../../business-logic/archive/tx-query')
const horizonAdapter = require('../../connectors/horizon-adapter')

apiCache.createBucket('tx', 4000, '10 seconds')

module.exports = function (app) {
    registerRoute(app,
        'tx',
        {cache: 'tx', billingCategory: 'txHistory'},
        async ({params, path, query}) => {
            const result = await new TxQuery(params.network, path, query).toArray()
            // Fallback to Horizon if no local data and account filter is present
            if (result._embedded?.records?.length === 0 && query.account) {
                try {
                    const account = Array.isArray(query.account) ? query.account[0] : query.account
                    const limit = query.limit || 40
                    const txs = await horizonAdapter.getAccountTransactions(params.network, account, limit)
                    if (txs?.length > 0) {
                        result._embedded.records = txs.map(tx => ({
                            id: tx.id || tx.hash,
                            hash: tx.hash,
                            ledger: tx.ledger_attr || tx.ledger,
                            ts: tx.created_at ? Math.floor(new Date(tx.created_at).getTime() / 1000) : undefined,
                            successful: tx.successful,
                            paging_token: tx.paging_token,
                            body: tx.envelope_xdr,
                            result: tx.result_xdr,
                            meta: tx.result_meta_xdr,
                            _fromHorizon: true
                        }))
                        result._meta = {fallback: 'horizon'}
                    }
                } catch (e) {
                    // Ignore fallback errors
                }
            }
            return result
        })

    registerRoute(app,
        'tx/count',
        {cache: 'tx'/*, billingCategory: 'txHistory'*/},
        async ({params, path, query}) => {
            const res = await new TxQuery(params.network, path, query).count()
            return {
                transactions: res
            }
        })

    //transactions for a given ledger sequence
    registerRoute(app,
        'ledger/:sequence/tx',
        {cache: 'tx'},
        ({params}) => TxQuery.fetchLedgerTransactions(params.network, params.sequence))

    // Transaction stream endpoint (SSE) - must be before /tx/:id route
    app.get('/explorer/:network/tx/stream', async (req, res) => {
        const network = req.params.network || 'public'
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        })

        let lastCursor = 'now'
        let isActive = true

        const poll = async () => {
            if (!isActive) return
            try {
                const txs = await horizonAdapter.getTransactions(network, 5, lastCursor)
                if (txs?.length > 0) {
                    txs.forEach(tx => {
                        res.write(`data: ${JSON.stringify({
                            hash: tx.hash || tx.id,
                            time: tx.created_at,
                            ops: tx.operation_count,
                            source: tx.source_account ? tx.source_account.slice(0, 8) + '...' : 'unknown',
                            successful: tx.successful
                        })}\n\n`)
                    })
                    lastCursor = txs[txs.length - 1].paging_token
                }
            } catch (e) {
                console.error('Transaction stream error:', e.message)
            }
        }

        poll()
        const interval = setInterval(poll, 2000)
        req.on('close', () => {
            isActive = false
            clearInterval(interval)
            res.end()
        })
    })

    //transaction by id or hash - MUST be last to not conflict with other routes
    app.get('/explorer/:network/tx/:id', async (req, res) => {
        const {network, id} = req.params
        
        // Reject reserved keywords
        if (id === 'stream' || id === 'recent' || id === 'count') {
            return res.status(404).json({
                error: 'Not Found',
                message: `Invalid transaction ID: ${id}`,
                status: 404
            })
        }
        
        // Validate transaction hash format
        if (!id || id.length < 8) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid transaction hash. Transaction hash must be at least 8 characters.',
                status: 400
            })
        }
        
        try {
            console.log(`Fetching transaction ${id} from Horizon for network ${network}`)
            const tx = await horizonAdapter.getTransaction(network, id)
            console.log(`Successfully fetched transaction ${id}`)
            res.json(tx)
        } catch (err) {
            console.error(`Transaction ${id} fetch failed:`, {
                message: err.message,
                status: err.status,
                stack: err.stack,
                originalError: err.originalError,
                hash: err.hash,
                hashLength: err.hashLength
            })
            
            // Provide more helpful error message
            const errorMessage = id.length < 64 
                ? `Transaction hash appears incomplete. Expected 64 characters, got ${id.length}.`
                : `Transaction ${id} not found on the ${network} ledger. ${err.originalError ? 'Error: ' + err.originalError : ''}`
            
            res.status(err.status || 404).json({
                error: 'Not Found',
                message: errorMessage,
                status: err.status || 404,
                receivedHash: id,
                hashLength: id.length,
                details: err.originalError || err.message
            })
        }
    })
}
