import React, {useState, useEffect} from 'react'
import openRouterClient from '../../business-logic/ai/openrouter-client'
import './openrouter-settings.scss'

/**
 * OpenRouter Settings Component
 * Allows users to configure OpenRouter API key for AI insights
 */
export function OpenRouterSettings() {
    const [apiKey, setApiKey] = useState('')
    const [model, setModel] = useState('anthropic/claude-3.5-sonnet')
    const [isConfigured, setIsConfigured] = useState(false)
    const [status, setStatus] = useState('') // 'success', 'error', ''

    useEffect(() => {
        // Check if already configured
        const savedKey = localStorage.getItem('openrouter_api_key')
        const savedModel = localStorage.getItem('openrouter_model')
        
        if (savedKey) {
            setApiKey(savedKey)
            setIsConfigured(true)
        }
        if (savedModel) {
            setModel(savedModel)
        }
    }, [])

    const handleSave = () => {
        if (!apiKey.trim()) {
            setStatus('error')
            setTimeout(() => setStatus(''), 3000)
            return
        }

        // Save to localStorage
        localStorage.setItem('openrouter_api_key', apiKey)
        localStorage.setItem('openrouter_model', model)
        
        // Initialize client
        openRouterClient.init(apiKey, model)
        openRouterClient.clearCache() // Clear cache when key changes
        
        setIsConfigured(true)
        setStatus('success')
        setTimeout(() => setStatus(''), 3000)
    }

    const handleRemove = () => {
        localStorage.removeItem('openrouter_api_key')
        localStorage.removeItem('openrouter_model')
        openRouterClient.init(null)
        openRouterClient.clearCache()
        
        setApiKey('')
        setIsConfigured(false)
        setStatus('success')
        setTimeout(() => setStatus(''), 3000)
    }

    const popularModels = [
        {value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Recommended)'},
        {value: 'openai/gpt-4', label: 'GPT-4'},
        {value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo'},
        {value: 'google/gemini-pro', label: 'Google Gemini Pro'},
        {value: 'meta-llama/llama-3-70b-instruct', label: 'Llama 3 70B'},
    ]

    return (
        <div className="openrouter-settings">
            <h3>🤖 AI Insights Configuration</h3>
            <p className="description">
                Configure OpenRouter API key to enable AI-powered transaction analysis.
                <br />
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                    Get your API key from OpenRouter.ai
                </a>
            </p>

            {status === 'success' && (
                <div className="status-message success">
                    ✓ Settings saved successfully
                </div>
            )}

            {status === 'error' && (
                <div className="status-message error">
                    ✗ Please enter a valid API key
                </div>
            )}

            <div className="settings-form">
                <div className="form-group">
                    <label htmlFor="openrouter-api-key">
                        OpenRouter API Key
                        {isConfigured && <span className="configured-badge">✓ Configured</span>}
                    </label>
                    <input
                        id="openrouter-api-key"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-or-v1-..."
                        disabled={isConfigured}
                    />
                    {isConfigured && (
                        <button
                            type="button"
                            className="btn-remove"
                            onClick={handleRemove}
                        >
                            Remove Key
                        </button>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="openrouter-model">AI Model</label>
                    <select
                        id="openrouter-model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                    >
                        {popularModels.map(m => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                    <small>
                        Different models have different capabilities and costs.
                        <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer">
                            View all models
                        </a>
                    </small>
                </div>

                {!isConfigured && (
                    <button
                        type="button"
                        className="btn-save"
                        onClick={handleSave}
                    >
                        Save Configuration
                    </button>
                )}
            </div>

            <div className="info-box">
                <h4>Privacy & Security</h4>
                <ul>
                    <li>API key is stored locally in your browser</li>
                    <li>Only transaction summaries are sent to OpenRouter (not full transaction data)</li>
                    <li>You can remove the key at any time</li>
                    <li>Without API key, the system uses rule-based analysis</li>
                </ul>
            </div>
        </div>
    )
}

