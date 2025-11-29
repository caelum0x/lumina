const horizonAdapter = require('../../connectors/horizon-adapter')

module.exports = function(app) {
    app.get('/stream/transactions/:network', async (req, res) => {
        const {network} = req.params
        
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('Access-Control-Allow-Origin', '*')
        
        res.write('data: {"status":"connected"}\n\n')
        
        let lastCursor = null
        const sendTransactions = async () => {
            try {
                const txs = await horizonAdapter.getTransactions(network, 10, lastCursor, 'desc')
                if (txs.length > 0) {
                    lastCursor = txs[0].paging_token
                    txs.forEach(tx => {
                        res.write(`data: ${JSON.stringify(tx)}\n\n`)
                    })
                }
            } catch (e) {
                console.error('Stream error:', e.message)
            }
        }
        
        await sendTransactions()
        const interval = setInterval(sendTransactions, 2000)
        
        req.on('close', () => clearInterval(interval))
    })

    app.get('/stream/ledgers/:network', async (req, res) => {
        const {network} = req.params
        
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('Access-Control-Allow-Origin', '*')
        
        res.write('data: {"status":"connected"}\n\n')
        
        let lastSeq = null
        const sendLedgers = async () => {
            try {
                const ledgers = await horizonAdapter.getLedgers(network, 5, null, 'desc')
                if (ledgers.length > 0 && ledgers[0].sequence !== lastSeq) {
                    lastSeq = ledgers[0].sequence
                    ledgers.forEach(ledger => {
                        res.write(`data: ${JSON.stringify(ledger)}\n\n`)
                    })
                }
            } catch (e) {
                console.error('Stream error:', e.message)
            }
        }
        
        await sendLedgers()
        const interval = setInterval(sendLedgers, 5000)
        
        req.on('close', () => clearInterval(interval))
    })
}
