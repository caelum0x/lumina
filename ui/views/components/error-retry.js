import React, {useState} from 'react'
import './error-retry.scss'

/**
 * Error retry component with exponential backoff
 */
export function ErrorRetry({error, onRetry, maxRetries = 3, retryDelay = 1000}) {
    const [retryCount, setRetryCount] = useState(0)
    const [isRetrying, setIsRetrying] = useState(false)

    const handleRetry = async () => {
        if (retryCount >= maxRetries) {
            return
        }

        setIsRetrying(true)
        const delay = retryDelay * Math.pow(2, retryCount) // Exponential backoff

        setTimeout(async () => {
            try {
                await onRetry()
                setRetryCount(0) // Reset on success
            } catch (e) {
                setRetryCount(prev => prev + 1)
            } finally {
                setIsRetrying(false)
            }
        }, delay)
    }

    if (!error) return null

    return (
        <div className="error-retry-container">
            <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">
                    {error.message || 'An error occurred'}
                    {retryCount > 0 && (
                        <span className="retry-count"> (Attempt {retryCount + 1}/{maxRetries})</span>
                    )}
                </span>
            </div>
            {retryCount < maxRetries && (
                <button
                    className="retry-button"
                    onClick={handleRetry}
                    disabled={isRetrying}
                >
                    {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
            )}
            {retryCount >= maxRetries && (
                <div className="max-retries-reached">
                    Maximum retry attempts reached. Please refresh the page.
                </div>
            )}
        </div>
    )
}

/**
 * Hook for error retry with exponential backoff
 */
export function useErrorRetry(fn, maxRetries = 3) {
    const [error, setError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)
    const [isRetrying, setIsRetrying] = useState(false)

    const execute = async (...args) => {
        try {
            setError(null)
            setIsRetrying(false)
            const result = await fn(...args)
            setRetryCount(0)
            return result
        } catch (e) {
            setError(e)
            throw e
        }
    }

    const retry = async (...args) => {
        if (retryCount >= maxRetries) {
            return
        }

        setIsRetrying(true)
        const delay = 1000 * Math.pow(2, retryCount)

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const result = await fn(...args)
                    setRetryCount(0)
                    setError(null)
                    resolve(result)
                } catch (e) {
                    setRetryCount(prev => prev + 1)
                    setError(e)
                    reject(e)
                } finally {
                    setIsRetrying(false)
                }
            }, delay)
        })
    }

    return {execute, retry, error, retryCount, isRetrying}
}

