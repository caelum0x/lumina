import React, {useState, useEffect} from 'react'
import {useExplorerApi} from '@stellar-expert/ui-framework'
import {retrieveLedgerInfo} from '../../business-logic/ledger-info-helper'
import {useNotifications} from './notification-system'
import './ledger-comparison.scss'

/**
 * Ledger comparison tool for comparing two ledgers
 */
export function LedgerComparison({onCompare}) {
    const [ledger1Seq, setLedger1Seq] = useState('')
    const [ledger2Seq, setLedger2Seq] = useState('')
    const [comparing, setComparing] = useState(false)
    const [comparison, setComparison] = useState(null)
    const {showError} = useNotifications()

    const ledger1Info = useExplorerApi(ledger1Seq ? `ledger/${ledger1Seq}` : null)
    const ledger2Info = useExplorerApi(ledger2Seq ? `ledger/${ledger2Seq}` : null)

    useEffect(() => {
        if (ledger1Info.loaded && ledger2Info.loaded && !ledger1Info.error && !ledger2Info.error) {
            performComparison()
        }
    }, [ledger1Info.loaded, ledger2Info.loaded, ledger1Info.error, ledger2Info.error])

    const performComparison = () => {
        if (!ledger1Info.data || !ledger2Info.data) return

        const ledger1 = retrieveLedgerInfo(ledger1Info.data)
        const ledger2 = retrieveLedgerInfo(ledger2Info.data)

        const result = {
            ledger1: {
                sequence: ledger1.sequence,
                timestamp: ledger1.ts,
                txSuccess: ledger1.txSuccess || 0,
                txFailed: ledger1.txFailed || 0,
                operations: ledger1.operations || 0,
                accounts: ledger1.accounts || 0,
                assets: ledger1.assets || 0,
                trustlines: ledger1.trustlines || 0,
                feePool: ledger1.feePool || 0,
                baseFee: ledger1.baseFee || 0,
                protocol: ledger1.protocol || 0
            },
            ledger2: {
                sequence: ledger2.sequence,
                timestamp: ledger2.ts,
                txSuccess: ledger2.txSuccess || 0,
                txFailed: ledger2.txFailed || 0,
                operations: ledger2.operations || 0,
                accounts: ledger2.accounts || 0,
                assets: ledger2.assets || 0,
                trustlines: ledger2.trustlines || 0,
                feePool: ledger2.feePool || 0,
                baseFee: ledger2.baseFee || 0,
                protocol: ledger2.protocol || 0
            },
            differences: {
                sequence: ledger2.sequence - ledger1.sequence,
                timeDifference: (ledger2.ts - ledger1.ts) * 1000, // Convert to milliseconds
                txSuccess: ledger2.txSuccess - ledger1.txSuccess,
                txFailed: ledger2.txFailed - ledger1.txFailed,
                operations: ledger2.operations - ledger1.operations,
                accounts: ledger2.accounts - ledger1.accounts,
                assets: ledger2.assets - ledger1.assets,
                trustlines: ledger2.trustlines - ledger1.trustlines,
                feePool: ledger2.feePool - ledger1.feePool,
                baseFee: ledger2.baseFee - ledger1.baseFee,
                protocol: ledger2.protocol - ledger1.protocol
            }
        }

        setComparison(result)
        onCompare?.(result)
        setComparing(false)
    }

    const handleCompare = async () => {
        if (!ledger1Seq || !ledger2Seq) {
            showError('Please enter both ledger sequences')
            return
        }

        const seq1 = parseInt(ledger1Seq, 10)
        const seq2 = parseInt(ledger2Seq, 10)

        if (isNaN(seq1) || isNaN(seq2)) {
            showError('Please enter valid ledger sequences')
            return
        }

        if (seq1 === seq2) {
            showError('Please enter two different ledger sequences')
            return
        }

        setComparing(true)
        setComparison(null)

        // The useEffect will trigger comparison when both ledgers are loaded
    }

    return (
        <div className="ledger-comparison">
            <h3>Ledger Comparison</h3>
            <div className="comparison-form">
                <div className="form-group">
                    <label>
                        Ledger 1:
                        <input
                            type="number"
                            value={ledger1Seq}
                            onChange={(e) => setLedger1Seq(e.target.value)}
                            placeholder="Enter ledger sequence"
                        />
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        Ledger 2:
                        <input
                            type="number"
                            value={ledger2Seq}
                            onChange={(e) => setLedger2Seq(e.target.value)}
                            placeholder="Enter ledger sequence"
                        />
                    </label>
                </div>
                <button
                    className="compare-button"
                    onClick={handleCompare}
                    disabled={comparing || !ledger1Seq || !ledger2Seq || ledger1Info.loading || ledger2Info.loading}
                >
                    {comparing ? 'Comparing...' : 'Compare Ledgers'}
                </button>
            </div>

            {(ledger1Info.error || ledger2Info.error) && (
                <div className="comparison-error">
                    {ledger1Info.error && `Failed to load ledger ${ledger1Seq}. `}
                    {ledger2Info.error && `Failed to load ledger ${ledger2Seq}.`}
                </div>
            )}

            {comparison && (
                <div className="comparison-results">
                    <h4>Comparison Results</h4>
                    <div className="comparison-summary">
                        <div className="summary-item">
                            <span className="summary-label">Ledger Sequence Difference:</span>
                            <span className="summary-value">{comparison.differences.sequence.toLocaleString()}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Time Difference:</span>
                            <span className="summary-value">
                                {formatTimeDifference(comparison.differences.timeDifference)}
                            </span>
                        </div>
                    </div>
                    <div className="comparison-details">
                        <div className="comparison-side">
                            <h5>Ledger {comparison.ledger1.sequence}</h5>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Successful TX:</span>
                                    <span className="detail-value">{comparison.ledger1.txSuccess.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Failed TX:</span>
                                    <span className="detail-value">{comparison.ledger1.txFailed.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Operations:</span>
                                    <span className="detail-value">{comparison.ledger1.operations.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Accounts:</span>
                                    <span className="detail-value">{comparison.ledger1.accounts.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Assets:</span>
                                    <span className="detail-value">{comparison.ledger1.assets.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Trustlines:</span>
                                    <span className="detail-value">{comparison.ledger1.trustlines.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Fee Pool:</span>
                                    <span className="detail-value">{(comparison.ledger1.feePool / 10000000).toFixed(2)} XLM</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Base Fee:</span>
                                    <span className="detail-value">{comparison.ledger1.baseFee} stroops</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Protocol:</span>
                                    <span className="detail-value">{comparison.ledger1.protocol}</span>
                                </div>
                            </div>
                        </div>
                        <div className="comparison-differences">
                            <h5>Differences</h5>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">TX Success Δ:</span>
                                    <span className={`detail-value ${comparison.differences.txSuccess >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.txSuccess >= 0 ? '+' : ''}{comparison.differences.txSuccess.toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">TX Failed Δ:</span>
                                    <span className={`detail-value ${comparison.differences.txFailed >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.txFailed >= 0 ? '+' : ''}{comparison.differences.txFailed.toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Operations Δ:</span>
                                    <span className={`detail-value ${comparison.differences.operations >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.operations >= 0 ? '+' : ''}{comparison.differences.operations.toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Accounts Δ:</span>
                                    <span className={`detail-value ${comparison.differences.accounts >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.accounts >= 0 ? '+' : ''}{comparison.differences.accounts.toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Assets Δ:</span>
                                    <span className={`detail-value ${comparison.differences.assets >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.assets >= 0 ? '+' : ''}{comparison.differences.assets.toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Trustlines Δ:</span>
                                    <span className={`detail-value ${comparison.differences.trustlines >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.trustlines >= 0 ? '+' : ''}{comparison.differences.trustlines.toLocaleString()}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Fee Pool Δ:</span>
                                    <span className={`detail-value ${comparison.differences.feePool >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.feePool >= 0 ? '+' : ''}{(comparison.differences.feePool / 10000000).toFixed(2)} XLM
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Base Fee Δ:</span>
                                    <span className={`detail-value ${comparison.differences.baseFee >= 0 ? 'positive' : 'negative'}`}>
                                        {comparison.differences.baseFee >= 0 ? '+' : ''}{comparison.differences.baseFee} stroops
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Protocol Δ:</span>
                                    <span className={`detail-value ${comparison.differences.protocol !== 0 ? 'changed' : ''}`}>
                                        {comparison.differences.protocol !== 0 ? `${comparison.ledger1.protocol} → ${comparison.ledger2.protocol}` : 'No change'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="comparison-side">
                            <h5>Ledger {comparison.ledger2.sequence}</h5>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Successful TX:</span>
                                    <span className="detail-value">{comparison.ledger2.txSuccess.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Failed TX:</span>
                                    <span className="detail-value">{comparison.ledger2.txFailed.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Operations:</span>
                                    <span className="detail-value">{comparison.ledger2.operations.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Accounts:</span>
                                    <span className="detail-value">{comparison.ledger2.accounts.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Assets:</span>
                                    <span className="detail-value">{comparison.ledger2.assets.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Trustlines:</span>
                                    <span className="detail-value">{comparison.ledger2.trustlines.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Fee Pool:</span>
                                    <span className="detail-value">{(comparison.ledger2.feePool / 10000000).toFixed(2)} XLM</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Base Fee:</span>
                                    <span className="detail-value">{comparison.ledger2.baseFee} stroops</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Protocol:</span>
                                    <span className="detail-value">{comparison.ledger2.protocol}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function formatTimeDifference(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''}, ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`
    return `${seconds} second${seconds !== 1 ? 's' : ''}`
}

