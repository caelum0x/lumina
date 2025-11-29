import React, {createContext, useContext, useState, useCallback} from 'react'
import './notification-system.scss'

const NotificationContext = createContext()

/**
 * Notification provider component
 */
export function NotificationProvider({children}) {
    const [notifications, setNotifications] = useState([])

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random()
        const newNotification = {
            id,
            type: 'info',
            duration: 5000,
            ...notification
        }

        setNotifications(prev => [...prev, newNotification])

        if (newNotification.duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, newNotification.duration)
        }

        return id
    }, [])

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    const showSuccess = useCallback((message, duration = 5000) => {
        return addNotification({type: 'success', message, duration})
    }, [addNotification])

    const showError = useCallback((message, duration = 7000) => {
        return addNotification({type: 'error', message, duration})
    }, [addNotification])

    const showWarning = useCallback((message, duration = 6000) => {
        return addNotification({type: 'warning', message, duration})
    }, [addNotification])

    const showInfo = useCallback((message, duration = 5000) => {
        return addNotification({type: 'info', message, duration})
    }, [addNotification])

    const value = {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationContainer />
        </NotificationContext.Provider>
    )
}

/**
 * Hook to use notifications
 */
export function useNotifications() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider')
    }
    return context
}

/**
 * Notification container component
 */
function NotificationContainer() {
    const {notifications, removeNotification} = useNotifications()

    return (
        <div className="notification-container">
            {notifications.map(notification => (
                <Notification
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    )
}

/**
 * Individual notification component
 */
function Notification({notification, onClose}) {
    const {type, message, title} = notification

    return (
        <div className={`notification notification-${type}`}>
            <div className="notification-content">
                {title && <div className="notification-title">{title}</div>}
                <div className="notification-message">{message}</div>
            </div>
            <button
                className="notification-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    )
}

