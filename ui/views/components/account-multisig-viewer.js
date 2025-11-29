import React from 'react'
import {AccountAddress} from '@stellar-expert/ui-framework'
import './account-multisig-viewer.scss'

/**
 * Multisig account viewer showing signers and thresholds
 */
export function AccountMultisigViewer({account}) {
    if (!account || !account.signers || account.signers.length <= 1) {
        return null
    }

    const signers = account.signers || []
    const thresholds = account.thresholds || {
        low_threshold: 0,
        med_threshold: 0,
        high_threshold: 0
    }

    return (
        <div className="account-multisig-viewer">
            <h3>Multisig Configuration</h3>
            <div className="multisig-info">
                <div className="thresholds">
                    <div className="threshold-item">
                        <span className="threshold-label">Low Threshold:</span>
                        <span className="threshold-value">{thresholds.low_threshold}</span>
                    </div>
                    <div className="threshold-item">
                        <span className="threshold-label">Medium Threshold:</span>
                        <span className="threshold-value">{thresholds.med_threshold}</span>
                    </div>
                    <div className="threshold-item">
                        <span className="threshold-label">High Threshold:</span>
                        <span className="threshold-value">{thresholds.high_threshold}</span>
                    </div>
                </div>

                <div className="signers-list">
                    <h4>Signers ({signers.length})</h4>
                    {signers.map((signer, index) => (
                        <div key={index} className="signer-item">
                            <div className="signer-address">
                                <AccountAddress account={signer.key} chars="all" />
                            </div>
                            <div className="signer-weight">
                                Weight: <strong>{signer.weight}</strong>
                            </div>
                            <div className="signer-type">
                                {signer.key === account.address ? 'Master' : 'Additional'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

