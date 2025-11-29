import React from 'react'
import {Amount, UpdateHighlighter, useExplorerApi} from '@stellar-expert/ui-framework'

export default function FeeAnalyticsWidget() {
    const {loaded, data} = useExplorerApi('fee-analytics')
    
    if (!loaded) return <div className="loader"/>
    if (!data) return null
    
    const {current, stats, recommendation} = data
    
    const getRecommendationColor = () => {
        switch (recommendation) {
            case 'low': return '#10B981'
            case 'normal': return '#F59E0B'
            case 'high': return '#EF4444'
            default: return '#8B5CF6'
        }
    }
    
    const getRecommendationText = () => {
        switch (recommendation) {
            case 'low': return '✅ Low fees - Good time to transact'
            case 'normal': return '⚠️ Normal fees'
            case 'high': return '🔴 High fees - Network congested'
            default: return 'Unknown'
        }
    }
    
    return (
        <div className="segment blank">
            <h3>Network Fees</h3>
            <hr className="flare"/>
            
            <div style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '6px',
                background: `${getRecommendationColor()}22`,
                border: `1px solid ${getRecommendationColor()}`,
                color: getRecommendationColor(),
                fontWeight: '500'
            }}>
                {getRecommendationText()}
            </div>
            
            <dl>
                <dt>Current Base Fee:</dt>
                <dd>
                    <UpdateHighlighter>
                        {current.base_fee_xlm} XLM
                    </UpdateHighlighter>
                    <span className="dimmed text-small"> ({current.base_fee} stroops)</span>
                </dd>
                
                <dt>Base Reserve:</dt>
                <dd>
                    <UpdateHighlighter>
                        {current.base_reserve_xlm} XLM
                    </UpdateHighlighter>
                </dd>
                
                <dt>24h Average Fee:</dt>
                <dd>
                    <UpdateHighlighter>
                        {stats.avg_fee_xlm} XLM
                    </UpdateHighlighter>
                </dd>
                
                <dt>24h Fee Range:</dt>
                <dd>
                    <span className="dimmed">
                        {stats.min_fee_xlm} - {stats.max_fee_xlm} XLM
                    </span>
                </dd>
            </dl>
            
            <div className="text-small dimmed" style={{marginTop: '12px'}}>
                💡 Tip: Use {stats.median_fee_xlm} XLM for reliable transaction confirmation
            </div>
        </div>
    )
}
