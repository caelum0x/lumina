import React, {useState, useEffect} from 'react'
import {ThemeToggle, useTheme} from './theme-toggle'
import {OpenRouterSettings} from './openrouter-settings'
import './user-settings.scss'

/**
 * User settings/preferences page
 */
export default function UserSettings() {
    const {theme, toggleTheme} = useTheme()
    const [settings, setSettings] = useState({
        defaultNetwork: 'public',
        displayOptions: {
            showWhales: true,
            showSoroban: true,
            showRegular: true,
            animations: true
        },
        notifications: {
            whaleAlerts: false,
            errorAlerts: true
        },
        performance: {
            maxParticles: 2000,
            targetFPS: 60
        }
    })

    useEffect(() => {
        // Load saved settings
        const saved = localStorage.getItem('lumina-user-settings')
        if (saved) {
            try {
                setSettings(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to load settings:', e)
            }
        }
    }, [])

    const saveSettings = (newSettings) => {
        setSettings(newSettings)
        localStorage.setItem('lumina-user-settings', JSON.stringify(newSettings))
    }

    const updateDisplayOption = (key, value) => {
        saveSettings({
            ...settings,
            displayOptions: {
                ...settings.displayOptions,
                [key]: value
            }
        })
    }

    const updateNotification = (key, value) => {
        saveSettings({
            ...settings,
            notifications: {
                ...settings.notifications,
                [key]: value
            }
        })
    }

    return (
        <div className="user-settings">
            <h2>User Settings</h2>

            <div className="settings-section">
                <h3>Appearance</h3>
                <div className="setting-item">
                    <label>Theme</label>
                    <ThemeToggle />
                </div>
            </div>

            <div className="settings-section">
                <h3>Default Network</h3>
                <div className="setting-item">
                    <label>
                        <input
                            type="radio"
                            name="network"
                            value="public"
                            checked={settings.defaultNetwork === 'public'}
                            onChange={(e) => saveSettings({...settings, defaultNetwork: e.target.value})}
                        />
                        Public Network
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="network"
                            value="testnet"
                            checked={settings.defaultNetwork === 'testnet'}
                            onChange={(e) => saveSettings({...settings, defaultNetwork: e.target.value})}
                        />
                        Testnet
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h3>Display Options</h3>
                <div className="setting-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.displayOptions.showWhales}
                            onChange={(e) => updateDisplayOption('showWhales', e.target.checked)}
                        />
                        Show Whale Transactions
                    </label>
                </div>
                <div className="setting-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.displayOptions.showSoroban}
                            onChange={(e) => updateDisplayOption('showSoroban', e.target.checked)}
                        />
                        Show Soroban Contracts
                    </label>
                </div>
                <div className="setting-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.displayOptions.showRegular}
                            onChange={(e) => updateDisplayOption('showRegular', e.target.checked)}
                        />
                        Show Regular Transactions
                    </label>
                </div>
                <div className="setting-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.displayOptions.animations}
                            onChange={(e) => updateDisplayOption('animations', e.target.checked)}
                        />
                        Enable Animations
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h3>Notifications</h3>
                <div className="setting-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.notifications.whaleAlerts}
                            onChange={(e) => updateNotification('whaleAlerts', e.target.checked)}
                        />
                        Whale Transaction Alerts
                    </label>
                </div>
                <div className="setting-item">
                    <label>
                        <input
                            type="checkbox"
                            checked={settings.notifications.errorAlerts}
                            onChange={(e) => updateNotification('errorAlerts', e.target.checked)}
                        />
                        Error Alerts
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h3>Performance</h3>
                <div className="setting-item">
                    <label>
                        Max Particles: {settings.performance.maxParticles}
                        <input
                            type="range"
                            min="500"
                            max="5000"
                            step="500"
                            value={settings.performance.maxParticles}
                            onChange={(e) => saveSettings({
                                ...settings,
                                performance: {
                                    ...settings.performance,
                                    maxParticles: parseInt(e.target.value)
                                }
                            })}
                        />
                    </label>
                </div>
                <div className="setting-item">
                    <label>
                        Target FPS: {settings.performance.targetFPS}
                        <input
                            type="range"
                            min="30"
                            max="120"
                            step="30"
                            value={settings.performance.targetFPS}
                            onChange={(e) => saveSettings({
                                ...settings,
                                performance: {
                                    ...settings.performance,
                                    targetFPS: parseInt(e.target.value)
                                }
                            })}
                        />
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h3>AI Configuration</h3>
                <OpenRouterSettings />
            </div>

            <div className="settings-actions">
                <button
                    className="reset-button"
                    onClick={() => {
                        localStorage.removeItem('lumina-user-settings')
                        window.location.reload()
                    }}
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    )
}

