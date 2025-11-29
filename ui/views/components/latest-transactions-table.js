import React, {useState, useEffect} from 'react'
import {formatDateUTC} from '@stellar-expert/formatter'
import {navigation} from '@stellar-expert/navigation'
import {AccountAddress} from '@stellar-expert/ui-framework'
import appSettings from '../../app-settings'

export default function LatestTransactionsTable() {
    const [txs, setTxs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        console.log('[Transactions] Fetching from:', `${appSettings.apiEndpoint}/explorer/${appSettings.activeNetwork}/tx/recent?limit=20`)
        fetch(`${appSettings.apiEndpoint}/explorer/${appSettings.activeNetwork}/tx/recent?limit=20`)
            .then(r => {
                console.log('[Transactions] Response status:', r.status, r.ok)
                return r.ok ? r.json() : Promise.reject('Failed to load')
            })
            .then(data => {
                console.log('[Transactions] Data received:', data)
                console.log('[Transactions] Records count:', data._embedded?.records?.length)
                setTxs(data._embedded?.records || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('[Transactions] Error:', err)
                setError(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="loader"/>
    if (error) return <div className="dimmed text-center">Failed to load transactions. <a href="#" onClick={() => window.location.reload()}>Retry</a></div>
    if (txs.length === 0) return <div className="dimmed text-center">No transactions found. <a href="#" onClick={() => window.location.reload()}>Retry</a></div>

    return <table className="table compact">
        <thead>
            <tr>
                <th>Transaction</th>
                <th>Source</th>
                <th>Time</th>
                <th className="text-right">Operations</th>
            </tr>
        </thead>
        <tbody>
            {txs.map(tx => <tr key={tx.hash} onClick={() => navigation.navigate(`/tx/${tx.hash}`)}>
                <td><a href={`/tx/${tx.hash}`} className="word-break">{tx.hash.slice(0, 12)}...</a></td>
                <td><AccountAddress account={tx.source} chars={12}/></td>
                <td className="dimmed text-small">{formatDateUTC(tx.ts)}</td>
                <td className="text-right">{tx.operations}</td>
            </tr>)}
        </tbody>
    </table>
}
