import React, {useMemo} from 'react'
import './market-liquidity-indicator.scss'

/**
 * Market liquidity indicator showing depth and spread
 */
export function MarketLiquidityIndicator({orderbook, marketInfo}) {
    const liquidityMetrics = useMemo(() => {
        if (!orderbook || !orderbook.bids || !orderbook.asks) return null

        const bids = orderbook.bids || []
        const asks = orderbook.asks || []

        // Calculate spread
        const bestBid = bids[0]?.price || 0
        const bestAsk = asks[0]?.price || 0
        const spread = bestAsk - bestBid
        const spreadPercent = bestBid > 0 ? (spread / bestBid) * 100 : 0

        // Calculate depth (total volume within 1% of mid price)
        const midPrice = (bestBid + bestAsk) / 2
        const depthRange = midPrice * 0.01

        const bidDepth = bids
            .filter(bid => bid.price >= midPrice - depthRange)
            .reduce((sum, bid) => sum + parseFloat(bid.amount || 0), 0)

        const askDepth = asks
            .filter(ask => ask.price <= midPrice + depthRange)
            .reduce((sum, ask) => sum + parseFloat(ask.amount || 0), 0)

        // Liquidity score (0-100)
        const liquidityScore = Math.min(100, Math.max(0, 
            100 - (spreadPercent * 10) + Math.min(bidDepth + askDepth, 50)
        ))

        return {
            spread,
            spreadPercent,
            bidDepth,
            askDepth,
            midPrice,
            liquidityScore
        }
    }, [orderbook])

    if (!liquidityMetrics) {
        return <div className="liquidity-loading">Calculating liquidity...</div>
    }

    const getLiquidityLevel = (score) => {
        if (score >= 80) return {level: 'high', color: '#00ff00', label: 'High'}
        if (score >= 50) return {level: 'medium', color: '#ffc800', label: 'Medium'}
        return {level: 'low', color: '#ff0000', label: 'Low'}
    }

    const level = getLiquidityLevel(liquidityMetrics.liquidityScore)

    return (
        <div className="market-liquidity-indicator">
            <h3>Liquidity Analysis</h3>
            <div className="liquidity-metrics">
                <div className="metric-card score">
                    <div className="metric-label">Liquidity Score</div>
                    <div className="metric-value" style={{color: level.color}}>
                        {liquidityMetrics.liquidityScore.toFixed(1)}
                        <span className="metric-unit">/100</span>
                    </div>
                    <div className="metric-level" style={{color: level.color}}>
                        {level.label} Liquidity
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Spread</div>
                    <div className="metric-value">
                        {liquidityMetrics.spreadPercent.toFixed(4)}%
                    </div>
                    <div className="metric-detail">
                        {liquidityMetrics.spread.toFixed(8)}
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Bid Depth</div>
                    <div className="metric-value">
                        {liquidityMetrics.bidDepth.toFixed(2)}
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Ask Depth</div>
                    <div className="metric-value">
                        {liquidityMetrics.askDepth.toFixed(2)}
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Mid Price</div>
                    <div className="metric-value">
                        {liquidityMetrics.midPrice.toFixed(6)}
                    </div>
                </div>
            </div>

            <div className="liquidity-bar">
                <div 
                    className="liquidity-fill"
                    style={{
                        width: `${liquidityMetrics.liquidityScore}%`,
                        backgroundColor: level.color
                    }}
                />
            </div>
        </div>
    )
}

