import React, {useState} from 'react'
import {TimeRangeSelector, useTimeRange} from './time-range-selector'
import Chart from '../chart/chart'
import './asset-price-history.scss'

/**
 * Asset price history with multiple timeframes
 */
export function AssetPriceHistory({asset, priceHistory, className = ''}) {
    const [timeRange, setTimeRange] = useState('7d')
    const {startTime} = useTimeRange(timeRange)

    // Filter price history by time range
    const filteredHistory = React.useMemo(() => {
        if (!priceHistory || !startTime) return priceHistory || []

        return priceHistory.filter(entry => {
            const entryTime = entry.timestamp ? new Date(entry.timestamp).getTime() : entry[0]
            return entryTime >= startTime
        })
    }, [priceHistory, startTime])

    // Prepare chart data
    const chartData = React.useMemo(() => {
        if (!filteredHistory || filteredHistory.length === 0) return null

        return filteredHistory.map(entry => {
            const timestamp = entry.timestamp ? new Date(entry.timestamp).getTime() : entry[0]
            const price = entry.price || entry[1] || 0
            return [timestamp, price]
        })
    }, [filteredHistory])

    if (!priceHistory || priceHistory.length === 0) {
        return (
            <div className={`asset-price-history ${className}`}>
                <div className="no-data">No price history available</div>
            </div>
        )
    }

    const chartOptions = {
        chart: {
            type: 'line'
        },
        title: {
            text: `${asset?.code || 'Asset'} Price History`
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Price (XLM)'
            }
        },
        series: [{
            name: 'Price',
            data: chartData,
            color: '#00f0ff'
        }],
        tooltip: {
            pointFormatter: function() {
                return `<b>${this.y.toFixed(6)} XLM</b><br/>${new Date(this.x).toLocaleString()}`
            }
        }
    }

    return (
        <div className={`asset-price-history ${className}`}>
            <div className="price-history-header">
                <h3>Price History</h3>
                <TimeRangeSelector
                    onChange={setTimeRange}
                    defaultRange={timeRange}
                />
            </div>
            {chartData && (
                <Chart
                    type="StockChart"
                    options={chartOptions}
                    grouped
                    range
                />
            )}
        </div>
    )
}

