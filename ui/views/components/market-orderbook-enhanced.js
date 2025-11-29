import React, {useState} from 'react'
import Chart from '../chart/chart'
import './market-orderbook-enhanced.scss'

/**
 * Enhanced market orderbook visualization with depth chart
 */
export function MarketOrderbookEnhanced({bids, asks, baseAsset, quoteAsset}) {
    const [viewMode, setViewMode] = useState('table') // 'table' or 'depth'

    if (!bids || !asks) {
        return <div className="orderbook-loading">Loading orderbook...</div>
    }

    // Calculate depth chart data
    const depthData = React.useMemo(() => {
        const bidDepth = []
        const askDepth = []
        let bidTotal = 0
        let askTotal = 0

        // Process bids (descending price)
        bids.slice().reverse().forEach(bid => {
            bidTotal += parseFloat(bid.amount || 0)
            bidDepth.push({
                price: parseFloat(bid.price || 0),
                amount: bidTotal
            })
        })

        // Process asks (ascending price)
        asks.forEach(ask => {
            askTotal += parseFloat(ask.amount || 0)
            askDepth.push({
                price: parseFloat(ask.price || 0),
                amount: askTotal
            })
        })

        return {bids: bidDepth, asks: askDepth}
    }, [bids, asks])

    return (
        <div className="market-orderbook-enhanced">
            <div className="orderbook-header">
                <h3>Orderbook</h3>
                <div className="view-mode-toggle">
                    <button
                        className={viewMode === 'table' ? 'active' : ''}
                        onClick={() => setViewMode('table')}
                    >
                        Table
                    </button>
                    <button
                        className={viewMode === 'depth' ? 'active' : ''}
                        onClick={() => setViewMode('depth')}
                    >
                        Depth Chart
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="orderbook-table">
                    <div className="orderbook-side asks">
                        <div className="side-header">Asks (Sell Orders)</div>
                        <div className="orderbook-rows">
                            {asks.slice(0, 10).map((ask, i) => (
                                <div key={i} className="orderbook-row ask">
                                    <span className="price">{parseFloat(ask.price || 0).toFixed(6)}</span>
                                    <span className="amount">{parseFloat(ask.amount || 0).toFixed(2)}</span>
                                    <span className="total">{parseFloat(ask.total || 0).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="orderbook-spread">
                        <div className="spread-value">
                            Spread: {asks[0] && bids[0] 
                                ? (parseFloat(asks[0].price) - parseFloat(bids[0].price)).toFixed(6)
                                : 'Calculating...'}
                        </div>
                    </div>
                    <div className="orderbook-side bids">
                        <div className="side-header">Bids (Buy Orders)</div>
                        <div className="orderbook-rows">
                            {bids.slice(0, 10).map((bid, i) => (
                                <div key={i} className="orderbook-row bid">
                                    <span className="price">{parseFloat(bid.price || 0).toFixed(6)}</span>
                                    <span className="amount">{parseFloat(bid.amount || 0).toFixed(2)}</span>
                                    <span className="total">{parseFloat(bid.total || 0).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="depth-chart">
                    <Chart
                        type="Chart"
                        options={{
                            chart: {
                                type: 'area',
                                height: 400
                            },
                            title: {
                                text: 'Orderbook Depth'
                            },
                            xAxis: {
                                type: 'linear',
                                title: {
                                    text: 'Price'
                                },
                                min: Math.min(
                                    ...depthData.bids.map(d => d.price),
                                    ...depthData.asks.map(d => d.price)
                                ) * 0.99,
                                max: Math.max(
                                    ...depthData.bids.map(d => d.price),
                                    ...depthData.asks.map(d => d.price)
                                ) * 1.01
                            },
                            yAxis: {
                                title: {
                                    text: 'Cumulative Volume'
                                },
                                min: 0
                            },
                            tooltip: {
                                shared: true,
                                formatter: function() {
                                    let tooltip = `<b>Price: ${this.x.toFixed(6)}</b><br/>`
                                    this.points.forEach(point => {
                                        tooltip += `${point.series.name}: ${point.y.toFixed(2)}<br/>`
                                    })
                                    return tooltip
                                }
                            },
                            plotOptions: {
                                area: {
                                    fillOpacity: 0.5,
                                    lineWidth: 2,
                                    marker: {
                                        enabled: false
                                    }
                                }
                            },
                            series: [
                                {
                                    name: 'Bids',
                                    data: depthData.bids.map(d => [d.price, d.amount]),
                                    color: '#00ff00',
                                    fillColor: {
                                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                                        stops: [
                                            [0, 'rgba(0, 255, 0, 0.3)'],
                                            [1, 'rgba(0, 255, 0, 0)']
                                        ]
                                    }
                                },
                                {
                                    name: 'Asks',
                                    data: depthData.asks.map(d => [d.price, d.amount]),
                                    color: '#ff0000',
                                    fillColor: {
                                        linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
                                        stops: [
                                            [0, 'rgba(255, 0, 0, 0.3)'],
                                            [1, 'rgba(255, 0, 0, 0)']
                                        ]
                                    }
                                }
                            ]
                        }}
                        container=""
                        noLegend
                    />
                </div>
            )}
        </div>
    )
}

