import React, {useState, useEffect} from 'react'
import './data-refresh-indicator.scss'

/**
 * Data refresh indicator component
 * Shows when data was last updated and provides refresh button
 */
export function DataRefreshIndicator({lastUpdated, onRefresh, autoRefresh = false, refreshInterval = 30000}) {
    const [timeAgo, setTimeAgo] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        const updateTimeAgo = () => {
            if (!lastUpdated) {
                setTimeAgo('Never')
                return
            }

            const now = new Date()
            const updated = new Date(lastUpdated)
            const diffMs = now - updated
            const diffSec = Math.floor(diffMs / 1000)
            const diffMin = Math.floor(diffSec / 60)
            const diffHour = Math.floor(diffMin / 60)

            if (diffSec < 10) {
                setTimeAgo('Just now')
            } else if (diffSec < 60) {
                setTimeAgo(`${diffSec}s ago`)
            } else if (diffMin < 60) {
                setTimeAgo(`${diffMin}m ago`)
            } else if (diffHour < 24) {
                setTimeAgo(`${diffHour}h ago`)
            } else {
                const diffDay = Math.floor(diffHour / 24)
                setTimeAgo(`${diffDay}d ago`)
            }
        }

        updateTimeAgo()
        const interval = setInterval(updateTimeAgo, 1000)

        return () => clearInterval(interval)
    }, [lastUpdated])

    useEffect(() => {
        if (autoRefresh && onRefresh) {
            const interval = setInterval(() => {
                handleRefresh()
            }, refreshInterval)

            return () => clearInterval(interval)
        }
    }, [autoRefresh, refreshInterval, onRefresh])

    const handleRefresh = async () => {
        if (isRefreshing || !onRefresh) return

        setIsRefreshing(true)
        try {
            await onRefresh()
        } catch (e) {
            console.error('Refresh failed:', e)
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="data-refresh-indicator">
            <span className="refresh-time">
                Last updated: <strong>{timeAgo}</strong>
            </span>
            {onRefresh && (
                <button
                    className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    title="Refresh data"
                >
                    {isRefreshing ? '⟳' : '↻'}
                </button>
            )}
        </div>
    )
}

/**
 * Hook for tracking data refresh
 */
export function useDataRefresh(initialData = null) {
    const [data, setData] = useState(initialData)
    const [lastUpdated, setLastUpdated] = useState(initialData ? new Date().toISOString() : null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const refresh = async (fetchFn) => {
        if (isRefreshing) return

        setIsRefreshing(true)
        try {
            const newData = await fetchFn()
            setData(newData)
            setLastUpdated(new Date().toISOString())
            return newData
        } catch (e) {
            console.error('Refresh failed:', e)
            throw e
        } finally {
            setIsRefreshing(false)
        }
    }

    return {data, lastUpdated, isRefreshing, refresh, setData}
}

