const StellarSdk = require('@stellar/stellar-sdk')

const servers = {
    public: new StellarSdk.Horizon.Server('https://horizon.stellar.org'), // MAINNET ONLY – no testnet empty pools
    testnet: new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org')
}

function getServer(network) {
    return servers[network] || servers.public
}

async function getLedgers(network, limit = 20, cursor) {
    const server = getServer(network)
    let builder = server.ledgers().order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getLedger(network, sequence) {
    const server = getServer(network)
    return await server.ledgers().ledger(sequence).call()
}

async function getTransactions(network, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.transactions().order('desc').limit(limit).includeFailed(true)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getTransaction(network, hash) {
    const server = getServer(network)
    return await server.transactions().transaction(hash).call()
}

async function getAccount(network, address) {
    const server = getServer(network)
    return await server.accounts().accountId(address).call()
}

async function getAccountTransactions(network, address, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.transactions().forAccount(address).order('desc').limit(limit).includeFailed(true)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getAsset(network, code, issuer) {
    const server = getServer(network)
    const response = await server.assets()
        .forCode(code)
        .forIssuer(issuer)
        .call()
    return response.records && response.records.length > 0 ? response.records[0] : null
}

async function getAssets(network, limit = 200, cursor) {
    const server = getServer(network)
    let builder = server.assets().order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getOperations(network, limit = 50, cursor, txHash) {
    const server = getServer(network)
    let builder = txHash 
        ? server.operations().forTransaction(txHash)
        : server.operations().order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getAssets(network, limit = 50, cursor, search) {
    const server = getServer(network)
    let builder = server.assets().order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    if (search) {
        const [code, issuer] = search.includes('-') ? search.split('-') : [search, null]
        if (code) builder = builder.forCode(code)
        if (issuer) builder = builder.forIssuer(issuer)
    }
    const response = await builder.call()
    return response.records
}

async function getOrderbook(network, selling, buying) {
    const server = getServer(network)
    return await server.orderbook(selling, buying).call()
}

async function getTrades(network, base, counter, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.trades().forAssetPair(base, counter).order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getTradeAggregations(network, base, counter, startTime, endTime, resolution) {
    const server = getServer(network)
    return await server.tradeAggregation(base, counter, startTime, endTime, resolution).call()
}

async function streamTransactions(network, onMessage, onError) {
    const server = getServer(network)
    return server.transactions()
        .cursor('now')
        .stream({
            onmessage: onMessage,
            onerror: onError || console.error
        })
}

async function streamLedgers(network, onMessage, onError) {
    const server = getServer(network)
    return server.ledgers()
        .cursor('now')
        .stream({
            onmessage: onMessage,
            onerror: onError || console.error
        })
}

async function getAccounts(network, filters = {}) {
    const server = getServer(network)
    let builder = server.accounts()
    
    if (filters.signer) builder = builder.forSigner(filters.signer)
    if (filters.asset) builder = builder.forAsset(filters.asset)
    if (filters.sponsor) builder = builder.sponsor(filters.sponsor)
    if (filters.liquidity_pool) builder = builder.forLiquidityPool(filters.liquidity_pool)
    if (filters.cursor) builder = builder.cursor(filters.cursor)
    if (filters.order) builder = builder.order(filters.order)
    
    builder = builder.limit(filters.limit || 10)
    
    const response = await builder.call()
    return response.records
}

async function getAccountOperations(network, address, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.operations().forAccount(address).order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getAccountPayments(network, address, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.payments().forAccount(address).order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getAccountEffects(network, address, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.effects().forAccount(address).order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getAccountOffers(network, address, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.offers().forAccount(address).order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getAccountTrades(network, address, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.trades().forAccount(address).order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getAccountData(network, address, key) {
    const server = getServer(network)
    if (key) {
        return await server.accounts().accountId(address).data(key).call()
    }
    const account = await server.accounts().accountId(address).call()
    return account.data || {}
}

async function getPayments(network, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.payments().order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getEffects(network, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.effects().order('desc').limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getOffers(network, filters = {}) {
    const server = getServer(network)
    let builder = server.offers()
    
    if (filters.seller) builder = builder.seller(filters.seller)
    if (filters.selling) builder = builder.selling(filters.selling)
    if (filters.buying) builder = builder.buying(filters.buying)
    if (filters.cursor) builder = builder.cursor(filters.cursor)
    if (filters.order) builder = builder.order(filters.order)
    
    builder = builder.limit(filters.limit || 50)
    const response = await builder.call()
    return response.records
}

async function getOffer(network, offerId) {
    const server = getServer(network)
    return await server.offers().offer(offerId).call()
}

async function getPaths(network, params) {
    const server = getServer(network)
    const {source, destination, destinationAsset, destinationAmount} = params
    return await server.strictReceivePaths(source, destinationAsset, destinationAmount)
        .call()
}

async function getStrictSendPaths(network, params) {
    const server = getServer(network)
    const {sourceAsset, sourceAmount, destination} = params
    return await server.strictSendPaths(sourceAsset, sourceAmount, [destination])
        .call()
}

async function getFeeStats(network) {
    const server = getServer(network)
    return await server.feeStats()
}

async function getLiquidityPools(network, limit = 50, cursor) {
    const server = getServer(network)
    let builder = server.liquidityPools().limit(limit)
    if (cursor) builder = builder.cursor(cursor)
    const response = await builder.call()
    return response.records
}

async function getLiquidityPool(network, poolId) {
    const server = getServer(network)
    return await server.liquidityPools().liquidityPoolId(poolId).call()
}

async function getClaimableBalances(network, filters = {}) {
    const server = getServer(network)
    let builder = server.claimableBalances()
    
    if (filters.claimant) builder = builder.claimant(filters.claimant)
    if (filters.asset) builder = builder.asset(filters.asset)
    if (filters.sponsor) builder = builder.sponsor(filters.sponsor)
    if (filters.cursor) builder = builder.cursor(filters.cursor)
    if (filters.order) builder = builder.order(filters.order)
    
    builder = builder.limit(filters.limit || 50)
    const response = await builder.call()
    return response.records
}

async function getClaimableBalance(network, balanceId) {
    const server = getServer(network)
    return await server.claimableBalances().claimableBalance(balanceId).call()
}

module.exports = {
    getServer,
    getLedgers,
    getLedger,
    getTransactions,
    getTransaction,
    getAccount,
    getAccounts,
    getAccountTransactions,
    getAccountOperations,
    getAccountPayments,
    getAccountEffects,
    getAccountOffers,
    getAccountTrades,
    getAccountData,
    getOperations,
    getAsset,
    getAssets,
    getOrderbook,
    getTrades,
    getTradeAggregations,
    getPayments,
    getEffects,
    getOffers,
    getOffer,
    getPaths,
    getStrictSendPaths,
    getFeeStats,
    getLiquidityPools,
    getLiquidityPool,
    getClaimableBalances,
    getClaimableBalance,
    streamTransactions,
    streamLedgers
}
