import {Contract, SorobanRpc} from '@stellar/stellar-sdk'
import appSettings from '../../app-settings'

/**
 * Soroban RPC client wrapper for contract invocations
 */
class SorobanRpcClient {
    constructor() {
        this.clients = {}
        this.cache = new Map()
    }

    getClient(network = null) {
        const networkName = network || appSettings.activeNetwork
        const networkSettings = appSettings.networks[networkName] || appSettings.networks.public

        if (!this.clients[networkName]) {
            // Determine RPC endpoint based on network
            let rpcUrl
            if (networkName === 'testnet') {
                rpcUrl = 'https://soroban-testnet.stellar.org:443'
            } else {
                rpcUrl = 'https://soroban-rpc.mainnet.stellar.org:443'
            }

            // Allow override via environment variable
            if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SOROBAN_RPC_URL) {
                rpcUrl = process.env.REACT_APP_SOROBAN_RPC_URL
            }

            this.clients[networkName] = new SorobanRpc.Server(rpcUrl, {
                allowHttp: rpcUrl.startsWith('http://')
            })
        }

        return this.clients[networkName]
    }

    /**
     * Get contract instance
     */
    getContract(contractAddress, network = null) {
        const client = this.getClient(network)
        return new Contract(contractAddress)
    }

    /**
     * Simulate contract function call (read-only)
     */
    async simulateCall(contractAddress, functionName, args = [], network = null) {
        try {
            const client = this.getClient(network)
            const contract = this.getContract(contractAddress, network)

            // Build the invocation
            const invocation = contract.call(functionName, ...args)

            // Simulate the call
            const simulation = await client.simulateTransaction(invocation)

            if (SorobanRpc.Api.isSimulationError(simulation)) {
                throw new Error(`Simulation error: ${simulation.error()}`)
            }

            return {
                result: simulation.result(),
                cost: {
                    cpuInsns: simulation.cost().cpuInsns,
                    memBytes: simulation.cost().memBytes
                },
                events: simulation.events(),
                minResourceFee: simulation.minResourceFee().toString()
            }
        } catch (error) {
            console.error('Soroban RPC simulation error:', error)
            throw error
        }
    }

    /**
     * Get contract interface/ABI
     */
    async getContractInterface(contractAddress, network = null) {
        const cacheKey = `${network || appSettings.activeNetwork}:${contractAddress}`
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)
        }

        try {
            const client = this.getClient(network)
            const contract = this.getContract(contractAddress, network)

            // Fetch contract data to get interface
            // This is a simplified version - in production, you'd fetch from contract storage
            const interfaceData = await client.getContractData(contractAddress, 'CONTRACT_INTERFACE')

            this.cache.set(cacheKey, interfaceData)
            return interfaceData
        } catch (error) {
            console.error('Failed to fetch contract interface:', error)
            return null
        }
    }

    /**
     * Convert value to ScVal
     */
    toScVal(value, type) {
        const {xdr} = require('@stellar/stellar-base')
        
        switch (type) {
            case 'i32':
                return xdr.ScVal.scvI32(parseInt(value))
            case 'u32':
                return xdr.ScVal.scvU32(parseUint32(value))
            case 'i64':
                return xdr.ScVal.scvI64(xdr.Int64.fromString(value))
            case 'u64':
                return xdr.ScVal.scvU64(xdr.Uint64.fromString(value))
            case 'i128':
                return xdr.ScVal.scvI128(xdr.Int128Parts.fromString(value))
            case 'u128':
                return xdr.ScVal.scvU128(xdr.Uint128Parts.fromString(value))
            case 'String':
                return xdr.ScVal.scvString(value)
            case 'Bytes':
                return xdr.ScVal.scvBytes(Buffer.from(value, 'hex'))
            case 'Bool':
                return xdr.ScVal.scvBool(value === 'true' || value === true)
            default:
                throw new Error(`Unsupported type: ${type}`)
        }
    }

    /**
     * Format ScVal for display
     */
    formatScVal(scVal) {
        if (!scVal) return 'null'

        try {
            const {xdr} = require('@stellar/stellar-base')
            
            switch (scVal.switch()) {
                case xdr.ScValType.scvBool():
                    return scVal.b().toString()
                case xdr.ScValType.scvVoid():
                    return 'void'
                case xdr.ScValType.scvError():
                    return `Error: ${scVal.error()}`
                case xdr.ScValType.scvU32():
                    return scVal.u32().toString()
                case xdr.ScValType.scvI32():
                    return scVal.i32().toString()
                case xdr.ScValType.scvU64():
                    return scVal.u64().toString()
                case xdr.ScValType.scvI64():
                    return scVal.i64().toString()
                case xdr.ScValType.scvU128():
                    return scVal.u128().toString()
                case xdr.ScValType.scvI128():
                    return scVal.i128().toString()
                case xdr.ScValType.scvString():
                    return scVal.str().toString()
                case xdr.ScValType.scvBytes():
                    return scVal.bytes().toString('hex')
                case xdr.ScValType.scvVec():
                    return JSON.stringify(scVal.vec().map(v => this.formatScVal(v)))
                case xdr.ScValType.scvMap():
                    return JSON.stringify(scVal.map().map(entry => ({
                        key: this.formatScVal(entry.key()),
                        val: this.formatScVal(entry.val())
                    })))
                default:
                    return scVal.toString()
            }
        } catch (error) {
            return scVal.toString()
        }
    }
}

function parseUint32(value) {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 0 || num > 0xFFFFFFFF) {
        throw new Error(`Invalid u32 value: ${value}`)
    }
    return num
}

export default new SorobanRpcClient()

