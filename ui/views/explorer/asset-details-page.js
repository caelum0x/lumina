import React, {useState, useEffect} from 'react'
import {useParams} from 'react-router'
import {apiCall} from '../../models/api'
import {AccountAddress} from '@stellar-expert/ui-framework'
import './asset-details-page.scss'

export default function AssetDetailsPage() {
    const {asset} = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const [code, issuer] = asset.includes('-') ? asset.split('-') : [asset, null]

    useEffect(() => {
        setLoading(true)
        apiCall(`asset/${code}/details${issuer ? `?issuer=${issuer}` : ''}`)
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [code, issuer])

    if (loading) return <div className="loader">Loading asset details...</div>
    if (!data?.asset) return <div className="error">Asset not found</div>

    const {asset: assetInfo, market, chart, recent_txs, top_holders} = data

    return (
        <div className="asset-details-page">
            <div className="asset-header">
                {assetInfo.image && <img src={assetInfo.image} alt={assetInfo.code} className="asset-icon"/>}
                <div>
                    <h1>{assetInfo.code}</h1>
                    {assetInfo.domain && <a href={`https://${assetInfo.domain}`} target="_blank" rel="noopener">{assetInfo.domain}</a>}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <label>Price</label>
                    <div className="value">${market.price_usd.toFixed(4)}</div>
                </div>
                <div className="stat-card">
                    <label>Market Cap</label>
                    <div className="value">${(market.market_cap / 1e6).toFixed(2)}M</div>
                </div>
                <div className="stat-card">
                    <label>Supply</label>
                    <div className="value">{assetInfo.supply}</div>
                </div>
                <div className="stat-card">
                    <label>Holders</label>
                    <div className="value">{assetInfo.holders}</div>
                </div>
            </div>

            {chart && chart.length > 0 && (
                <div className="chart-section">
                    <h3>30-Day Price Chart</h3>
                    <div className="simple-chart">
                        {chart.map((p, i) => (
                            <div key={i} className="bar" style={{height: `${(parseFloat(p.price) / market.price_usd) * 100}%`}} title={`${p.date}: $${p.price}`}/>
                        ))}
                    </div>
                </div>
            )}

            {top_holders && top_holders.length > 0 && (
                <div className="holders-section">
                    <h3>Top Holders</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Balance</th>
                                <th>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top_holders.map((h, i) => (
                                <tr key={i}>
                                    <td><AccountAddress account={h.account} chars={12}/></td>
                                    <td>{h.balance}</td>
                                    <td>{h.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {recent_txs && recent_txs.length > 0 && (
                <div className="txs-section">
                    <h3>Recent Transactions</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Hash</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Amount</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent_txs.map((tx, i) => (
                                <tr key={i}>
                                    <td><code>{tx.hash.slice(0, 8)}...</code></td>
                                    <td>{tx.from}</td>
                                    <td>{tx.to}</td>
                                    <td>{tx.amount} {assetInfo.code}</td>
                                    <td>{tx.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
