import React, {useMemo} from 'react'
import {AccountAddress, Amount} from '@stellar-expert/ui-framework'
import Chart from '../chart/chart'
import './asset-issuer-dashboard.scss'

/**
 * Asset issuer dashboard showing issuer statistics and assets
 */
export function AssetIssuerDashboard({issuerAddress, assets, issuerInfo}) {
    const stats = useMemo(() => {
        if (!assets || !Array.isArray(assets)) return null

        const totalAssets = assets.length
        const totalSupply = assets.reduce((sum, asset) => {
            return sum + (parseFloat(asset.supply || 0) / 10000000)
        }, 0)
        const totalTrustlines = assets.reduce((sum, asset) => {
            return sum + (parseInt(asset.trustlines || 0))
        }, 0)
        const totalVolume = assets.reduce((sum, asset) => {
            return sum + (parseFloat(asset.volume_24h || 0) / 10000000)
        }, 0)

        return {
            totalAssets,
            totalSupply,
            totalTrustlines,
            totalVolume
        }
    }, [assets])

    if (!stats) {
        return <div className="dashboard-loading">Loading issuer data...</div>
    }

    const chartData = assets.slice(0, 10).map(asset => ({
        name: asset.code || 'Unknown',
        y: parseFloat(asset.supply || 0) / 10000000
    }))

    const chartOptions = {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Top Assets by Supply'
        },
        xAxis: {
            categories: chartData.map(d => d.name)
        },
        yAxis: {
            title: {
                text: 'Supply'
            }
        },
        series: [{
            name: 'Supply',
            data: chartData.map(d => d.y),
            color: '#00f0ff'
        }]
    }

    return (
        <div className="asset-issuer-dashboard">
            <div className="dashboard-header">
                <h3>Issuer Dashboard</h3>
                <div className="issuer-address">
                    <AccountAddress account={issuerAddress} chars="all" />
                </div>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-label">Total Assets</div>
                    <div className="stat-value">{stats.totalAssets}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Supply</div>
                    <div className="stat-value">
                        {stats.totalSupply.toFixed(2)} XLM
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Trustlines</div>
                    <div className="stat-value">{stats.totalTrustlines.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">24h Volume</div>
                    <div className="stat-value">
                        {stats.totalVolume.toFixed(2)} XLM
                    </div>
                </div>
            </div>

            {chartData.length > 0 && (
                <div className="dashboard-chart">
                    <Chart
                        type="Chart"
                        options={chartOptions}
                    />
                </div>
            )}

            {issuerInfo && (
                <div className="issuer-info">
                    <h4>Issuer Information</h4>
                    {issuerInfo.home_domain && (
                        <div className="info-item">
                            <span className="info-label">Home Domain:</span>
                            <span className="info-value">{issuerInfo.home_domain}</span>
                        </div>
                    )}
                    {issuerInfo.name && (
                        <div className="info-item">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{issuerInfo.name}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

