const {registerRoute} = require('../router')
const {queryLedgerStats, query24HLedgerStats} = require('../../business-logic/ledger/ledger-stats')
const {queryProtocolHistory} = require('../../business-logic/ledger/protocol-versions')
const {queryTimestampFromSequence, querySequenceFromTimestamp} = require('../../business-logic/ledger/ledger-timestamp-resolver')
const {fetchArchiveLedger} = require('../../business-logic/archive/archive-locator')
const {waitForLedger} = require('../../business-logic/ledger/ledger-stream')
const {fetchLastLedger, fetchLedger} = require('../../business-logic/ledger/ledger-resolver')
const horizonAdapter = require('../../connectors/horizon-adapter')

module.exports = function (app) {
    registerRoute(app,
        'ledger/recent',
        {cache: 'stats', cors: 'open'},
        async ({params, query = {}}) => {
            const ledgers = await horizonAdapter.getLedgers(params.network, query.limit || 20, query.cursor)
            const formatted = ledgers.map(l => ({
                sequence: l.sequence,
                ts: new Date(l.closed_at).getTime(),
                tx_count: (l.successful_transaction_count || 0) + (l.failed_transaction_count || 0),
                op_count: l.operation_count || 0,
                hash: l.hash
            }))
            return {_embedded: {records: formatted}}
        })

    registerRoute(app,
        'ledger/ledger-stats/24h',
        {cache: 'global-stats', cors: 'open'},
        ({params}) => query24HLedgerStats(params.network))

    registerRoute(app,
        'ledger/ledger-stats',
        {cache: 'global-stats'},
        async ({params}) => {
            const response = await fetch(`https://api.stellar.expert/explorer/${params.network}/ledger/ledger-stats`)
            return await response.json()
        })

    registerRoute(app,
        'ledger/protocol-history',
        {cache: 'global-stats'},
        ({params, query}) => queryProtocolHistory(params.network, query))

    registerRoute(app,
        'ledger/timestamp-from-sequence',
        {cache: 'stats', cors: 'open'},
        ({params, query}) => queryTimestampFromSequence(params.network, query))

    registerRoute(app,
        'ledger/sequence-from-timestamp',
        {cache: 'stats', cors: 'open'},
        ({params, query}) => querySequenceFromTimestamp(params.network, query))

    registerRoute(app,
        'ledger/stream',
        {},
        ({params}) => waitForLedger(params.network))

    registerRoute(app,
        'ledger/last',
        {},
        async ({params}) => prepareLedgerData(params.network, await fetchLastLedger(params.network)))

    registerRoute(app,
        'ledger/:sequence',
        {},
        async ({params}) => prepareLedgerData(params.network, await fetchLedger(params.network, parseInt(params.sequence, 10))))
}

async function prepareLedgerData(network, stats) {
    if (!stats)
        return null
    
    // If data is from Horizon (has header_xdr), return it directly
    if (stats.header_xdr) {
        return {
            sequence: stats.sequence || stats._id,
            ts: new Date(stats.closed_at).getTime(),
            protocol: stats.protocol_version,
            xlm: stats.total_coins || '0',
            feePool: stats.fee_pool || '0',
            txSuccess: stats.successful_transaction_count || 0,
            txFailed: stats.failed_transaction_count || 0,
            operations: stats.operation_count || 0,
            hash: stats.hash,
            prev_hash: stats.prev_hash,
            xdr: stats.header_xdr,
            base_fee: stats.base_fee_in_stroops,
            base_reserve: stats.base_reserve_in_stroops
        }
    }
    
    // Original logic for database data
    try {
        const fromArchive = await fetchArchiveLedger(network, stats?._id)
        if (fromArchive && stats?._id === fromArchive?.sequence) {
            return {
                sequence: stats.sequence,
                ts: stats.ts,
                protocol: stats.version,
                xlm: stats.xlm.toString(),
                feePool: stats.pool.toString(),
                txSuccess: stats.tx,
                txFailed: stats.failed,
                operations: stats.ops,
                ...fromArchive
            }
        }
    } catch (e) {
        // Archive not available, return basic stats
    }
    
    // Fallback: return basic stats without archive data
    return {
        sequence: stats.sequence || stats._id,
        ts: stats.ts,
        protocol: stats.version,
        operations: stats.ops || 0,
        txSuccess: stats.tx || 0,
        txFailed: stats.failed || 0
    }
}