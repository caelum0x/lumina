import React, {useState} from 'react'
import sorobanRpcClient from '../../business-logic/api/soroban-rpc-client'
import {useNotifications} from './notification-system'
import {ContractCallResultModal} from './contract-call-result-modal'
import './contract-function-call.scss'

/**
 * Contract function call interface for testing invocations
 */
export function ContractFunctionCall({contractAddress, functions, onCall}) {
    const [selectedFunction, setSelectedFunction] = useState('')
    const [parameters, setParameters] = useState({})
    const [isCalling, setIsCalling] = useState(false)
    const [callResult, setCallResult] = useState(null)
    const [callError, setCallError] = useState(null)
    const [showResultModal, setShowResultModal] = useState(false)
    const {showError, showSuccess} = useNotifications()

    const selectedFunc = functions?.find(f => f.name === selectedFunction)

    const handleParameterChange = (paramName, value) => {
        setParameters(prev => ({
            ...prev,
            [paramName]: value
        }))
    }

    const handleCall = async () => {
        if (!selectedFunction || !contractAddress) {
            showError('Please select a function and ensure contract address is set')
            return
        }

        setIsCalling(true)
        setCallResult(null)
        setCallError(null)

        try {
            // Convert parameters to ScVal array
            const scValArgs = []
            if (selectedFunc && selectedFunc.inputs) {
                for (const input of selectedFunc.inputs) {
                    const paramValue = parameters[input.name]
                    if (paramValue === undefined || paramValue === '') {
                        showError(`Parameter ${input.name} is required`)
                        setIsCalling(false)
                        return
                    }

                    try {
                        const scVal = sorobanRpcClient.toScVal(paramValue, input.type)
                        scValArgs.push(scVal)
                    } catch (err) {
                        showError(`Invalid value for ${input.name} (${input.type}): ${err.message}`)
                        setIsCalling(false)
                        return
                    }
                }
            }

            // Call the contract function
            const result = await sorobanRpcClient.simulateCall(
                contractAddress,
                selectedFunction,
                scValArgs
            )

            setCallResult(result)
            setShowResultModal(true)
            showSuccess('Function call completed successfully')

            // Also call the optional onCall callback
            if (onCall) {
                onCall({
                    contract: contractAddress,
                    function: selectedFunction,
                    parameters,
                    result
                })
            }
        } catch (error) {
            setCallError(error)
            setShowResultModal(true)
            showError(`Function call failed: ${error.message}`)
        } finally {
            setIsCalling(false)
        }
    }

    return (
        <div className="contract-function-call">
            <h3>Test Function Call</h3>
            <div className="call-form">
                <div className="form-group">
                    <label>
                        Function:
                        <select
                            value={selectedFunction}
                            onChange={(e) => setSelectedFunction(e.target.value)}
                        >
                            <option value="">Select function...</option>
                            {functions?.map((func, i) => (
                                <option key={i} value={func.name}>
                                    {func.name} {func.signature || ''}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {selectedFunc && selectedFunc.inputs && selectedFunc.inputs.length > 0 && (
                    <div className="parameters-section">
                        <h4>Parameters</h4>
                        {selectedFunc.inputs.map((input, i) => (
                            <div key={i} className="parameter-input">
                                <label>
                                    {input.name || `param${i}`} ({input.type}):
                                    <input
                                        type="text"
                                        value={parameters[input.name] || ''}
                                        onChange={(e) => handleParameterChange(input.name, e.target.value)}
                                        placeholder={`Enter ${input.type}`}
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                <div className="form-actions">
                    <button
                        className="call-button"
                        onClick={handleCall}
                        disabled={!selectedFunction || isCalling}
                    >
                        {isCalling ? 'Calling...' : 'Call Function'}
                    </button>
                </div>

                <div className="call-note">
                    <p className="note-text">
                        ⚠️ This is a read-only simulation. It will not modify the contract state.
                    </p>
                </div>
            </div>

            {showResultModal && (
                <ContractCallResultModal
                    result={callResult}
                    error={callError}
                    onClose={() => {
                        setShowResultModal(false)
                        setCallResult(null)
                        setCallError(null)
                    }}
                    contractAddress={contractAddress}
                    functionName={selectedFunction}
                />
            )}
        </div>
    )
}

