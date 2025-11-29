import React, {useEffect, useState} from 'react'
import {resolvePath} from '../../../business-logic/path'
import {apiCall} from '../../../models/api'
import {decodeTransaction} from '../../../business-logic/transaction-decoder'

function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
}

function shortenHash(hash) {
    if (!hash) return ''
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
}

export default function LatestTransactionsTable() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        apiCall('tx/recent?limit=30')
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
    if (error) return <div className="error">Failed to load transactions</div>
    if (!data?.records?.length) return <div>No transactions found</div>

    return (
        <div className="segment blank">
            <h3>Latest Transactions</h3>
            <hr className="flare"/>
            <div className="table-wrapper">
                <table className="table exportable">
                    <thead>
                        <tr>
                            <th>Hash</th>
                            <th>Time</th>
                            <th>Source</th>
                            <th>Description</th>
                            <th>Ops</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.records.map(tx => (
                            <tr key={tx.id}>
                                <td>
                                    <a href={resolvePath(`tx/${tx.hash}`)} className="word-break">
                                        {shortenHash(tx.hash)}
                                    </a>
                                </td>
                                <td className="dimmed">{timeAgo(tx.created_at)}</td>
                                <td>
                                    <a href={resolvePath(`account/${tx.source_account}`)} className="word-break">
                                        {shortenHash(tx.source_account)}
                                    </a>
                                </td>
                                <td className="dimmed text-small">
                                    {decodeTransaction(tx)}
                                </td>
                                <td>{tx.operation_count || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
