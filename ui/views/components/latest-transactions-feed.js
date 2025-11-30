import React, {useState, useEffect} from 'react'
import {navigation} from '@stellar-expert/navigation'
import {resolvePath} from '../../business-logic/path'
import {apiCall} from '../../models/api'
import './latest-transactions-feed.scss'

export default function LatestTransactionsFeed({network = 'public', limit = 20}) {
    const [txs, setTxs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Initial load
        apiCall(`transactions/latest?limit=${limit}`)
            .then(data => {
                setTxs(data.records || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load transactions:', err)
                setLoading(false)
            })

        // Setup SSE for real-time updates
        const eventSource = new EventSource(`${appSettings.apiEndpoint}/explorer/${network}/tx/stream`)
        
        eventSource.onmessage = (event) => {
            try {
                const newTx = JSON.parse(event.data)
                setTxs(prev => [newTx, ...prev.slice(0, limit - 1)])
            } catch (e) {
                console.error('Failed to parse SSE data:', e)
            }
        }

        eventSource.onerror = (err) => {
            console.error('SSE error:', err)
            eventSource.close()
        }

        return () => {
            eventSource.close()
        }
    }, [network, limit])

    function goToTx(hash) {
        navigation.navigate(resolvePath(`/explorer/${network}/tx/${hash}`))
    }

    if (loading) {
        return <div className="latest-txs-loading">Loading transactions...</div>
    }

    return (
        <div className="latest-transactions-feed">
            <div className="feed-header">
                <h3>Latest Transactions</h3>
                <span className="live-indicator">● LIVE</span>
            </div>
            
            <div className="txs-table-wrapper">
                <table className="txs-table">
                    <thead>
                        <tr>
                            <th>Hash</th>
                            <th>Time</th>
                            <th>Ops</th>
                            <th>Fee (XLM)</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {txs.map((tx, i) => (
                            <tr 
                                key={tx.hash || i} 
                                onClick={() => goToTx(tx.hash)}
                                className="tx-row"
                            >
                                <td className="tx-hash">
                                    <code>{tx.hash?.slice(0, 8)}...{tx.hash?.slice(-6)}</code>
                                </td>
                                <td className="tx-time">
                                    {new Date(tx.timestamp || tx.time).toLocaleTimeString()}
                                </td>
                                <td className="tx-ops">{tx.ops}</td>
                                <td className="tx-fee">{tx.fee}</td>
                                <td className="tx-status">
                                    <span className={`status-badge ${tx.successful ? 'success' : 'failed'}`}>
                                        {tx.successful !== false ? '✓' : '✗'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
