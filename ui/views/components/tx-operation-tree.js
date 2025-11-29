import React, {useState} from 'react'
import './tx-operation-tree.scss'

/**
 * Transaction operation tree view showing operation hierarchy
 */
export function TxOperationTree({operations, tx}) {
    const [expandedOps, setExpandedOps] = useState(new Set())

    const toggleOperation = (index) => {
        const newExpanded = new Set(expandedOps)
        if (newExpanded.has(index)) {
            newExpanded.delete(index)
        } else {
            newExpanded.add(index)
        }
        setExpandedOps(newExpanded)
    }

    if (!operations || operations.length === 0) {
        return <div className="no-operations">No operations in this transaction</div>
    }

    return (
        <div className="tx-operation-tree">
            <h3>Operations ({operations.length})</h3>
            <div className="operations-list">
                {operations.map((op, index) => {
                    const isExpanded = expandedOps.has(index)
                    const opType = op.type || 'unknown'
                    const opDetails = op.details || {}

                    return (
                        <div key={index} className="operation-item">
                            <div
                                className="operation-header"
                                onClick={() => toggleOperation(index)}
                            >
                                <span className="operation-number">#{index + 1}</span>
                                <span className="operation-type">{opType}</span>
                                <span className="operation-toggle">
                                    {isExpanded ? '▼' : '▶'}
                                </span>
                            </div>
                            {isExpanded && (
                                <div className="operation-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Type:</span>
                                        <span className="detail-value">{opType}</span>
                                    </div>
                                    {Object.entries(opDetails).map(([key, value]) => (
                                        <div key={key} className="detail-row">
                                            <span className="detail-label">{key}:</span>
                                            <span className="detail-value">
                                                {typeof value === 'object' 
                                                    ? JSON.stringify(value, null, 2)
                                                    : String(value)}
                                            </span>
                                        </div>
                                    ))}
                                    {op.source && (
                                        <div className="detail-row">
                                            <span className="detail-label">Source:</span>
                                            <span className="detail-value">{op.source}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

