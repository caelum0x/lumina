import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router'
import PropTypes from 'prop-types'
import {BlockSelect, usePageMetadata} from '@stellar-expert/ui-framework'
import {apiCall} from '../../../models/api'
import ErrorNotificationBlock from '../../components/error-notification-block'
import {ShareButton} from '../../components/share-button'
import {DataRefreshIndicator} from '../../components/data-refresh-indicator'
import appSetting from '../../../app-settings'
import TransactionDetails from './tx-details-view'

export default function TxView({id}) {
    const {id: queryId} = useParams()
    const txId = id || queryId
    const [txData, setTxData] = useState()
    const [lastUpdated, setLastUpdated] = useState(null)

    const loadTx = async () => {
        // Validate transaction hash format
        if (txId && txId.length < 8) {
            setTxData({error: 'invalid', txId, message: 'Transaction hash is too short. A Stellar transaction hash should be 64 characters.'})
            return
        }
        
        try {
            const data = await apiCall(`tx/${txId}`)
            if (!data || data.error || !data.envelope_xdr || !data.result_xdr) {
                if (txId && txId.length < 64) {
                    setTxData({error: 'invalid', txId, message: `Transaction hash appears incomplete (${txId.length} characters, expected 64). Please check the URL.`})
                } else {
                    setTxData({error: 'not found', txId})
                }
            } else {
                const transformed = {
                    ...data,
                    id: data.hash || data.id,
                    body: data.envelope_xdr,
                    result: data.result_xdr,
                    meta: data.result_meta_xdr || data.fee_meta_xdr,
                    ts: Math.floor(new Date(data.created_at).getTime() / 1000),
                    protocol: data.ledger_attr || 20,
                    ledger: data.ledger,
                    source: data.source_account,
                    fee: data.fee_charged || data.max_fee,
                    operations: data.operation_count
                }
                setTxData(transformed)
            }
            setLastUpdated(new Date().toISOString())
            return data
        } catch (err) {
            console.error('Failed to load transaction:', err)
            setTxData({error: 'not found', txId})
        }
    }

    useEffect(() => {
        loadTx()
    }, [txId])
    usePageMetadata({
        title: `Transaction ${txId} on Stellar ${appSetting.activeNetwork} network`,
        description: `Comprehensive blockchain information for the transaction ${txId} ${txData?.ts ? `(${new Date(txData.ts * 1000).toISOString()}) ` : ''}on Stellar ${appSetting.activeNetwork} network.`
    })
    if (!txData)
        return <div className="loader"/>
    const txHash = txData.id || txData.txId || txId
    if (txData.error) return <>
        <h2 className="word-break relative">Transaction&nbsp;<BlockSelect>{txHash}</BlockSelect></h2>
        <ErrorNotificationBlock>
            {txData.error === 'invalid' ?
                (txData.message || 'Invalid transaction hash. Make sure that you copied it correctly.') :
                'Transaction not found on Stellar Network.'
            }
        </ErrorNotificationBlock>
    </>

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em'}}>
                <DataRefreshIndicator lastUpdated={lastUpdated} onRefresh={loadTx} />
                <ShareButton 
                    url={window.location.href}
                    title={`Transaction ${txHash}`}
                    text={`View transaction ${txHash} on Lumina 3D Modern Stellar Explorer`}
                />
            </div>
            <TransactionDetails tx={txData}/>
        </div>
    )
}

TxView.propTypes = {
    id: PropTypes.string
}