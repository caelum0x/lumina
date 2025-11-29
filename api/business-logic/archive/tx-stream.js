const {Long} = require('bson')
const db = require('../../connectors/mongodb-connector')
const {networks} = require('../../app.config')
const {fetchArchiveTransactions} = require('./archive-locator')
const {fetchLedgers} = require('../ledger/ledger-resolver')
const TxQuery = require('./tx-query')

class TransactionStream {
    constructor(network) {
        this.network = network
        this.subscribers = []
        this.lastTxId = null
        this.interval = null
        this.pollInterval = 500 // poll every 0.5 seconds
    }

    /**
     * Start polling for new transactions
     * @private
     */
    start() {
        if (this.interval) return
        this.interval = setInterval(this.poll.bind(this), this.pollInterval)
        // Initialize lastTxId on first poll
        this.poll()
    }

    /**
     * Stop polling
     * @private
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
        }
    }

    /**
     * Subscribe to transaction stream
     * @param {Function} callback - Function to call with new transactions
     * @return {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.push(callback)
        if (this.subscribers.length === 1) {
            this.start()
        }
        return () => this.unsubscribe(callback)
    }

    /**
     * Unsubscribe from transaction stream
     * @param {Function} callback - Callback to remove
     * @private
     */
    unsubscribe(callback) {
        const index = this.subscribers.indexOf(callback)
        if (index > -1) {
            this.subscribers.splice(index, 1)
        }
        if (this.subscribers.length === 0) {
            this.stop()
        }
    }

    /**
     * Poll for new transactions
     * @private
     */
    async poll() {
        try {
            // Get the most recent transaction ID from Elasticsearch or MongoDB
            const latestTx = await this.getLatestTransaction()
            if (!latestTx) {
                // No transactions yet, wait for next poll
                return
            }

            const latestTxId = latestTx._id || latestTx.id
            if (!latestTxId) {
                console.warn(`No transaction ID found for network ${this.network}`)
                return
            }

            // If we have a lastTxId, fetch transactions since then
            if (this.lastTxId && latestTxId > this.lastTxId) {
                const newTransactions = await this.fetchNewTransactions(this.lastTxId, latestTxId)
                if (newTransactions.length > 0) {
                    this.notify(newTransactions)
                }
            }

            this.lastTxId = latestTxId
        } catch (error) {
            console.error(`Transaction stream poll error for ${this.network}:`, error)
        }
    }

    /**
     * Get the latest transaction from the database
     * @return {Promise<{}>}
     * @private
     */
    async getLatestTransaction() {
        try {
            // Query Elasticsearch for the most recent transaction
            const elastic = require('../../connectors/elastic-connector')
            const opIndex = networks[this.network].opIndex
            const currentYear = new Date().getUTCFullYear()
            const index = `${opIndex}-${currentYear}`

            const response = await elastic.search({
                index,
                body: {
                    size: 1,
                    sort: [{id: {order: 'desc'}}],
                    _source: ['id']
                }
            })

            if (response.body?.hits?.hits?.length > 0) {
                const txId = BigInt(response.body.hits.hits[0]._id)
                // Fetch full transaction from archive
                const [transactions, ledgers] = await Promise.all([
                    fetchArchiveTransactions(this.network, [txId], -1),
                    this.fetchLedgersInfo([txId])
                ])

                if (transactions.length > 0) {
                    const tx = transactions[0]
                    return TxQuery.prepareResponseEntry(tx, ledgers[tx.id.high], true)
                }
            }
        } catch (error) {
            // Fallback to MongoDB if Elasticsearch fails
            try {
                const collection = db.archive[this.network].collection('transactions')
                const latest = await collection
                    .findOne({}, {sort: {_id: -1}, projection: {_id: 1, hash: 1}})
                return latest
            } catch (e) {
                console.error('Failed to get latest transaction:', e)
            }
        }
        return null
    }

    /**
     * Fetch new transactions between two IDs
     * @param {BigInt|Long} fromId - Starting transaction ID
     * @param {BigInt|Long} toId - Ending transaction ID
     * @return {Promise<Array>}
     * @private
     */
    async fetchNewTransactions(fromId, toId) {
        try {
            const elastic = require('../../connectors/elastic-connector')
            const opIndex = networks[this.network].opIndex
            const currentYear = new Date().getUTCFullYear()
            const index = `${opIndex}-${currentYear}`

            const fromIdNum = typeof fromId === 'bigint' ? fromId.toString() : fromId.toString()
            const toIdNum = typeof toId === 'bigint' ? toId.toString() : toId.toString()

            const response = await elastic.search({
                index,
                body: {
                    size: 100, // Limit to 100 transactions per poll
                    sort: [{id: {order: 'asc'}}],
                    query: {
                        range: {
                            id: {
                                gt: fromIdNum,
                                lte: toIdNum
                            }
                        }
                    },
                    _source: false,
                    fields: ['id']
                }
            })

            if (!response.body?.hits?.hits?.length) {
                return []
            }

            const txIds = response.body.hits.hits.map(hit => BigInt(hit._id))
            const [transactions, ledgers] = await Promise.all([
                fetchArchiveTransactions(this.network, txIds, 1),
                this.fetchLedgersInfo(txIds)
            ])

            return transactions.map(tx => {
                const formatted = TxQuery.prepareResponseEntry(tx, ledgers[tx.id.high], true)
                return this.formatForStream(formatted)
            })
        } catch (error) {
            console.error('Error fetching new transactions:', error)
            return []
        }
    }

    /**
     * Format transaction for SSE stream
     * @param {Object} tx - Transaction object
     * @return {Object}
     * @private
     */
    formatForStream(tx) {
        // Extract key information for 3D visualization
        const amount = this.extractAmount(tx)
        const fee = parseInt(tx.fee_charged || tx.fee_paid || '0', 10)
        const sourceAccount = tx.source_account || tx.account || ''
        const isSoroban = sourceAccount.startsWith('C') || tx.operations?.some(op => op.type === 'invokeHostFunction')

        return {
            id: tx.id || tx.hash,
            hash: tx.hash,
            amount: amount,
            fee_charged: fee,
            source_account: sourceAccount,
            successful: tx.successful !== false,
            created_at: tx.created_at || tx.ledger_close_time,
            ledger: tx.ledger || tx.ledger_attr,
            operations: tx.operations || [],
            isSoroban: isSoroban,
            isWhale: amount > 50000, // 50k XLM threshold
            highFee: fee > 10000000, // 0.1 XLM threshold
            total_coins: amount
        }
    }

    /**
     * Extract transaction amount from operations
     * @param {Object} tx - Transaction object
     * @return {number}
     * @private
     */
    extractAmount(tx) {
        if (tx.total_coins) {
            return parseFloat(tx.total_coins) || 0
        }

        // Try to extract from operations
        if (tx.operations && Array.isArray(tx.operations)) {
            let total = 0
            for (const op of tx.operations) {
                if (op.amount) {
                    total += parseFloat(op.amount) || 0
                } else if (op.source_amount) {
                    total += parseFloat(op.source_amount) || 0
                }
            }
            return total
        }

        return 0
    }

    /**
     * Retrieve ledgers for a given set of transaction IDs
     * @param {BigInt[]} txIds - Transaction generic identifiers
     * @return {Promise<Object.<Number, {}>>}
     * @private
     */
    async fetchLedgersInfo(txIds) {
        const ledgerIds = new Set()
        for (const id of txIds) {
            ledgerIds.add(Number(id >> 32n))
        }
        const ledgers = await fetchLedgers(this.network, Array.from(ledgerIds))
        const res = {}
        for (const ledger of ledgers) {
            res[ledger._id] = ledger
        }
        return res
    }

    /**
     * Notify all subscribers of new transactions
     * @param {Array} transactions - New transactions
     * @private
     */
    notify(transactions) {
        const subscribers = [...this.subscribers]
        for (const callback of subscribers) {
            try {
                callback(transactions)
            } catch (error) {
                console.error('Error in transaction stream subscriber:', error)
            }
        }
    }
}

const streams = {}

for (let network of Object.keys(networks)) {
    streams[network] = new TransactionStream(network)
}

/**
 * Subscribe to transaction stream for a network
 * @param {string} network - Network identifier
 * @param {Function} callback - Callback function for new transactions
 * @return {Function} Unsubscribe function
 */
function subscribeToTransactions(network, callback) {
    if (!streams[network]) {
        throw new Error(`Unknown network: ${network}`)
    }
    return streams[network].subscribe(callback)
}

module.exports = {subscribeToTransactions}

