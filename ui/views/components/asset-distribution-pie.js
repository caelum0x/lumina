import React, {useMemo} from 'react'
import Chart from '../chart/chart'
import './asset-distribution-pie.scss'

/**
 * Asset distribution pie chart showing holder distribution
 */
export function AssetDistributionPie({holders, totalSupply}) {
    const chartData = useMemo(() => {
        if (!holders || !Array.isArray(holders) || !totalSupply) return null

        // Get top 10 holders and group the rest
        const topHolders = holders.slice(0, 10)
        const others = holders.slice(10)

        const data = topHolders.map(holder => ({
            name: holder.account?.substring(0, 8) + '...' || 'Unknown',
            y: (holder.balance / totalSupply) * 100
        }))

        if (others.length > 0) {
            const othersBalance = others.reduce((sum, h) => sum + (h.balance || 0), 0)
            data.push({
                name: `Others (${others.length})`,
                y: (othersBalance / totalSupply) * 100
            })
        }

        return data
    }, [holders, totalSupply])

    if (!chartData || chartData.length === 0) {
        return <div className="no-data">No distribution data available</div>
    }

    const chartOptions = {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Asset Distribution'
        },
        tooltip: {
            pointFormatter: function() {
                return `<b>${this.point.name}</b><br/>${this.y.toFixed(2)}%`
            }
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
        series: [{
            name: 'Holders',
            data: chartData
        }]
    }

    return (
        <div className="asset-distribution-pie">
            <Chart
                type="Chart"
                options={chartOptions}
            />
        </div>
    )
}

