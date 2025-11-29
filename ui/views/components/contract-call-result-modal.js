import React from 'react'
import {useNotifications} from './notification-system'
import sorobanRpcClient from '../../business-logic/api/soroban-rpc-client'
import './contract-call-result-modal.scss'

/**
 * Modal component for displaying contract function call results
 */
export function ContractCallResultModal({result, error, onClose, contractAddress, functionName}) {
    const {showError} = useNotifications()

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Notification will be shown by parent component
            })
            .catch(err => {
                showError('Failed to copy to clipboard')
            })
    }

    const handleExport = () => {
        const exportData = {
            contract: contractAddress,
            function: functionName,
            timestamp: new Date().toISOString(),
            result: result,
            error: error
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `contract-call-${contractAddress.substring(0, 8)}-${Date.now()}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    if (!result && !error) {
        return null
    }

    return (
        <div className="contract-call-result-modal-overlay" onClick={onClose}>
            <div className="contract-call-result-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Function Call Result</h3>
                    <button className="close-button" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    {error ? (
                        <div className="result-error">
                            <h4>Error</h4>
                            <div className="error-message">{error.message || String(error)}</div>
                            {error.stack && (
                                <details className="error-stack">
                                    <summary>Stack Trace</summary>
                                    <pre>{error.stack}</pre>
                                </details>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="result-section">
                                <h4>Return Value</h4>
                                <div className="result-value">
                                    <pre>{typeof result.result === 'object' 
                                        ? JSON.stringify(sorobanRpcClient.formatScVal(result.result), null, 2)
                                        : String(result.result)}</pre>
                                    <button 
                                        className="copy-button"
                                        onClick={() => handleCopy(String(result.result))}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>

                            {result.cost && (
                                <div className="result-section">
                                    <h4>Execution Cost</h4>
                                    <div className="cost-details">
                                        <div className="cost-item">
                                            <span className="cost-label">CPU Instructions:</span>
                                            <span className="cost-value">{result.cost.cpuInsns.toLocaleString()}</span>
                                        </div>
                                        <div className="cost-item">
                                            <span className="cost-label">Memory Bytes:</span>
                                            <span className="cost-value">{result.cost.memBytes.toLocaleString()}</span>
                                        </div>
                                        {result.minResourceFee && (
                                            <div className="cost-item">
                                                <span className="cost-label">Min Resource Fee:</span>
                                                <span className="cost-value">
                                                    {(parseInt(result.minResourceFee) / 1000000).toFixed(6)} XLM
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {result.events && result.events.length > 0 && (
                                <div className="result-section">
                                    <h4>Events ({result.events.length})</h4>
                                    <div className="events-list">
                                        {result.events.map((event, index) => (
                                            <div key={index} className="event-item">
                                                <pre>{JSON.stringify(event, null, 2)}</pre>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="export-button" onClick={handleExport}>
                        Export JSON
                    </button>
                    <button className="close-footer-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

