import create from 'zustand'

/**
 * Generate a random 3D position for a transaction node
 * @return {[number, number, number]}
 */
function randomPosition() {
    return [
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
    ]
}

/**
 * Simple hash function for consistent positioning
 * @param {string} str
 * @return {number}
 */
function hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32bit integer
    }
    return hash
}

/**
 * Zustand store for managing 3D transaction visualization state
 */
export const useStore = create((set, get) => ({
    transactions: [],
    connections: [],
    selectedTransaction: null,
    stats: {
        totalTransactions: 0,
        totalVolume: 0,
        whaleCount: 0,
        sorobanCount: 0,
        txPerSecond: 0
    },
    lastUpdateTime: null,
    turboMode: false,
    turboSpeed: 100, // 100x speed
    turboStartTime: null,
    transactionHistory: [], // Store full history for replay
    dexTrades: [], // DEX trades for visualization
    liquidityPools: [], // Known liquidity pools
    filters: {
        showRegular: true,
        showWhales: true,
        showHighFee: true,
        showSoroban: true
    },
    connectionStatus: 'connecting', // 'connecting', 'connected', 'disconnected', 'error'
    viewMode: 'galaxy', // 'galaxy' | 'topology' | 'liquidity' | 'arbitrage'

    /**
     * Set turbo mode
     * @param {boolean} enabled
     */
    setTurboMode: (enabled) => {
        if (enabled) {
            // Store current state for replay
            const state = get()
            set({
                turboMode: true,
                turboStartTime: Date.now(),
                transactionHistory: [...state.transactions]
            })
        } else {
            set({turboMode: false, turboStartTime: null})
        }
    },

    /**
     * Set filter visibility
     * @param {string} filterType
     * @param {boolean} visible
     */
    setFilter: (filterType, visible) => {
        set(state => ({
            filters: {
                ...state.filters,
                [filterType]: visible
            }
        }))
    },

    /**
     * Set connection status
     * @param {string} status
     */
    setConnectionStatus: (status) => {
        set({connectionStatus: status})
    },

    /**
     * Add a new transaction to the store
     * @param {Object} rawTx - Raw transaction data from API
     */
    addTransaction: (rawTx) => {
        if (!rawTx || (!rawTx.id && !rawTx.hash)) {
            console.warn('Invalid transaction data:', rawTx)
            return
        }

        try {
            const amount = parseFloat(rawTx.amount || rawTx.total_coins || 0)
            const fee = parseInt(rawTx.fee_charged || rawTx.fee_paid || '0', 10)
            const sourceAccount = rawTx.source_account || rawTx.account || ''
            const isSoroban = sourceAccount.startsWith('C') || 
                             rawTx.isSoroban || 
                             (rawTx.operations && Array.isArray(rawTx.operations) && rawTx.operations.some(op => 
                                 op && (op.type === 'invokeHostFunction' || op.type === 'invokeContract')
                             ))
            const isWhale = amount > 50000 // 50k XLM threshold
            const highFee = fee > 10000000 // 0.1 XLM threshold (10000000 stroops)

        // Generate position based on transaction hash for consistency
        const txHash = rawTx.hash || rawTx.id || String(Math.random())
        const hash = Math.abs(hashCode(txHash))
        const position = [
            (hash % 100) - 50,
            ((hash >> 8) % 100) - 50,
            ((hash >> 16) % 100) - 50
        ]

        const tx = {
            id: rawTx.id || rawTx.hash,
            hash: rawTx.hash,
            amount: amount,
            fee: fee,
            isWhale: isWhale,
            highFee: highFee,
            isSoroban: isSoroban,
            source: sourceAccount,
            destination: rawTx.destination || rawTx.operations?.[0]?.destination || null,
            position: position,
            created_at: rawTx.created_at || rawTx.ledger_close_time,
            ledger: rawTx.ledger,
            successful: rawTx.successful !== false,
            operations: rawTx.operations || []
        }

        // Generate connections from operations
        const newConnections = []
        if (rawTx.operations && Array.isArray(rawTx.operations)) {
            for (const op of rawTx.operations) {
                if (op.destination || op.to) {
                    const destHash = Math.abs(hashCode(op.destination || op.to))
                    const destPosition = [
                        (destHash % 100) - 50,
                        ((destHash >> 8) % 100) - 50,
                        ((destHash >> 16) % 100) - 50
                    ]
                    newConnections.push({
                        from: position,
                        to: destPosition,
                        amount: parseFloat(op.amount || 0),
                        type: op.type
                    })
                }
            }
        }

        set((state) => {
            // Keep only last 2000 transactions
            const updatedTransactions = [...state.transactions.slice(-1999), tx]
            
            // Keep only last 3000 connections
            const updatedConnections = [...state.connections, ...newConnections].slice(-3000)

            // Update stats
            const now = Date.now()
            const timeDiff = state.lastUpdateTime ? (now - state.lastUpdateTime) / 1000 : 1
            const txPerSecond = timeDiff > 0 ? 1 / timeDiff : 0

            const stats = {
                totalTransactions: updatedTransactions.length,
                totalVolume: updatedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
                whaleCount: updatedTransactions.filter(t => t.isWhale).length,
                sorobanCount: updatedTransactions.filter(t => t.isSoroban).length,
                txPerSecond: state.stats.txPerSecond * 0.9 + txPerSecond * 0.1 // Exponential moving average
            }

            // Store in history for turbo mode replay
            const history = state.transactionHistory || []
            const updatedHistory = [...history, tx].slice(-10000) // Keep last 10k for replay

            return {
                transactions: updatedTransactions,
                connections: updatedConnections,
                stats: stats,
                lastUpdateTime: now,
                transactionHistory: updatedHistory
            }
        })
        } catch (error) {
            console.error('Error adding transaction to store:', error, rawTx)
            // Don't throw, just log the error
        }
    },

    /**
     * Add multiple transactions (batch)
     * @param {Array} transactions - Array of raw transaction data
     */
    addTransactions: (transactions) => {
        for (const tx of transactions) {
            get().addTransaction(tx)
        }
    },

    /**
     * Clear all transactions and connections
     */
    clear: () => set({
        transactions: [],
        connections: [],
        selectedTransaction: null,
        stats: {
            totalTransactions: 0,
            totalVolume: 0,
            whaleCount: 0,
            sorobanCount: 0,
            txPerSecond: 0
        },
        lastUpdateTime: null,
        turboMode: false,
        turboStartTime: null,
        transactionHistory: []
    }),

    /**
     * Get filtered transactions based on current filters
     * @return {Array}
     */
    getFilteredTransactions: () => {
        const state = get()
        return state.transactions.filter(tx => {
            if (tx.isWhale && !state.filters.showWhales) return false
            if (tx.highFee && !state.filters.showHighFee) return false
            if (tx.isSoroban && !state.filters.showSoroban) return false
            if (!tx.isWhale && !tx.highFee && !tx.isSoroban && !state.filters.showRegular) return false
            return true
        })
    },

    /**
     * Set the selected transaction
     * @param {Object|null} tx - Transaction object or null
     */
    setSelected: (tx) => set({selectedTransaction: tx}),

    /**
     * Get top whales (largest transactions)
     * @param {number} limit - Number of whales to return
     * @return {Array}
     */
    getTopWhales: (limit = 10) => {
        const state = get()
        return [...state.transactions]
            .filter(tx => tx.isWhale)
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            .slice(0, limit)
            .map(tx => ({
                id: tx.id,
                hash: tx.hash,
                amount: tx.amount,
                source: tx.source,
                created_at: tx.created_at
            }))
    },

    /**
     * Set view mode
     * @param {string} mode - 'galaxy', 'topology', 'liquidity', or 'arbitrage'
     */
    setViewMode: (mode) => {
        if (['galaxy', 'topology', 'liquidity', 'arbitrage'].includes(mode)) {
            set({viewMode: mode})
        }
    },

    /**
     * Add DEX trade
     * @param {Object} trade - DEX trade object
     */
    addDEXTrade: (trade) => {
        set(state => ({
            dexTrades: [...state.dexTrades.slice(-100), trade] // Keep last 100
        }))
    },

    /**
     * Add multiple DEX trades
     * @param {Array} trades - Array of DEX trade objects
     */
    addDEXTrades: (trades) => {
        set(state => ({
            dexTrades: [...state.dexTrades, ...trades].slice(-100)
        }))
    },

    /**
     * Set liquidity pools
     * @param {Array} pools - Array of pool objects
     */
    setLiquidityPools: (pools) => {
        set({liquidityPools: pools})
    }
}))

