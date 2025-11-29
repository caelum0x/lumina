import React, {useState, useEffect} from 'react'
import {formatDateUTC} from '@stellar-expert/formatter'
import {navigation} from '@stellar-expert/navigation'
import appSettings from '../../app-settings'

export default function LatestLedgersTable() {
    const [ledgers, setLedgers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        console.log('[Ledgers] Fetching from:', `${appSettings.apiEndpoint}/explorer/${appSettings.activeNetwork}/ledger/recent?limit=10`)
        fetch(`${appSettings.apiEndpoint}/explorer/${appSettings.activeNetwork}/ledger/recent?limit=10`)
            .then(r => {
                console.log('[Ledgers] Response status:', r.status, r.ok)
                return r.ok ? r.json() : Promise.reject('Failed to load')
            })
            .then(data => {
                console.log('[Ledgers] Data received:', data)
                console.log('[Ledgers] Records count:', data._embedded?.records?.length)
                setLedgers(data._embedded?.records || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('[Ledgers] Error:', err)
                setError(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="loader"/>
    if (error) return <div className="dimmed text-center">Failed to load ledgers. <a href="#" onClick={() => window.location.reload()}>Retry</a></div>
    if (ledgers.length === 0) return <div className="dimmed text-center">No ledgers found. <a href="#" onClick={() => window.location.reload()}>Retry</a></div>

    return <table className="table compact">
        <thead>
            <tr>
                <th>Ledger</th>
                <th>Time</th>
                <th className="text-right">Transactions</th>
                <th className="text-right">Operations</th>
            </tr>
        </thead>
        <tbody>
            {ledgers.map(l => <tr key={l.sequence} onClick={() => navigation.navigate(`/ledger/${l.sequence}`)}>
                <td><a href={`/ledger/${l.sequence}`}>{l.sequence}</a></td>
                <td className="dimmed text-small">{formatDateUTC(l.ts)}</td>
                <td className="text-right">{l.tx_count}</td>
                <td className="text-right">{l.op_count}</td>
            </tr>)}
        </tbody>
    </table>
}
