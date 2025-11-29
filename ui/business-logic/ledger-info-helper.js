import {retrieveLedgerInfo as originalRetrieveLedgerInfo} from '@stellar-expert/ui-framework'

/**
 * Safe wrapper for retrieveLedgerInfo that handles missing XDR data
 * @param {Object} data - Ledger data from API
 * @returns {Object} Parsed ledger information
 */
export function retrieveLedgerInfo(data) {
    if (!data) {
        throw new Error('Ledger data is required')
    }

    // If xdr is missing, create a minimal ledger info object without parsing XDR
    if (!data.xdr) {
        return {
            sequence: data.sequence,
            ts: data.ts,
            protocol: data.protocol,
            operations: data.operations || 0,
            txSuccess: data.txSuccess || 0,
            txFailed: data.txFailed || 0,
            xlm: BigInt(data.xlm || 0),
            feePool: BigInt(data.feePool || 0),
            baseFee: data.base_fee || 100,
            baseReserve: data.base_reserve || 5000000
        }
    }

    // Use the original function if XDR is available
    return originalRetrieveLedgerInfo(data)
}
