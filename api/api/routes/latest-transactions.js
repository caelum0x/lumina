const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

module.exports = function (app) {
    registerRoute(app,
        'transactions/latest',
        {cache: false, cors: 'open'},
        async ({params, query}) => {
            const network = params.network || 'public'
            const limit = parseInt(query.limit) || 20

            try {
                const txs = await horizonAdapter.getTransactions(network, limit)
                
                const records = txs.map(tx => ({
                    id: tx.id,
                    hash: tx.hash || tx.id,
                    ledger: tx.ledger,
                    created_at: tx.created_at,
                    source_account: tx.source_account,
                    operation_count: tx.operation_count,
                    successful: tx.successful
                }))

                return {records, _meta: {count: records.length, network}}
            } catch (err) {
                return {records: [], error: err.message}
            }
        })

    app.get('/explorer/:network/transactions/stream', async (req, res) => {
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
                            source: tx.source_account.slice(0, 8) + '...',
                            successful: tx.successful
                        })}\n\n`)
                    })
                    lastCursor = txs[txs.length - 1].paging_token
                }
            } catch (e) {}
        }

        poll()
        const interval = setInterval(poll, 2000)
        req.on('close', () => {
            isActive = false
            clearInterval(interval)
            res.end()
        })
    })
}
