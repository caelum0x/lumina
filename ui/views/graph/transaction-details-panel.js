import React from 'react'
import {useStore} from './store'
import './three-galaxy.scss'

/**
 * Format XLM amount
 */
function formatXLM(amount) {
    return (amount / 1000000).toFixed(6) + ' XLM'
}

/**
 * Format date/time
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
}

/**
 * Format address (truncate middle)
 */
function formatAddress(address) {
    if (!address) return 'N/A'
    if (address.length <= 20) return address
    return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`
}

/**
 * Transaction Details Panel Component
 */
export default function TransactionDetailsPanel() {
    const selectedTransaction = useStore(state => state.selectedTransaction)
    const setSelected = useStore(state => state.setSelected)

    if (!selectedTransaction) {
        return null
    }

    const tx = selectedTransaction

    return (
        <div className="transaction-details-panel">
            <div className="details-header">
                <h3>Transaction Details</h3>
                <button
                    className="close-button"
                    onClick={() => setSelected(null)}
                    title="Close"
                >
                    ×
                </button>
            </div>
            <div className="details-content">
                <div className="detail-section">
                    <div className="detail-label">Hash</div>
                    <div className="detail-value hash">{tx.hash || tx.id}</div>
                </div>

                <div className="detail-section">
                    <div className="detail-label">Amount</div>
                    <div className="detail-value amount">
                        {formatXLM(tx.amount || 0)}
                        {tx.isWhale && <span className="badge whale">🐋 Whale</span>}
                    </div>
                </div>

                <div className="detail-section">
                    <div className="detail-label">Fee</div>
                    <div className="detail-value">
                        {formatXLM(tx.fee || 0)}
                        {tx.highFee && <span className="badge high-fee">High Fee</span>}
                    </div>
                </div>

                <div className="detail-section">
                    <div className="detail-label">Source Account</div>
                    <div className="detail-value address">{formatAddress(tx.source)}</div>
                </div>

                {tx.destination && (
                    <div className="detail-section">
                        <div className="detail-label">Destination</div>
                        <div className="detail-value address">{formatAddress(tx.destination)}</div>
                    </div>
                )}

                <div className="detail-section">
                    <div className="detail-label">Ledger</div>
                    <div className="detail-value">{tx.ledger || 'N/A'}</div>
                </div>

                <div className="detail-section">
                    <div className="detail-label">Timestamp</div>
                    <div className="detail-value">{formatDate(tx.created_at)}</div>
                </div>

                <div className="detail-section">
                    <div className="detail-label">Status</div>
                    <div className="detail-value">
                        {tx.successful !== false ? (
                            <span className="badge success">✓ Successful</span>
                        ) : (
                            <span className="badge failed">✗ Failed</span>
                        )}
                    </div>
                </div>

                {tx.isSoroban && (
                    <div className="detail-section">
                        <div className="detail-label">Type</div>
                        <div className="detail-value">
                            <span className="badge soroban">🔷 Soroban Contract</span>
                        </div>
                    </div>
                )}

                {tx.operations && tx.operations.length > 0 && (
                    <div className="detail-section">
                        <div className="detail-label">Operations</div>
                        <div className="detail-value">
                            {tx.operations.length} operation{tx.operations.length !== 1 ? 's' : ''}
                        </div>
                        <div className="operations-list">
                            {tx.operations.slice(0, 5).map((op, idx) => (
                                <div key={idx} className="operation-item">
                                    <span className="op-type">{op.type}</span>
                                    {op.amount && (
                                        <span className="op-amount">{formatXLM(op.amount)}</span>
                                    )}
                                </div>
                            ))}
                            {tx.operations.length > 5 && (
                                <div className="operation-item more">
                                    +{tx.operations.length - 5} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="detail-actions">
                    <a
                        href={`/explorer/${window.location.pathname.includes('testnet') ? 'testnet' : 'public'}/tx/${tx.hash || tx.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-button"
                    >
                        View Full Details →
                    </a>
                </div>
            </div>
        </div>
    )
}

