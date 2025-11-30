import React, {useEffect, useState} from 'react'
import {resolvePath} from '../../../business-logic/path'
import {apiCall} from '../../../models/api'
import {decodeTransaction} from '../../../business-logic/transaction-decoder'
import appSettings from '../../../app-settings'

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
    const [liveCount, setLiveCount] = useState(0)

    useEffect(() => {
        // Initial load
        apiCall('transactions/latest?limit=20')
            .then(result => {
                setData(result)
                setLoading(false)
            })
            .catch(err => {
                // Fallback to old endpoint
                apiCall('tx/recent?limit=30')
                    .then(result => {
                        setData(result)
                        setLoading(false)
                    })
                    .catch(e => {
                        setError(e)
                        setLoading(false)
                    })
            })

        // Setup SSE for live updates
        const network = appSettings.activeNetwork || 'public'
        const eventSource = new EventSource(`${appSettings.apiEndpoint}/explorer/${network}/tx/stream`)
        
        eventSource.onmessage = (event) => {
            try {
                const newTx = JSON.parse(event.data)
                setData(prev => {
                    if (!prev?.records) return prev
                    const existing = prev.records.find(r => r.hash === newTx.hash)
                    if (existing) return prev
                    return {
                        ...prev,
                        records: [
                            {
                                id: newTx.hash,
                                hash: newTx.hash,
                                created_at: newTx.time,
                                source_account: newTx.source || '',
                                operation_count: newTx.ops,
                                successful: newTx.successful
                            },
                            ...prev.records.slice(0, 19)
                        ]
                    }
                })
                setLiveCount(c => c + 1)
            } catch (e) {
                console.error('SSE parse error:', e)
            }
        }

        eventSource.onerror = () => {
            eventSource.close()
        }

        return () => {
            eventSource.close()
        }
    }, [])

    if (loading) return <div className="loader"/>
    if (error) return <div className="error">Failed to load transactions</div>
    if (!data?.records?.length) return <div>No transactions found</div>

    return (
        <div className="segment blank">
            <h3>
                Latest Transactions
                {liveCount > 0 && <span className="badge" style={{marginLeft: '0.5rem', background: '#4ade80'}}>● LIVE</span>}
            </h3>
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
                        {data.records.map((tx, i) => (
                            <tr key={tx.id || i} style={i === 0 && liveCount > 0 ? {animation: 'slideIn 0.3s ease-out'} : {}}>
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
