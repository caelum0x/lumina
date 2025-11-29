import React, {useState, useMemo} from 'react'
import {Amount} from '@stellar-expert/ui-framework'
import './tx-fee-calculator.scss'

/**
 * Transaction fee calculator
 * Estimates fees based on operations and base fee
 */
export function TxFeeCalculator({baseFee = 100, onCalculate}) {
    const [operations, setOperations] = useState(1)
    const [customBaseFee, setCustomBaseFee] = useState(baseFee)

    const calculatedFee = useMemo(() => {
        return operations * customBaseFee
    }, [operations, customBaseFee])

    const feeInXLM = calculatedFee / 10000000 // Convert stroops to XLM

    return (
        <div className="tx-fee-calculator">
            <h3>Transaction Fee Calculator</h3>
            <div className="calculator-form">
                <div className="form-group">
                    <label>
                        Number of Operations:
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={operations}
                            onChange={(e) => setOperations(parseInt(e.target.value) || 1)}
                        />
                    </label>
                </div>

                <div className="form-group">
                    <label>
                        Base Fee (stroops):
                        <input
                            type="number"
                            min="100"
                            value={customBaseFee}
                            onChange={(e) => setCustomBaseFee(parseInt(e.target.value) || 100)}
                        />
                    </label>
                    <div className="form-help">
                        Current network base fee: {baseFee} stroops
                    </div>
                </div>

                <div className="calculator-result">
                    <div className="result-label">Estimated Fee:</div>
                    <div className="result-value">
                        <Amount amount={calculatedFee} asset="XLM" adjust issuer={false} />
                    </div>
                    <div className="result-stroops">
                        {calculatedFee.toLocaleString()} stroops
                    </div>
                </div>

                <div className="calculator-info">
                    <p>
                        <strong>Fee Formula:</strong> Number of Operations × Base Fee
                    </p>
                    <p>
                        The base fee is set by the network and can change. 
                        This is an estimate based on current network parameters.
                    </p>
                </div>
            </div>
        </div>
    )
}

