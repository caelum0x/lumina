import React, {useState} from 'react'
import {Amount, AccountAddress} from '@stellar-expert/ui-framework'
import {VirtualScroll} from './virtual-scroll'
import {TimeRangeSelector, useTimeRange} from './time-range-selector'
import './market-trade-history-enhanced.scss'

/**
 * Enhanced market trade history with filters and sorting
 */
export function MarketTradeHistoryEnhanced({trades, baseAsset, counterAsset}) {
    const [timeRange, setTimeRange] = useState('24h')
    const [sortBy, setSortBy] = useState('time') // 'time', 'price', 'amount'
    const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
    const {startTime} = useTimeRange(timeRange)

    const filteredAndSortedTrades = React.useMemo(() => {
        if (!trades || !Array.isArray(trades)) return []

        let filtered = trades

        // Time filter
        if (startTime) {
            filtered = filtered.filter(trade => {
                const tradeTime = trade.timestamp ? new Date(trade.timestamp).getTime() : trade[0]
                return tradeTime >= startTime
            })
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            let aVal, bVal

            switch (sortBy) {
                case 'price':
                    aVal = a.price || a[1] || 0
                    bVal = b.price || b[1] || 0
                    break
                case 'amount':
                    aVal = a.amount || a[2] || 0
                    bVal = b.amount || b[2] || 0
                    break
                case 'time':
                default:
                    aVal = a.timestamp ? new Date(a.timestamp).getTime() : a[0] || 0
                    bVal = b.timestamp ? new Date(b.timestamp).getTime() : b[0] || 0
                    break
            }

            if (sortOrder === 'asc') {
                return aVal - bVal
            } else {
                return bVal - aVal
            }
        })

        return filtered
    }, [trades, startTime, sortBy, sortOrder])

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(newSortBy)
            setSortOrder('desc')
        }
    }

    const renderTrade = (trade, index) => {
        const price = trade.price || trade[1] || 0
        const amount = trade.amount || trade[2] || 0
        const timestamp = trade.timestamp || trade[0]
        const seller = trade.seller || trade.seller_id
        const buyer = trade.buyer || trade.buyer_id

        return (
            <div className="trade-item">
                <div className="trade-time">
                    {timestamp && new Date(timestamp).toLocaleString()}
                </div>
                <div className="trade-details">
                    <div className="trade-price">
                        <span className="price-label">Price:</span>
                        <span className="price-value">
                            <Amount amount={price * 10000000} asset={counterAsset} adjust issuer={false} />
                        </span>
                    </div>
                    <div className="trade-amount">
                        <span className="amount-label">Amount:</span>
                        <span className="amount-value">
                            <Amount amount={amount * 10000000} asset={baseAsset} adjust issuer={false} />
                        </span>
                    </div>
                    <div className="trade-value">
                        <span className="value-label">Value:</span>
                        <span className="value-value">
                            {(price * amount).toFixed(6)} {counterAsset?.code || 'XLM'}
                        </span>
                    </div>
                </div>
                {(seller || buyer) && (
                    <div className="trade-parties">
                        {seller && (
                            <div className="trade-party">
                                <span className="party-label">Seller:</span>
                                <AccountAddress account={seller} chars={8} />
                            </div>
                        )}
                        {buyer && (
                            <div className="trade-party">
                                <span className="party-label">Buyer:</span>
                                <AccountAddress account={buyer} chars={8} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="market-trade-history-enhanced">
            <div className="history-header">
                <h3>Trade History ({filteredAndSortedTrades.length})</h3>
                <div className="history-controls">
                    <TimeRangeSelector
                        onChange={setTimeRange}
                        defaultRange={timeRange}
                    />
                    <div className="sort-controls">
                        <span className="sort-label">Sort by:</span>
                        <button
                            className={`sort-btn ${sortBy === 'time' ? 'active' : ''}`}
                            onClick={() => handleSort('time')}
                        >
                            Time {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                            onClick={() => handleSort('price')}
                        >
                            Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            className={`sort-btn ${sortBy === 'amount' ? 'active' : ''}`}
                            onClick={() => handleSort('amount')}
                        >
                            Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>
            </div>

            <VirtualScroll
                items={filteredAndSortedTrades}
                itemHeight={120}
                containerHeight={500}
                renderItem={renderTrade}
            />
        </div>
    )
}

