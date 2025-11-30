const fetch = require('node-fetch')

const RPC_URLS = {
    public: process.env.SOROBAN_RPC_URL || 'https://soroban-mainnet.stellar.org',
    testnet: 'https://soroban-testnet.stellar.org'
}

async function rpcCall(network, method, params) {
    const url = RPC_URLS[network] || RPC_URLS.public
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method,
            params
        })
    })
    
    if (!response.ok) {
        throw new Error(`RPC call failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    if (data.error) {
        throw new Error(data.error.message || 'RPC error')
    }
    
    return data.result
}

async function getContractData(network, contractId, key, durability = 'persistent') {
    return await rpcCall(network, 'getContractData', {
        contract: contractId,
        key,
        durability
    })
}

async function getContract(network, contractId) {
    return await rpcCall(network, 'getContract', {
        contract: contractId
    })
}

async function getEvents(network, startLedger, filters, limit = 100) {
    return await rpcCall(network, 'getEvents', {
        startLedger,
        filters,
        pagination: {limit}
    })
}

async function getLedgerEntries(network, keys) {
    return await rpcCall(network, 'getLedgerEntries', {keys})
}

async function getLatestLedger(network) {
    return await rpcCall(network, 'getLatestLedger', {})
}

module.exports = {
    rpcCall,
    getContractData,
    getContract,
    getEvents,
    getLedgerEntries,
    getLatestLedger
}
