import React, {useState, useEffect} from 'react'
import './market-price-alerts.scss'

/**
 * Market price alert system (UI only - alerts stored in localStorage)
 */
export function MarketPriceAlerts({asset, currentPrice}) {
    const [alerts, setAlerts] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [newAlert, setNewAlert] = useState({
        type: 'above', // 'above', 'below'
        price: '',
        enabled: true
    })

    useEffect(() => {
        // Load alerts from localStorage
        const stored = localStorage.getItem(`price-alerts-${asset?.code || 'default'}`)
        if (stored) {
            try {
                setAlerts(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to load alerts:', e)
            }
        }
    }, [asset])

    useEffect(() => {
        // Check alerts against current price
        if (!currentPrice || alerts.length === 0) return

        alerts.forEach(alert => {
            if (!alert.enabled) return

            const triggered = alert.type === 'above' 
                ? currentPrice >= parseFloat(alert.price)
                : currentPrice <= parseFloat(alert.price)

            if (triggered && !alert.triggered) {
                // Show notification (in a real app, this would use the notification system)
                alert(`Price alert: ${asset?.code || 'Asset'} ${alert.type === 'above' ? 'rose above' : 'fell below'} ${alert.price}`)
                
                // Mark as triggered
                const updated = alerts.map(a => 
                    a.id === alert.id ? {...a, triggered: true} : a
                )
                setAlerts(updated)
                saveAlerts(updated)
            }
        })
    }, [currentPrice, alerts, asset])

    const saveAlerts = (alertsToSave) => {
        localStorage.setItem(
            `price-alerts-${asset?.code || 'default'}`,
            JSON.stringify(alertsToSave)
        )
    }

    const addAlert = () => {
        if (!newAlert.price) {
            alert('Please enter a price')
            return
        }

        const alertToAdd = {
            id: Date.now(),
            ...newAlert,
            price: parseFloat(newAlert.price),
            createdAt: new Date().toISOString(),
            triggered: false
        }

        const updated = [...alerts, alertToAdd]
        setAlerts(updated)
        saveAlerts(updated)
        setNewAlert({type: 'above', price: '', enabled: true})
        setShowForm(false)
    }

    const removeAlert = (id) => {
        const updated = alerts.filter(a => a.id !== id)
        setAlerts(updated)
        saveAlerts(updated)
    }

    const toggleAlert = (id) => {
        const updated = alerts.map(a => 
            a.id === id ? {...a, enabled: !a.enabled} : a
        )
        setAlerts(updated)
        saveAlerts(updated)
    }

    return (
        <div className="market-price-alerts">
            <div className="alerts-header">
                <h3>Price Alerts</h3>
                <button
                    className="add-alert-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Add Alert'}
                </button>
            </div>

            {showForm && (
                <div className="alert-form">
                    <div className="form-group">
                        <label>
                            Alert when price:
                            <select
                                value={newAlert.type}
                                onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                            >
                                <option value="above">Rises above</option>
                                <option value="below">Falls below</option>
                            </select>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Price:
                            <input
                                type="number"
                                step="0.000001"
                                value={newAlert.price}
                                onChange={(e) => setNewAlert({...newAlert, price: e.target.value})}
                                placeholder="Enter price"
                            />
                        </label>
                    </div>
                    <button className="save-alert-btn" onClick={addAlert}>
                        Save Alert
                    </button>
                </div>
            )}

            <div className="alerts-list">
                {alerts.length === 0 ? (
                    <div className="no-alerts">No price alerts set</div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className={`alert-item ${alert.triggered ? 'triggered' : ''} ${!alert.enabled ? 'disabled' : ''}`}>
                            <div className="alert-info">
                                <div className="alert-condition">
                                    {alert.type === 'above' ? '↑' : '↓'} Price {alert.type === 'above' ? 'above' : 'below'} {alert.price}
                                </div>
                                <div className="alert-status">
                                    {alert.triggered ? '✓ Triggered' : '⏳ Active'}
                                </div>
                            </div>
                            <div className="alert-actions">
                                <button
                                    className="toggle-btn"
                                    onClick={() => toggleAlert(alert.id)}
                                >
                                    {alert.enabled ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeAlert(alert.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

