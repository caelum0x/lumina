import React from 'react'
import {AccountAddress, UtcTimestamp} from '@stellar-expert/ui-framework'
import './contract-deployment-info.scss'

/**
 * Contract deployment information view
 */
export function ContractDeploymentInfo({contract, deploymentTx}) {
    if (!contract && !deploymentTx) {
        return null
    }

    const deploymentInfo = {
        contractAddress: contract?.address || deploymentTx?.contract || null,
        deployer: contract?.deployer || deploymentTx?.source_account || null,
        deploymentTx: deploymentTx?.hash || contract?.deployment_tx || null,
        deploymentTime: contract?.deployed_at || deploymentTx?.created_at || null,
        wasmHash: contract?.wasm || contract?.wasm_hash || null,
        network: contract?.network || 'public',
        validation: contract?.validation || null
    }

    if (!deploymentInfo.contractAddress) {
        return (
            <div className="contract-deployment-info">
                <div className="no-deployment-info">
                    Deployment information is not available for this contract.
                </div>
            </div>
        )
    }

    return (
        <div className="contract-deployment-info">
            <h3>Deployment Information</h3>
            <div className="deployment-details">
                <div className="detail-section">
                    <div className="detail-item">
                        <span className="detail-label">Contract Address:</span>
                        <span className="detail-value">
                            <AccountAddress account={deploymentInfo.contractAddress} chars="all" />
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Deployer:</span>
                        <span className="detail-value">
                            <AccountAddress account={deploymentInfo.deployer} chars={12} />
                        </span>
                    </div>
                    {deploymentInfo.deploymentTx && (
                        <div className="detail-item">
                            <span className="detail-label">Deployment Transaction:</span>
                            <span className="detail-value">
                                <a href={`/explorer/${deploymentInfo.network}/tx/${deploymentInfo.deploymentTx}`}>
                                    {deploymentInfo.deploymentTx.substring(0, 16)}...
                                </a>
                            </span>
                        </div>
                    )}
                    {deploymentInfo.deploymentTime && (
                        <div className="detail-item">
                            <span className="detail-label">Deployed At:</span>
                            <span className="detail-value">
                                <UtcTimestamp date={deploymentInfo.deploymentTime} />
                            </span>
                        </div>
                    )}
                    {deploymentInfo.wasmHash && (
                        <div className="detail-item">
                            <span className="detail-label">WASM Hash:</span>
                            <span className="detail-value">
                                <code>{deploymentInfo.wasmHash}</code>
                            </span>
                        </div>
                    )}
                </div>

                {deploymentInfo.validation && (
                    <div className="validation-section">
                        <h4>Code Validation</h4>
                        <div className="validation-details">
                            {deploymentInfo.validation.repository && (
                                <div className="validation-item">
                                    <span className="validation-label">Repository:</span>
                                    <span className="validation-value">
                                        <a 
                                            href={deploymentInfo.validation.repository}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {deploymentInfo.validation.repository}
                                        </a>
                                    </span>
                                </div>
                            )}
                            {deploymentInfo.validation.commit && (
                                <div className="validation-item">
                                    <span className="validation-label">Commit:</span>
                                    <span className="validation-value">
                                        <code>{deploymentInfo.validation.commit}</code>
                                    </span>
                                </div>
                            )}
                            {deploymentInfo.validation.verified && (
                                <div className="validation-badge verified">
                                    ✓ Code Verified
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

