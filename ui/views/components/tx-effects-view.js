import React, {useState} from 'react'
import './tx-effects-view.scss'

/**
 * Transaction effects visualization with categorized display
 */
export function TxEffectsView({effects, tx}) {
    const [filter, setFilter] = useState('all')

    if (!effects || effects.length === 0) {
        return <div className="no-effects">No effects for this transaction</div>
    }

    // Categorize effects
    const categorized = {
        account: [],
        trustline: [],
        offer: [],
        data: [],
        signer: [],
        contract: [],
        other: []
    }

    effects.forEach(effect => {
        const type = effect.type || 'unknown'
        if (type.includes('Account')) {
            categorized.account.push(effect)
        } else if (type.includes('Trustline') || type.includes('Trust')) {
            categorized.trustline.push(effect)
        } else if (type.includes('Offer')) {
            categorized.offer.push(effect)
        } else if (type.includes('Data')) {
            categorized.data.push(effect)
        } else if (type.includes('Signer')) {
            categorized.signer.push(effect)
        } else if (type.includes('Contract') || type.includes('Soroban')) {
            categorized.contract.push(effect)
        } else {
            categorized.other.push(effect)
        }
    })

    const filteredEffects = filter === 'all' 
        ? effects 
        : categorized[filter] || []

    return (
        <div className="tx-effects-view">
            <div className="effects-header">
                <h3>Transaction Effects ({effects.length})</h3>
                <div className="effects-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    {Object.entries(categorized).map(([cat, items]) => {
                        if (items.length === 0) return null
                        return (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)} ({items.length})
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="effects-list">
                {filteredEffects.map((effect, index) => (
                    <div key={index} className="effect-item">
                        <div className="effect-type">
                            {effect.type || 'Unknown'}
                        </div>
                        <div className="effect-details">
                            {Object.entries(effect).map(([key, value]) => {
                                if (key === 'type') return null
                                return (
                                    <div key={key} className="effect-field">
                                        <span className="field-label">{key}:</span>
                                        <span className="field-value">
                                            {typeof value === 'object' 
                                                ? JSON.stringify(value, null, 2)
                                                : String(value)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

