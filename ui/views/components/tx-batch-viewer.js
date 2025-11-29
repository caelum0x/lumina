import React, {useState} from 'react'
import {VirtualScroll} from './virtual-scroll'
import './tx-batch-viewer.scss'

/**
 * Transaction batch viewer for viewing multiple transactions at once
 */
export function TxBatchViewer({transactions, onTransactionClick}) {
    const [selectedTxs, setSelectedTxs] = useState(new Set())
    const [filter, setFilter] = useState('all')

    const filteredTxs = React.useMemo(() => {
        if (!transactions || !Array.isArray(transactions)) return []

        return transactions.filter(tx => {
            if (filter === 'all') return true
            if (filter === 'successful' && tx.successful) return true
            if (filter === 'failed' && !tx.successful) return true
            if (filter === 'whales' && tx.isWhale) return true
            if (filter === 'soroban' && tx.isSoroban) return true
            return false
        })
    }, [transactions, filter])

    const toggleSelection = (txId) => {
        const newSelected = new Set(selectedTxs)
        if (newSelected.has(txId)) {
            newSelected.delete(txId)
        } else {
            newSelected.add(txId)
        }
        setSelectedTxs(newSelected)
    }

    const renderTransaction = (tx, index) => {
        const isSelected = selectedTxs.has(tx.id || tx.hash)
        const date = tx.created_at ? new Date(tx.created_at) : new Date()

        return (
            <div
                className={`batch-tx-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                    toggleSelection(tx.id || tx.hash)
                    onTransactionClick?.(tx)
                }}
            >
                <div className="tx-checkbox">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(tx.id || tx.hash)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <div className="tx-content">
                    <div className="tx-header">
                        <span className="tx-hash">
                            {tx.hash ? `${tx.hash.substring(0, 8)}...${tx.hash.substring(tx.hash.length - 8)}` : tx.id}
                        </span>
                        <span className={`tx-status ${tx.successful ? 'success' : 'failed'}`}>
                            {tx.successful ? '✓' : '✗'}
                        </span>
                    </div>
                    <div className="tx-details">
                        <div className="tx-date">{date.toLocaleString()}</div>
                        <div className="tx-amount">
                            {tx.amount ? `${(tx.amount / 1000000).toFixed(6)} XLM` : '0 XLM'}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="tx-batch-viewer">
            <div className="viewer-header">
                <h3>Transaction Batch ({filteredTxs.length})</h3>
                <div className="viewer-controls">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All</option>
                        <option value="successful">Successful</option>
                        <option value="failed">Failed</option>
                        <option value="whales">Whales</option>
                        <option value="soroban">Soroban</option>
                    </select>
                    {selectedTxs.size > 0 && (
                        <button
                            className="clear-selection"
                            onClick={() => setSelectedTxs(new Set())}
                        >
                            Clear Selection ({selectedTxs.size})
                        </button>
                    )}
                </div>
            </div>

            <VirtualScroll
                items={filteredTxs}
                itemHeight={80}
                containerHeight={500}
                renderItem={renderTransaction}
            />
        </div>
    )
}

