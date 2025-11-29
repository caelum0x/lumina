import React, {useState, useEffect, useMemo} from 'react'
import {useStore} from '../graph/store'
import {analyzePatterns} from '../../business-logic/ai/transaction-pattern-analyzer'
import './ai-insights-panel-enhanced.scss'

export function AIInsightsPanelEnhanced() {
    const transactions = useStore(state => state.transactions)
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selectedTab, setSelectedTab] = useState('overview')

    const sorobanTxs = useMemo(() => 
        transactions.filter(tx => tx.isSoroban), 
        [transactions]
    )

    const contractStats = useMemo(() => {
        const contracts = {}
        sorobanTxs.forEach(tx => {
            const addr = tx.contract || tx.source
            if (!contracts[addr]) {
                contracts[addr] = {address: addr, calls: 0, volume: 0}
            }
            contracts[addr].calls++
            contracts[addr].volume += parseFloat(tx.amount || 0)
        })
        return Object.values(contracts).sort((a, b) => b.calls - a.calls).slice(0, 10)
    }, [sorobanTxs])

    useEffect(() => {
        if (transactions.length < 10) return
        
        setLoading(true)
        analyzePatterns(transactions, 3600000, true)
            .then(setAnalysis)
            .catch(setError)
            .finally(() => setLoading(false))
    }, [transactions.length])

    if (loading) return <div className="ai-insights-loading">🤖 Analyzing...</div>
    if (error) return <div className="ai-insights-error">❌ {error.message}</div>
    if (!analysis) return <div className="ai-insights-empty">Waiting for data...</div>

    return (
        <div className="ai-insights-enhanced">
            <div className="ai-tabs">
                <button className={selectedTab === 'overview' ? 'active' : ''} 
                        onClick={() => setSelectedTab('overview')}>Overview</button>
                <button className={selectedTab === 'soroban' ? 'active' : ''} 
                        onClick={() => setSelectedTab('soroban')}>Soroban</button>
                <button className={selectedTab === 'patterns' ? 'active' : ''} 
                        onClick={() => setSelectedTab('patterns')}>Patterns</button>
            </div>

            {selectedTab === 'overview' && (
                <div className="ai-tab-content">
                    <div className="insight-card">
                        <h4>Network Health</h4>
                        <div className="health-score" style={{color: analysis.networkHealth.healthScore > 70 ? '#0f0' : '#f80'}}>
                            {analysis.networkHealth.healthScore}/100
                        </div>
                        <p>{analysis.networkHealth.status}</p>
                    </div>
                    {analysis.insights.slice(0, 3).map((insight, i) => (
                        <div key={i} className="insight-card">
                            <p>{insight}</p>
                        </div>
                    ))}
                </div>
            )}

            {selectedTab === 'soroban' && (
                <div className="ai-tab-content">
                    <div className="soroban-stats">
                        <div className="stat">
                            <span className="label">Total Calls</span>
                            <span className="value">{sorobanTxs.length}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Unique Contracts</span>
                            <span className="value">{contractStats.length}</span>
                        </div>
                    </div>
                    <h4>Top Contracts</h4>
                    <div className="contract-list">
                        {contractStats.map((c, i) => (
                            <div key={i} className="contract-item">
                                <div className="contract-rank">#{i + 1}</div>
                                <div className="contract-info">
                                    <div className="contract-addr">{c.address.substring(0, 8)}...{c.address.substring(c.address.length - 6)}</div>
                                    <div className="contract-stats">
                                        <span>{c.calls} calls</span>
                                        <span>{(c.volume / 10000000).toFixed(2)} XLM</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedTab === 'patterns' && (
                <div className="ai-tab-content">
                    {analysis.whaleMovements.length > 0 && (
                        <div className="pattern-section">
                            <h4>🐋 Whale Movements</h4>
                            {analysis.whaleMovements.map((w, i) => (
                                <div key={i} className="pattern-item">{w}</div>
                            ))}
                        </div>
                    )}
                    {analysis.arbitrageOpportunities.length > 0 && (
                        <div className="pattern-section">
                            <h4>💰 Arbitrage</h4>
                            {analysis.arbitrageOpportunities.map((a, i) => (
                                <div key={i} className="pattern-item">{a}</div>
                            ))}
                        </div>
                    )}
                    {analysis.unusualPatterns.length > 0 && (
                        <div className="pattern-section">
                            <h4>⚠️ Unusual Patterns</h4>
                            {analysis.unusualPatterns.map((p, i) => (
                                <div key={i} className="pattern-item">{p}</div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
