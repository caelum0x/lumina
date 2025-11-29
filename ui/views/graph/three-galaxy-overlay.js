import React, {useState, useEffect} from 'react'
import {useStore} from './store'
import './three-galaxy.scss'

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toFixed(0)
}

export default function ThreeGalaxyOverlay() {
    const stats = useStore(state => state.stats)
    const connectionStatus = useStore(state => state.connectionStatus)
    const viewMode = useStore(state => state.viewMode)
    const setViewMode = useStore(state => state.setViewMode)
    const selected = useStore(state => state.selected)
    const [networkStats, setNetworkStats] = useState({tps: '0', volume_24h_xlm: '0'})
    const [whales, setWhales] = useState([])
    const [showLegend, setShowLegend] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:3000/explorer/public/network/stats')
                const data = await res.json()
                setNetworkStats(data)
            } catch (e) {}
        }
        fetchStats()
        const interval = setInterval(fetchStats, 5000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const fetchWhales = async () => {
            try {
                const res = await fetch('http://localhost:3000/explorer/public/whales/recent')
                const data = await res.json()
                setWhales(data.records || [])
            } catch (e) {}
        }
        fetchWhales()
        const interval = setInterval(fetchWhales, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleBack = () => {
        window.history.back()
    }

    return (
        <div className="three-galaxy-overlay">
            <div className="overlay-header">
                <button className="back-button" onClick={handleBack}>
                    ← Back
                </button>
                <h1>Lumina 3D</h1>
                <div className={`status ${connectionStatus}`}>
                    {connectionStatus === 'connected' ? '🟢 Live' : '🔴 Connecting'}
                </div>
            </div>

            <div className="stats-panel">
                <div className="stat-box">
                    <div className="stat-label">TRANSACTIONS</div>
                    <div className="stat-value">{formatNumber(stats.totalTransactions || 0)}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">TX/SEC</div>
                    <div className="stat-value">{networkStats.tps || '0'}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">VOLUME</div>
                    <div className="stat-value">{formatNumber(parseFloat(networkStats.volume_24h_xlm?.replace(/,/g, '') || 0))} XLM</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">WHALES</div>
                    <div className="stat-value">{whales.length}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">SOROBAN</div>
                    <div className="stat-value">{whales.filter(w => w.type === 'soroban_whale').length}</div>
                </div>
            </div>

            {showLegend && (
                <div className="color-legend">
                    <div className="legend-header">
                        <h3>Color Legend</h3>
                        <button onClick={() => setShowLegend(false)}>×</button>
                    </div>
                    <div className="legend-items">
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#6B46C1'}}></span>
                            <span>Regular Transaction</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#ff0080'}}></span>
                            <span>Whale (Large Transfer)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#00ffff'}}></span>
                            <span>Soroban Contract</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#ff4400'}}></span>
                            <span>High Fee Transaction</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{background: '#00ff00'}}></span>
                            <span>SDF Validator</span>
                        </div>
                    </div>
                </div>
            )}

            {!showLegend && (
                <button className="show-legend-btn" onClick={() => setShowLegend(true)}>
                    Show Legend
                </button>
            )}

            {selected && (
                <div className="transaction-details">
                    <div className="details-header">
                        <h3>Transaction Details</h3>
                        <button onClick={() => useStore.getState().setSelected(null)}>×</button>
                    </div>
                    <div className="details-content">
                        <div className="detail-row">
                            <span className="detail-label">Hash:</span>
                            <span className="detail-value">{selected.hash?.substring(0, 16)}...</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Amount:</span>
                            <span className="detail-value">{selected.amount || 'N/A'} XLM</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Type:</span>
                            <span className="detail-value">
                                {selected.isWhale ? 'Whale' : selected.isSoroban ? 'Soroban' : 'Regular'}
                            </span>
                        </div>
                        {selected.source && (
                            <div className="detail-row">
                                <span className="detail-label">Source:</span>
                                <span className="detail-value">{selected.source.substring(0, 16)}...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="view-controls">
                <button 
                    className={viewMode === 'galaxy' ? 'active' : ''}
                    onClick={() => setViewMode('galaxy')}
                >
                    GALAXY
                </button>
            </div>

            {whales.length > 0 && (
                <div className="whales-panel">
                    <h3>Recent Whales</h3>
                    <div className="whale-list">
                        {whales.slice(0, 5).map((whale, i) => (
                            <div key={i} className="whale-item" style={{borderLeft: `3px solid ${whale.color || '#ff6b00'}`}}>
                                <div className="whale-amount">{whale.amount_xlm} XLM</div>
                                <div className="whale-type">{whale.asset}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
