import {useEffect, useRef} from 'react'
import {useStore} from './store'

/**
 * Turbo Mode Hook - Replays last 10 minutes of transactions at 100x speed
 */
export function useTurboMode() {
    const turboMode = useStore(state => state.turboMode)
    const transactionHistory = useStore(state => state.transactionHistory)
    const turboStartTime = useStore(state => state.turboStartTime)
    const turboSpeed = useStore(state => state.turboSpeed)
    const clear = useStore(state => state.clear)
    const addTransaction = useStore(state => state.addTransaction)
    const setTurboMode = useStore(state => state.setTurboMode)
    
    const animationFrameRef = useRef(null)
    const replayIndexRef = useRef(0)

    useEffect(() => {
        if (!turboMode || !transactionHistory.length || !turboStartTime) {
            return
        }

        // Clear current transactions and start replay
        clear()
        replayIndexRef.current = 0

        // Calculate time range (last 10 minutes = 600 seconds)
        const replayDuration = 600000 // 10 minutes in ms
        const turboDuration = replayDuration / turboSpeed // 6 seconds at 100x
        const startTime = Date.now()
        const endTime = startTime + turboDuration

        // Sort transactions by timestamp for chronological replay
        const sortedHistory = [...transactionHistory].sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime()
            const timeB = new Date(b.created_at || 0).getTime()
            return timeA - timeB
        })

        if (sortedHistory.length === 0) {
            setTurboMode(false)
            return
        }

        const firstTxTime = new Date(sortedHistory[0].created_at || 0).getTime()
        const lastTxTime = new Date(sortedHistory[sortedHistory.length - 1].created_at || Date.now()).getTime()
        const timeRange = lastTxTime - firstTxTime || 1

        function replay() {
            const now = Date.now()
            if (now >= endTime) {
                // Replay complete
                setTurboMode(false)
                return
            }

            const progress = (now - startTime) / turboDuration
            const targetTime = firstTxTime + (timeRange * progress)

            // Add all transactions up to target time
            while (replayIndexRef.current < sortedHistory.length) {
                const tx = sortedHistory[replayIndexRef.current]
                const txTime = new Date(tx.created_at || 0).getTime()

                if (txTime <= targetTime) {
                    addTransaction(tx)
                    replayIndexRef.current++
                } else {
                    break
                }
            }

            animationFrameRef.current = requestAnimationFrame(replay)
        }

        animationFrameRef.current = requestAnimationFrame(replay)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [turboMode, transactionHistory.length, turboStartTime, turboSpeed, clear, addTransaction, setTurboMode])

    return {isActive: turboMode}
}

