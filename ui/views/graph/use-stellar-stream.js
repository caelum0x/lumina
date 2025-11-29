import {useEffect, useState} from 'react'
import {useStore} from './store'
import appSettings from '../../app-settings'

export function useStellarStream(network, options = {}) {
    const addTransaction = useStore(state => state.addTransaction)
    const setConnectionStatus = useStore(state => state.setConnectionStatus)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const networkName = network || appSettings.activeNetwork || 'public'
        const apiEndpoint = appSettings.apiEndpoint || 'http://localhost:3000'
        const url = `${apiEndpoint}/stream/transactions/${networkName}`

        setConnectionStatus('connecting')
        setIsConnected(false)

        const eventSource = new EventSource(url)

        eventSource.onopen = () => {
            console.log('SSE connection opened')
            setConnectionStatus('connected')
            setIsConnected(true)
        }

        eventSource.onmessage = (event) => {
            try {
                const tx = JSON.parse(event.data)
                if (tx.status === 'connected') return
                if (tx.error) {
                    console.error('Stream error:', tx.error)
                    return
                }
                
                // Transform Horizon transaction to 3D format
                const feeCharged = parseFloat(tx.fee_charged) || 0
                const tx3d = {
                    id: tx.id,
                    hash: tx.hash,
                    source: tx.source_account,
                    amount: feeCharged / 10000000, // Convert stroops to XLM
                    timestamp: tx.created_at,
                    position: [
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 100
                    ],
                    isWhale: false, // Will be set by backend whale detection
                    isSoroban: tx.memo_type === 'hash' || (tx.operation_count === 1 && feeCharged > 1000000),
                    highFee: feeCharged > 1000000 // > 0.1 XLM
                }
                addTransaction(tx3d)
            } catch (e) {
                console.error('Failed to parse transaction:', e)
            }
        }

        eventSource.onerror = (error) => {
            console.error('SSE error:', error)
            setConnectionStatus('error')
            setIsConnected(false)
        }

        return () => {
            eventSource.close()
            setConnectionStatus('disconnected')
            setIsConnected(false)
        }
    }, [network, addTransaction, setConnectionStatus])

    return {isConnected}
}
