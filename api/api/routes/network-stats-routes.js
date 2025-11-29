const {registerRoute} = require('../router')
const horizonAdapter = require('../../connectors/horizon-adapter')

let ledgerWindow = []
let lastCleanup = Date.now()

module.exports = function (app) {
    registerRoute(app,
        'network/stats',
        {cache: false, cors: 'open'},
        async ({params}) => {
            const now = Date.now()
            
            if (now - lastCleanup > 10_000) {
                ledgerWindow = ledgerWindow.filter(l => now - l.ts < 70_000)
                lastCleanup = now
            }

            const ledgers = await horizonAdapter.getLedgers(params.network, 1)
            const ledger = ledgers[0]
            const feeStats = await horizonAdapter.getFeeStats(params.network)
            
            const sequence = ledger.sequence
            const closeTime = new Date(ledger.closed_at).getTime()

            if (!ledgerWindow.some(l => l.seq === sequence)) {
                ledgerWindow.push({
                    seq: sequence,
                    ts: closeTime,
                    txCount: ledger.successful_transaction_count || 0,
                    opCount: ledger.operation_count || 0
                })
                if (ledgerWindow.length > 30) ledgerWindow.shift()
            }

            ledgerWindow.sort((a, b) => a.ts - b.ts)

            const oneMinuteAgo = now - 60_000
            const recentLedgers = ledgerWindow.filter(l => l.ts >= oneMinuteAgo)

            let totalTx = 0
            let totalOp = 0
            recentLedgers.forEach(l => {
                totalTx += l.txCount
                totalOp += l.opCount
            })

            const secondsCovered = recentLedgers.length > 1 
                ? (recentLedgers[recentLedgers.length-1].ts - recentLedgers[0].ts) / 1000 
                : 5
            const tps = totalTx / Math.max(secondsCovered, 1)
            const opsPerSec = totalOp / Math.max(secondsCovered, 1)
            
            return {
                tps: tps.toFixed(1),
                ops_per_sec: opsPerSec.toFixed(1),
                currentLedger: ledger.sequence,
                totalCoins: ledger.total_coins,
                feePool: ledger.fee_pool,
                baseFee: feeStats.max_fee.mode || 100,
                baseReserve: ledger.base_reserve_in_stroops,
                protocolVersion: ledger.protocol_version,
                transactionCount: ledger.successful_transaction_count + ledger.failed_transaction_count,
                operationCount: ledger.operation_count,
                lastLedgerCloseTime: ledger.closed_at,
                feeStats: {
                    min: feeStats.min_accepted_fee,
                    mode: feeStats.max_fee.mode,
                    p10: feeStats.max_fee.p10,
                    p50: feeStats.max_fee.p50,
                    p99: feeStats.max_fee.p99
                }
            }
        })
    
    registerRoute(app,
        'network/top-assets',
        {cache: 'global-stats', cors: 'open'},
        async ({params, query = {}}) => {
            const assets = await horizonAdapter.getAssets(
                params.network,
                query.limit || 100,
                query.cursor
            )
            return {records: assets}
        })
    
    registerRoute(app,
        'network/top-pools',
        {cache: 'global-stats', cors: 'open'},
        async ({params, query = {}}) => {
            const pools = await horizonAdapter.getLiquidityPools(
                params.network,
                query.limit || 50,
                query.cursor
            )
            return {records: pools}
        })
}
