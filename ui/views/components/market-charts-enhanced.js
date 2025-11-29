import React, {useState} from 'react'
import {TimeRangeSelector, useTimeRange} from './time-range-selector'
import Chart from '../chart/chart'
import './market-charts-enhanced.scss'

/**
 * Market price charts with technical indicators
 */
export function MarketChartsEnhanced({marketData, baseAsset, quoteAsset}) {
    const [timeRange, setTimeRange] = useState('7d')
    const [indicator, setIndicator] = useState('none')
    const {startTime} = useTimeRange(timeRange)

    // Filter data by time range
    const filteredData = React.useMemo(() => {
        if (!marketData || !startTime) return marketData || []
        return marketData.filter(entry => {
            const entryTime = entry.timestamp ? new Date(entry.timestamp).getTime() : entry[0]
            return entryTime >= startTime
        })
    }, [marketData, startTime])

    // Calculate technical indicators
    const indicators = React.useMemo(() => {
        if (!filteredData || filteredData.length === 0) return null

        const prices = filteredData.map(d => d.price || d[1] || 0)
        
        let ma = null
        if (indicator === 'ma20' && prices.length >= 20) {
            const sum = prices.slice(-20).reduce((a, b) => a + b, 0)
            ma = sum / 20
        } else if (indicator === 'ma50' && prices.length >= 50) {
            const sum = prices.slice(-50).reduce((a, b) => a + b, 0)
            ma = sum / 50
        }

        return {ma}
    }, [filteredData, indicator])

    const chartOptions = {
        chart: {
            type: 'candlestick'
        },
        title: {
            text: `${baseAsset?.code || 'Asset'}/${quoteAsset?.code || 'XLM'} Price Chart`
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Price'
            }
        },
        series: [{
            name: 'Price',
            data: filteredData?.map(d => [
                d.timestamp ? new Date(d.timestamp).getTime() : d[0],
                d.open || d[1],
                d.high || d[1],
                d.low || d[1],
                d.close || d[1]
            ]) || [],
            color: '#00f0ff'
        }],
        tooltip: {
            pointFormatter: function() {
                return `<b>${this.y.toFixed(6)}</b><br/>${new Date(this.x).toLocaleString()}`
            }
        }
    }

    if (indicators?.ma) {
        chartOptions.series.push({
            name: `MA${indicator === 'ma20' ? '20' : '50'}`,
            type: 'line',
            data: filteredData.map((d, i) => [
                d.timestamp ? new Date(d.timestamp).getTime() : d[0],
                indicators.ma
            ]),
            color: '#ff0080',
            dashStyle: 'dash'
        })
    }

    return (
        <div className="market-charts-enhanced">
            <div className="charts-header">
                <h3>Price Chart</h3>
                <div className="charts-controls">
                    <TimeRangeSelector
                        onChange={setTimeRange}
                        defaultRange={timeRange}
                    />
                    <select
                        value={indicator}
                        onChange={(e) => setIndicator(e.target.value)}
                        className="indicator-select"
                    >
                        <option value="none">No Indicator</option>
                        <option value="ma20">MA 20</option>
                        <option value="ma50">MA 50</option>
                    </select>
                </div>
            </div>
            {filteredData && filteredData.length > 0 ? (
                <Chart
                    type="StockChart"
                    options={chartOptions}
                    grouped
                    range
                />
            ) : (
                <div className="no-data">No chart data available</div>
            )}
        </div>
    )
}

