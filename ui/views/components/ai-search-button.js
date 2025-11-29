import React, {useState} from 'react'
import './ai-search.scss'

export default function AISearchButton({query, results, onAnalysis}) {
    const [loading, setLoading] = useState(false)
    const [insights, setInsights] = useState(null)

    const handleAnalyze = async () => {
        setLoading(true)
        try {
            const res = await fetch('http://localhost:3000/explorer/public/ai/analyze', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query, results, context: 'search'})
            })
            const data = await res.json()
            setInsights(data)
            if (onAnalysis) onAnalysis(data)
        } catch (e) {
            setInsights({insights: 'Analysis failed', summary: 'Error', recommendations: []})
        }
        setLoading(false)
    }

    return (
        <div className="ai-search-container">
            <button 
                className="ai-search-button" 
                onClick={handleAnalyze}
                disabled={loading || !query}
            >
                🤖 {loading ? 'Analyzing...' : 'AI Analyze'}
            </button>
            
            {insights && (
                <div className="ai-insights-panel">
                    <div className="ai-insights-header">
                        <h3>AI Insights</h3>
                        <button onClick={() => setInsights(null)}>×</button>
                    </div>
                    <div className="ai-insights-content">
                        <p>{insights.insights}</p>
                        {insights.recommendations?.length > 0 && (
                            <div className="ai-recommendations">
                                <strong>Recommendations:</strong>
                                <ul>
                                    {insights.recommendations.map((r, i) => (
                                        <li key={i}>{r}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
