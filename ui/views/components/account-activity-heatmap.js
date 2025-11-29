import React, {useMemo} from 'react'
import './account-activity-heatmap.scss'

/**
 * Activity heatmap showing transaction frequency over time
 * Similar to GitHub contribution graph
 */
export function AccountActivityHeatmap({transactions, days = 365}) {
    const heatmapData = useMemo(() => {
        if (!transactions || !Array.isArray(transactions)) return null

        const now = new Date()
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
        
        // Initialize grid
        const grid = {}
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
            const key = date.toISOString().split('T')[0]
            grid[key] = 0
        }

        // Count transactions per day
        transactions.forEach(tx => {
            if (!tx.created_at) return
            const txDate = new Date(tx.created_at)
            const key = txDate.toISOString().split('T')[0]
            if (grid[key] !== undefined) {
                grid[key]++
            }
        })

        // Find max for normalization
        const max = Math.max(...Object.values(grid), 1)

        return {grid, max}
    }, [transactions, days])

    const getIntensity = (count, max) => {
        if (count === 0) return 'level-0'
        const ratio = count / max
        if (ratio < 0.25) return 'level-1'
        if (ratio < 0.5) return 'level-2'
        if (ratio < 0.75) return 'level-3'
        return 'level-4'
    }

    if (!heatmapData) {
        return <div className="heatmap-loading">Loading activity data...</div>
    }

    const weeks = Math.ceil(days / 7)
    const weekLabels = ['Mon', 'Wed', 'Fri']

    return (
        <div className="account-activity-heatmap">
            <h3>Activity Heatmap ({days} days)</h3>
            <div className="heatmap-container">
                <div className="heatmap-grid">
                    {Object.entries(heatmapData.grid).map(([date, count]) => (
                        <div
                            key={date}
                            className={`heatmap-cell ${getIntensity(count, heatmapData.max)}`}
                            title={`${date}: ${count} transaction${count !== 1 ? 's' : ''}`}
                        />
                    ))}
                </div>
                <div className="heatmap-legend">
                    <span className="legend-label">Less</span>
                    <div className="legend-cells">
                        <div className="legend-cell level-0" />
                        <div className="legend-cell level-1" />
                        <div className="legend-cell level-2" />
                        <div className="legend-cell level-3" />
                        <div className="legend-cell level-4" />
                    </div>
                    <span className="legend-label">More</span>
                </div>
            </div>
        </div>
    )
}

