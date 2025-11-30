import React from 'react'
import {formatWithAutoPrecision} from '@stellar-expert/formatter'
import {useExplorerApi, withErrorBoundary} from '@stellar-expert/ui-framework'
import {AccountTrustlineBalanceView} from './account-trustline-balance-view'
import './account-balances.scss'

export default withErrorBoundary(function AccountCurrentBalancesView({account, onSelectAsset}) {
    const {address, ledgerData, deleted} = account
    const {data: valueInfo} = useExplorerApi(`account/${address}/value`)
    if (deleted)
        return <div className="dimmed space">Balances unavailable</div>
    if (!valueInfo || valueInfo?.error)
        return null
    const xlmTrustline = (valueInfo.trustlines || valueInfo.balances || ledgerData?.balances || []).find(t => t.asset === 'XLM' || t.asset_type === 'native')
    if (!xlmTrustline) {
        return <div className="dimmed space">Balance information unavailable</div>
    }
    return <>
        {!!valueInfo?.total && <div className="dimmed text-right mobile-left text-small condensed">
            <div className="desktop-only" style={{marginTop: '-2.8em'}}/>
            <span className="mobile-only">Estimated account balances value: </span>
            ~ {formatWithAutoPrecision(valueInfo.total / 10000000)} <span className="text-tiny">{valueInfo.currency}</span>
            <div className="desktop-only space"/>
        </div>}
        <div className="all-account-balances micro-space text-header">
            <AccountTrustlineBalanceView key="xlm" account={ledgerData} trustline={xlmTrustline} onClick={onSelectAsset}/>
            {(valueInfo.trustlines || valueInfo.balances || [])
                .filter(t => t.asset !== 'XLM' && t.asset_type !== 'native')
                .concat(valueInfo.pool_stakes || [])
                .map(t => <AccountTrustlineBalanceView key={t.asset || t.pool} trustline={t} currency={valueInfo.currency} onClick={onSelectAsset}/>)}
        </div>
    </>
})