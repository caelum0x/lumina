import React, {useEffect, useState} from 'react'
import {useParams} from 'react-router'
import PropTypes from 'prop-types'
import {BlockSelect, loadTransaction, usePageMetadata} from '@stellar-expert/ui-framework'
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
        try {
            const data = await loadTransaction(txId)
                .catch(err => {
                    if (err && (err.name === 'NotFoundError' || err.status === 404))
                        return {error: 'not found', txId}
                    return Promise.reject(err)
                })
            setTxData(data)
            setLastUpdated(new Date().toISOString())
            return data
        } catch (err) {
            console.error('Failed to load transaction:', err)
            throw err
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
    const txHash = txData.id
    if (txData.error) return <>
        <h2 className="word-break relative">Transaction&nbsp;<BlockSelect>{txHash}</BlockSelect></h2>
        <ErrorNotificationBlock>
            {txData.error === 'invalid' ?
                'Invalid transaction hash. Make sure that you copied it correctly.' :
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