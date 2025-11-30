const {registerRoute} = require('../router')
const fetch = require('node-fetch')

const SOROBAN_RPC = 'https://soroban-mainnet.stellar.org'

module.exports = function (app) {
    registerRoute(app,
        'soroban/contract/:id',
        {cache: 'stats'},
        async ({params}) => {
            const {id} = params
            try {
                const response = await fetch(SOROBAN_RPC, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'getContract',
                        params: {contract: id},
                        id: 1
                    })
                })
                const data = await response.json()
                return data.result || {error: 'Contract not found'}
            } catch (err) {
                return {error: err.message}
            }
        })
}
