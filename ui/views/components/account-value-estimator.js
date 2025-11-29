import React, {useMemo} from 'react'
import {Amount} from '@stellar-expert/ui-framework'
import './account-value-estimator.scss'

/**
 * Account value estimator showing total portfolio value in XLM
 */
export function AccountValueEstimator({balances, xlmPrice = 0.1}) {
    const totalValue = useMemo(() => {
        if (!balances || !Array.isArray(balances)) return 0

        let total = 0
        balances.forEach(balance => {
            if (balance.asset_type === 'native' || balance.asset_code === 'XLM') {
                // XLM balance
                total += parseFloat(balance.balance || 0)
            } else {
                // For other assets, we'd need price data
                // For now, just show XLM balance
                // In production, fetch asset prices from API
            }
        })

        return total
    }, [balances])

    const usdValue = totalValue * xlmPrice

    return (
        <div className="account-value-estimator">
            <div className="value-display">
                <div className="value-label">Total Portfolio Value</div>
                <div className="value-amount">
                    <Amount amount={totalValue * 10000000} asset="XLM" adjust issuer={false} />
                </div>
                {xlmPrice > 0 && (
                    <div className="value-usd">
                        ≈ ${usdValue.toFixed(2)} USD
                    </div>
                )}
            </div>
            <div className="value-breakdown">
                <div className="breakdown-item">
                    <span className="breakdown-label">XLM Balance:</span>
                    <span className="breakdown-value">
                        {balances?.find(b => b.asset_type === 'native' || b.asset_code === 'XLM')?.balance || '0'} XLM
                    </span>
                </div>
                <div className="breakdown-item">
                    <span className="breakdown-label">Other Assets:</span>
                    <span className="breakdown-value">
                        {balances?.filter(b => b.asset_type !== 'native' && b.asset_code !== 'XLM').length || 0} assets
                    </span>
                </div>
            </div>
        </div>
    )
}

