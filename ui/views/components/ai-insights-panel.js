import React, {useState, useEffect, useMemo} from 'react'
import transactionAnalyzer from '../../business-logic/ai/transaction-pattern-analyzer'
import {useStore} from '../graph/store'
import './ai-insights-panel.scss'

/**
 * AI Insights Panel - Displays AI-generated insights and patterns
 */
export function AIInsightsPanel({className = ''}) {
    const transactions = useStore(state => state.transactions)
    const [insights, setInsights] = useState([])
    const [patterns, setPatterns] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedTab, setSelectedTab] = useState('insights') // 'insights', 'patterns', 'health'
    const [analysisSource, setAnalysisSource] = useState('rule-based') // 'ai' or 'rule-based'

    useEffect(() => {
        if (transactions.length === 0) {
            setInsights([])
            setPatterns(null)
            setLoading(false)
            return
        }

        setLoading(true)
        
        // Debounce analysis to avoid performance issues
        const timeoutId = setTimeout(async () => {
            try {
                // Analyze patterns (with AI if available)
                const analyzedPatterns = await transactionAnalyzer.analyzePatterns(transactions, 3600000, true)
                setPatterns(analyzedPatterns)
                
                // Check if AI was used
                if (analyzedPatterns.source === 'ai-openrouter') {
                    setAnalysisSource('ai')
                } else {
                    setAnalysisSource('rule-based')
                }

                // Generate insights
                const generatedInsights = transactionAnalyzer.generateInsights(transactions, analyzedPatterns)
                setInsights(generatedInsights)
            } catch (error) {
                console.error('Error analyzing transactions:', error)
                setInsights([])
                setPatterns(null)
                setAnalysisSource('rule-based')
            } finally {
                setLoading(false)
            }
        }, 500) // 500ms debounce

        return () => clearTimeout(timeoutId)
    }, [transactions])

    const healthStatus = useMemo(() => {
        if (!patterns?.networkHealth) return null
        return patterns.networkHealth
    }, [patterns])

    return (
        <div className={`ai-insights-panel ${className}`}>
            <div className="panel-header">
                <h3>🤖 AI Insights</h3>
                <div className="analysis-source-badge">
                    {analysisSource === 'ai' ? (
                        <span className="badge ai-active" title="Using AI-powered analysis via OpenRouter">
                            ✨ AI Active
                        </span>
                    ) : (
                        <span className="badge rule-based" title="Using rule-based analysis (AI not configured)">
                            📊 Rule-Based
                        </span>
                    )}
                </div>
                <div className="tab-selector">
                    <button
                        className={selectedTab === 'insights' ? 'active' : ''}
                        onClick={() => setSelectedTab('insights')}
                    >
                        Insights
                    </button>
                    <button
                        className={selectedTab === 'patterns' ? 'active' : ''}
                        onClick={() => setSelectedTab('patterns')}
                    >
                        Patterns
                    </button>
                    <button
                        className={selectedTab === 'health' ? 'active' : ''}
                        onClick={() => setSelectedTab('health')}
                    >
                        Health
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loader" />
                    <p>Analyzing transactions...</p>
                </div>
            ) : (
                <>
                    {selectedTab === 'insights' && (
                        <div className="insights-content">
                            {insights.length === 0 ? (
                                <div className="no-insights">
                                    <p>No insights available yet. Transactions are being analyzed...</p>
                                </div>
                            ) : (
                                <div className="insights-list">
                                    {insights.map((insight, index) => (
                                        <div key={index} className={`insight-item insight-${insight.severity}`}>
                                            <div className="insight-header">
                                                <span className={`severity-badge ${insight.severity}`}>
                                                    {insight.severity}
                                                </span>
                                                <h4>{insight.title}</h4>
                                            </div>
                                            <p className="insight-description">{insight.description}</p>
                                            {insight.recommendations && (
                                                <div className="recommendations">
                                                    {insight.recommendations.map((rec, i) => (
                                                        <div key={i} className={`recommendation recommendation-${rec.type}`}>
                                                            {rec.message}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTab === 'patterns' && patterns && (
                        <div className="patterns-content">
                            <div className="pattern-section">
                                <h4>🐋 Whale Movements</h4>
                                {patterns.whaleMovements.length === 0 ? (
                                    <p className="no-data">No significant whale movements detected</p>
                                ) : (
                                    <div className="whale-list">
                                        {patterns.whaleMovements.slice(0, 5).map((movement, i) => (
                                            <div key={i} className="whale-item">
                                                <div className="whale-path">{movement.path}</div>
                                                <div className="whale-stats">
                                                    <span>{movement.count} transactions</span>
                                                    <span>{(movement.totalAmount / 1000000).toFixed(2)} XLM</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pattern-section">
                                <h4>💹 Arbitrage Opportunities</h4>
                                {patterns.arbitrageOpportunities.length === 0 ? (
                                    <p className="no-data">No arbitrage opportunities detected</p>
                                ) : (
                                    <div className="arbitrage-list">
                                        {patterns.arbitrageOpportunities.slice(0, 5).map((opp, i) => (
                                            <div key={i} className="arbitrage-item">
                                                <div className="arbitrage-asset">{opp.asset}</div>
                                                <div className="arbitrage-details">
                                                    <span>{opp.priceChange.toFixed(2)}% price difference</span>
                                                    <span>{opp.timeWindow}ms window</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pattern-section">
                                <h4>⚠️ Unusual Patterns</h4>
                                {patterns.unusualPatterns.length === 0 ? (
                                    <p className="no-data">No unusual patterns detected</p>
                                ) : (
                                    <div className="patterns-list">
                                        {patterns.unusualPatterns.map((pattern, i) => (
                                            <div key={i} className={`pattern-item pattern-${pattern.severity}`}>
                                                <div className="pattern-type">{pattern.type}</div>
                                                <div className="pattern-details">
                                                    {pattern.account && <span>Account: {pattern.account.substring(0, 8)}...</span>}
                                                    <span>Count: {pattern.count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {selectedTab === 'health' && healthStatus && (
                        <div className="health-content">
                            <div className="health-score">
                                <div className="score-circle">
                                    <div className="score-value">{healthStatus.healthScore}</div>
                                    <div className="score-label">Health Score</div>
                                </div>
                                <div className={`status-badge status-${healthStatus.status}`}>
                                    {healthStatus.status}
                                </div>
                            </div>

                            <div className="health-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Total Transactions:</span>
                                    <span className="stat-value">{healthStatus.totalTransactions}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Success Rate:</span>
                                    <span className="stat-value">{healthStatus.successRate.toFixed(2)}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Unique Accounts:</span>
                                    <span className="stat-value">{healthStatus.uniqueAccountsCount}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Soroban Txs:</span>
                                    <span className="stat-value">{healthStatus.sorobanTransactions}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Avg Fee:</span>
                                    <span className="stat-value">{(healthStatus.averageFee / 1000000).toFixed(6)} XLM</span>
                                </div>
                            </div>

                            {healthStatus.recommendations.length > 0 && (
                                <div className="health-recommendations">
                                    <h4>Recommendations</h4>
                                    {healthStatus.recommendations.map((rec, i) => (
                                        <div key={i} className={`recommendation recommendation-${rec.type}`}>
                                            {rec.message}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

