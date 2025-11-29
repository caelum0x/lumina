import React, {useState, useEffect} from 'react'
import './offline-detector.scss'

/**
 * Offline detection component
 */
export function OfflineDetector() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [wasOffline, setWasOffline] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            if (wasOffline) {
                // Show reconnected message
                setTimeout(() => {
                    setWasOffline(false)
                }, 3000)
            }
        }

        const handleOffline = () => {
            setIsOnline(false)
            setWasOffline(true)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [wasOffline])

    if (isOnline && !wasOffline) return null

    return (
        <div className={`offline-banner ${isOnline ? 'reconnected' : 'offline'}`}>
            {isOnline ? (
                <>
                    <span className="offline-icon">✅</span>
                    <span className="offline-message">Connection restored</span>
                </>
            ) : (
                <>
                    <span className="offline-icon">⚠️</span>
                    <span className="offline-message">You are currently offline</span>
                </>
            )}
        </div>
    )
}

/**
 * Hook for offline detection
 */
export function useOffline() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return isOnline
}

