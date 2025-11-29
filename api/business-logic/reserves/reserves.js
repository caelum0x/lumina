const db = require('../../connectors/mongodb-connector')
const {validateNetwork, validateAccountAddress} = require('../validators')
const errors = require('../errors')
const {preparePagedData, normalizeLimit, normalizeOrder} = require('../api-helpers')
const {resolveAccountAddress, AccountAddressJSONResolver} = require('../account/account-resolver')

/**
 * Search for entries sponsored by a given account
 * @param {string} network - Network name
 * @param {string} basePath - Base path for paging
 * @param {string} sponsorAccount - Account address that sponsors entries
 * @param {object} options - Query options (cursor, limit, order)
 * @returns {Promise<object>} Paged results
 */
async function querySponsoredEntries(network, basePath, sponsorAccount, {cursor, limit, order}) {
    validateNetwork(network)
    validateAccountAddress(sponsorAccount)
    
    limit = normalizeLimit(limit, 10, 100)
    const normalizedOrder = normalizeOrder(order, 1)
    
    // Resolve sponsor account ID
    const sponsorId = await resolveAccountAddress(network, sponsorAccount)
    
    const filter = {sponsor: sponsorId}
    
    // Handle cursor for paging
    if (cursor) {
        const cursorId = parseInt(cursor, 10)
        if (cursorId > 0) {
            filter._id = normalizedOrder === 1 ? {$gt: cursorId} : {$lt: cursorId}
        }
    }
    
    // Query reserves collection for sponsored entries
    const collection = db[network].collection('reserves')
    const entries = await collection
        .find(filter)
        .sort({_id: normalizedOrder})
        .limit(limit)
        .toArray()
    
    const accountResolver = new AccountAddressJSONResolver(network)
    
    // Format results
    const formattedEntries = await Promise.all(entries.map(async entry => {
        const accountAddress = await resolveAccountAddress(network, entry.account)
        return {
            account: accountResolver.resolve(entry.account),
            account_address: accountAddress,
            sponsor: accountResolver.resolve(entry.sponsor),
            reserve_type: entry.type || 'unknown',
            created: entry.created,
            paging_token: entry._id.toString()
        }
    }))
    
    await accountResolver.fetchAll()
    
    return preparePagedData(basePath, {
        sort: 'created',
        order: normalizedOrder,
        cursor,
        limit
    }, formattedEntries)
}

module.exports = {querySponsoredEntries}