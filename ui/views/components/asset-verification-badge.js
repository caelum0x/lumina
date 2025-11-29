import React from 'react'
import './asset-verification-badge.scss'

/**
 * Asset verification badge component
 * Shows verification status for assets
 */
export function AssetVerificationBadge({asset, verified = false, verificationInfo}) {
    if (!verified && !verificationInfo) {
        return null
    }

    const isVerified = verified || verificationInfo?.verified || false
    const verificationType = verificationInfo?.type || 'standard'
    const issuerDomain = verificationInfo?.domain || asset?.issuerInfo?.home_domain

    return (
        <div className={`asset-verification-badge ${isVerified ? 'verified' : 'unverified'}`}>
            {isVerified ? (
                <>
                    <span className="badge-icon">✓</span>
                    <span className="badge-text">
                        {verificationType === 'stellar' ? 'Stellar Verified' : 'Verified Asset'}
                    </span>
                    {issuerDomain && (
                        <span className="badge-domain">{issuerDomain}</span>
                    )}
                </>
            ) : (
                <>
                    <span className="badge-icon">⚠</span>
                    <span className="badge-text">Unverified Asset</span>
                </>
            )}
        </div>
    )
}

