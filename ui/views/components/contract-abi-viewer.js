import React, {useState} from 'react'
import {CodeBlock} from '@stellar-expert/ui-framework'
import './contract-abi-viewer.scss'

/**
 * Contract ABI/Interface viewer with syntax highlighting
 */
export function ContractABIViewer({abi, interfaceData, contractAddress}) {
    const [viewMode, setViewMode] = useState('formatted') // 'formatted', 'raw', 'json'

    const formattedInterface = React.useMemo(() => {
        if (!interfaceData && !abi) return null

        if (interfaceData) {
            return interfaceData
        }

        // Format ABI for display
        if (abi && typeof abi === 'object') {
            return JSON.stringify(abi, null, 2)
        }

        return abi
    }, [abi, interfaceData])

    return (
        <div className="contract-abi-viewer">
            <div className="viewer-header">
                <h3>Contract Interface / ABI</h3>
                <div className="view-mode-toggle">
                    <button
                        className={viewMode === 'formatted' ? 'active' : ''}
                        onClick={() => setViewMode('formatted')}
                    >
                        Formatted
                    </button>
                    <button
                        className={viewMode === 'raw' ? 'active' : ''}
                        onClick={() => setViewMode('raw')}
                    >
                        Raw
                    </button>
                    <button
                        className={viewMode === 'json' ? 'active' : ''}
                        onClick={() => setViewMode('json')}
                    >
                        JSON
                    </button>
                </div>
            </div>

            <div className="abi-content">
                {!formattedInterface ? (
                    <div className="no-abi">No interface/ABI data available for this contract</div>
                ) : (
                    <>
                        {viewMode === 'formatted' && (
                            <div className="formatted-interface">
                                <CodeBlock language="rust">
                                    {typeof formattedInterface === 'string' 
                                        ? formattedInterface 
                                        : JSON.stringify(formattedInterface, null, 2)}
                                </CodeBlock>
                            </div>
                        )}
                        {viewMode === 'raw' && (
                            <div className="raw-interface">
                                <pre>{typeof formattedInterface === 'string' 
                                    ? formattedInterface 
                                    : JSON.stringify(formattedInterface, null, 2)}</pre>
                            </div>
                        )}
                        {viewMode === 'json' && (
                            <div className="json-interface">
                                <CodeBlock language="json">
                                    {JSON.stringify(formattedInterface, null, 2)}
                                </CodeBlock>
                            </div>
                        )}
                    </>
                )}
            </div>

            {formattedInterface && (
                <div className="abi-actions">
                    <button
                        className="copy-button"
                        onClick={() => {
                            const text = typeof formattedInterface === 'string' 
                                ? formattedInterface 
                                : JSON.stringify(formattedInterface, null, 2)
                            navigator.clipboard.writeText(text)
                            alert('Copied to clipboard!')
                        }}
                    >
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    )
}

