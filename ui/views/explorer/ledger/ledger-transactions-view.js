import React from 'react'
import PropTypes from 'prop-types'
import {useDependantState} from '@stellar-expert/ui-framework'
import {apiCall} from '../../../models/api'
import TxDetails from '../tx/tx-details-view'

export default function LedgerTransactionsView({ledgerSequence}) {
    const [transactions, setTransactions] = useDependantState(() => {
        apiCall(`ledger/${ledgerSequence}/tx`)
            .then(res => {
                const txs = (res._embedded?.records || res.records || res || []).map(tx => ({
                    ...tx,
                    id: tx.hash || tx.id,
                    body: tx.envelope_xdr,
                    result: tx.result_xdr,
                    meta: tx.result_meta_xdr || tx.fee_meta_xdr,
                    ts: Math.floor(new Date(tx.created_at).getTime() / 1000),
                    protocol: tx.ledger_attr || 20
                }))
                setTransactions(txs)
            })
        return null
    }, [ledgerSequence])

    if (!transactions)
        return <div className="loading"/>
    if (!transactions.length)
        return <div className="text-center space dimmed">(no transactions)</div>
    return <div className="block-indent-screen space">
        <h3>Ledger Transactions</h3>
        {transactions.map(tx => <div className="space" key={tx.id}><TxDetails tx={tx} embedded/></div>)}
    </div>
}

LedgerTransactionsView.propTypes = {
    ledgerSequence: PropTypes.number.isRequired
}