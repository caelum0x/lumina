const db = require('../../connectors/mongodb-connector')
const horizonProxy = require('../../connectors/horizon-proxy')

/**
 * Fetch multiple ledgers from analytics db
 * @param {String} network - Stellar network
 * @param {Number[]} sequences - Ledger sequences to fetch
 * @return {Promise<{}[]>}
 */
async function fetchLedgers(network, sequences) {
    try {
        return await db[network].collection('ledgers').find({_id: {$in: sequences}}).toArray()
    } catch (error) {
        console.log('Failed to fetch ledgers from DB:', error.message)
        return []
    }
}

/**
 * Fetch multiple ledgers from analytics db
 * @param {String} network - Stellar network
 * @param {Number} sequence - Ledger sequences to fetch
 * @return {Promise<{}>}
 */
async function fetchLedger(network, sequence) {
    try {
        return await db[network].collection('ledgers').findOne({_id: sequence})
    } catch (error) {
        console.log('Failed to fetch ledger from DB:', error.message)
        return null
    }
}

/**
 * Fetch the most recent ledger processed by the network
 * @param {String} network
 * @return {Promise<{}>}
 */
async function fetchLastLedger(network) {
    try {
        const ledger = await db[network].collection('ledgers').findOne({}, {sort: {_id: -1}})
        if (ledger) {
            return ledger
        }
    } catch (error) {
        console.log('Failed to fetch last ledger from DB, using Horizon:', error.message)
    }
    
    // Fallback to Horizon proxy
    return await horizonProxy.getLatestLedger(network)
}

module.exports = {fetchLedgers, fetchLedger, fetchLastLedger}