import React, {useState, useMemo} from 'react'
import {VirtualScroll} from './virtual-scroll'
import {TimeRangeSelector, useTimeRange} from './time-range-selector'
import './account-timeline.scss'

/**
 * Account transaction timeline visualization with filters
 */
export function AccountTimeline({transactions, accountAddress, onTransactionClick}) {
    const [timeRange, setTimeRange] = useState('30d')
    const [filter, setFilter] = useState('all')
    const {startTime} = useTimeRange(timeRange)

    const filteredTransactions = useMemo(() => {
        let filtered = transactions || []

        // Filter by time range
        if (startTime) {
            filtered = filtered.filter(tx => {
                const txTime = tx.created_at ? new Date(tx.created_at).getTime() : 0
                return txTime >= startTime
            })
        }

        // Filter by type
        if (filter !== 'all') {
            filtered = filtered.filter(tx => {
                switch (filter) {
                    case 'payments':
                        return tx.type === 'payment'
                    case 'trades':
                        return tx.type === 'trade' || tx.type === 'path_payment'
                    case 'contracts':
                        return tx.isSoroban || tx.type === 'invoke_host_function'
                    case 'whales':
                        return tx.isWhale
                    default:
                        return true
                }
            })
        }

        // Sort by date (newest first)
        return filtered.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
            return timeB - timeA
        })
    }, [transactions, startTime, filter])

    const renderTransaction = (tx, index) => {
        const date = tx.created_at ? new Date(tx.created_at) : new Date()
        const amount = tx.amount ? (tx.amount / 1000000).toFixed(6) : '0'
        const type = tx.isSoroban ? 'Soroban' : 
                    tx.isWhale ? 'Whale' : 
                    tx.highFee ? 'High Fee' : 
                    tx.type || 'Transaction'

        return (
            <div
                className="timeline-item"
                onClick={() => onTransactionClick && onTransactionClick(tx)}
            >
                <div className="timeline-date">
                    {date.toLocaleDateString()} {date.toLocaleTimeString()}
                </div>
                <div className="timeline-content">
                    <div className="timeline-type">{type}</div>
                    <div className="timeline-amount">{amount} XLM</div>
                    {tx.hash && (
                        <div className="timeline-hash">
                            {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="account-timeline">
            <div className="timeline-controls">
                <TimeRangeSelector
                    onChange={setTimeRange}
                    defaultRange={timeRange}
                />
                <div className="timeline-filters">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="payments">Payments</option>
                        <option value="trades">Trades</option>
                        <option value="contracts">Contracts</option>
                        <option value="whales">Whales</option>
                    </select>
                </div>
            </div>

            <div className="timeline-stats">
                Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
            </div>

            <VirtualScroll
                items={filteredTransactions}
                itemHeight={80}
                containerHeight={500}
                renderItem={renderTransaction}
            />
        </div>
    )
}

