import React, {useState} from 'react'
import {AssetLink, Amount} from '@stellar-expert/ui-framework'
import {resolvePath} from '../../../business-logic/path'
import './asset-trading-pairs-enhanced.scss'

/**
 * Enhanced asset trading pairs view with more details
 */
export function AssetTradingPairsEnhanced({asset, tradingPairs}) {
    const [sortBy, setSortBy] = useState('volume') // 'volume', 'price', 'trades'
    const [sortOrder, setSortOrder] = useState('desc')

    if (!tradingPairs || !Array.isArray(tradingPairs) || tradingPairs.length === 0) {
        return (
            <div className="asset-trading-pairs-enhanced">
                <div className="no-pairs">No trading pairs found for this asset</div>
            </div>
        )
    }

    const sortedPairs = React.useMemo(() => {
        return [...tradingPairs].sort((a, b) => {
            let aVal, bVal

            switch (sortBy) {
                case 'volume':
                    aVal = parseFloat(a.volume_24h || a.volume || 0)
                    bVal = parseFloat(b.volume_24h || b.volume || 0)
                    break
                case 'price':
                    aVal = parseFloat(a.price || 0)
                    bVal = parseFloat(b.price || 0)
                    break
                case 'trades':
                    aVal = parseInt(a.trades_24h || a.trades || 0)
                    bVal = parseInt(b.trades_24h || b.trades || 0)
                    break
                default:
                    return 0
            }

            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        })
    }, [tradingPairs, sortBy, sortOrder])

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(newSortBy)
            setSortOrder('desc')
        }
    }

    return (
        <div className="asset-trading-pairs-enhanced">
            <div className="pairs-header">
                <h3>Trading Pairs ({tradingPairs.length})</h3>
                <div className="sort-controls">
                    <span className="sort-label">Sort by:</span>
                    <button
                        className={`sort-btn ${sortBy === 'volume' ? 'active' : ''}`}
                        onClick={() => handleSort('volume')}
                    >
                        Volume {sortBy === 'volume' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
                        onClick={() => handleSort('price')}
                    >
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        className={`sort-btn ${sortBy === 'trades' ? 'active' : ''}`}
                        onClick={() => handleSort('trades')}
                    >
                        Trades {sortBy === 'trades' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                </div>
            </div>

            <div className="pairs-list">
                {sortedPairs.map((pair, index) => {
                    const pairAsset = pair.counter_asset || pair.asset
                    const volume = parseFloat(pair.volume_24h || pair.volume || 0) / 10000000
                    const price = parseFloat(pair.price || 0)
                    const trades = parseInt(pair.trades_24h || pair.trades || 0)
                    const priceChange = pair.price_change_24h || 0

                    return (
                        <div key={index} className="pair-item">
                            <div className="pair-assets">
                                <div className="pair-label">
                                    <AssetLink asset={asset?.descriptor || asset} />
                                    <span className="pair-separator">/</span>
                                    <AssetLink asset={pairAsset} />
                                </div>
                                <a
                                    href={resolvePath(`market/${asset?.descriptor?.toString() || asset}/${pairAsset}`)}
                                    className="view-market-btn"
                                >
                                    View Market →
                                </a>
                            </div>
                            <div className="pair-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Price:</span>
                                    <span className="stat-value">
                                        {price > 0 ? price.toFixed(6) : 'N/A'}
                                    </span>
                                    {priceChange !== 0 && (
                                        <span className={`price-change ${priceChange > 0 ? 'positive' : 'negative'}`}>
                                            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                                        </span>
                                    )}
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">24h Volume:</span>
                                    <span className="stat-value">
                                        {volume.toFixed(2)} XLM
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">24h Trades:</span>
                                    <span className="stat-value">
                                        {trades.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

