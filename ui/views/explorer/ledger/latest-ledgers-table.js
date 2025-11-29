import React, {useEffect, useState} from 'react'
import {formatWithPrecision} from '@stellar-expert/formatter'
import {resolvePath} from '../../../business-logic/path'
import {apiCall} from '../../../models/api'

function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
}

export default function LatestLedgersTable() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        apiCall('ledger/recent?limit=20')
            .then(result => {
                setData(result)
                setLoading(false)
            })
            .catch(err => {
                setError(err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="loader"/>
    if (error) return <div className="error">Failed to load ledgers</div>
    if (!data?.records?.length) return <div>No ledgers found</div>

    return (
        <div className="segment blank">
            <h3>Latest Ledgers</h3>
            <hr className="flare"/>
            <div className="table-wrapper">
                <table className="table exportable">
                    <thead>
                        <tr>
                            <th>Ledger</th>
                            <th>Time</th>
                            <th>Transactions</th>
                            <th>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.records.map(ledger => (
                            <tr key={ledger.sequence}>
                                <td>
                                    <a href={resolvePath(`ledger/${ledger.sequence}`)}>
                                        {formatWithPrecision(ledger.sequence, 0)}
                                    </a>
                                </td>
                                <td className="dimmed">{timeAgo(ledger.closed_at)}</td>
                                <td>{ledger.successful_transaction_count + ledger.failed_transaction_count || 0}</td>
                                <td>{ledger.operation_count || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
