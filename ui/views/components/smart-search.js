import React, {useState, useEffect, useRef} from 'react'
import smartSearch from '../../business-logic/ai/smart-search'
import {useHistory} from 'react-router'
import './smart-search.scss'

/**
 * Smart Search Component with AI-powered natural language search
 */
export function SmartSearch({onSearch, className = ''}) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searchHistory, setSearchHistory] = useState([])
    const inputRef = useRef(null)
    const history = useHistory()

    useEffect(() => {
        // Load search history from localStorage
        const saved = localStorage.getItem('lumina_search_history')
        if (saved) {
            try {
                setSearchHistory(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to load search history:', e)
            }
        }
    }, [])

    useEffect(() => {
        if (query.length > 0) {
            const parsed = smartSearch.parseQuery(query)
            const newSuggestions = smartSearch.generateSuggestions(query, searchHistory)
            setSuggestions(newSuggestions)
            setShowSuggestions(true)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [query, searchHistory])

    const handleSearch = (searchQuery = query) => {
        if (!searchQuery.trim()) return

        // Parse query
        const parsed = smartSearch.parseQuery(searchQuery)

        // Save to history
        const updatedHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 20)
        setSearchHistory(updatedHistory)
        localStorage.setItem('lumina_search_history', JSON.stringify(updatedHistory))

        // Navigate or call callback
        if (parsed.type === 'account' && parsed.entities.accounts.length > 0) {
            history.push(`/explorer/${parsed.entities.accounts[0]}`)
        } else if (parsed.type === 'transaction' && parsed.entities.transactions) {
            // Handle transaction search
        } else {
            // General search
            history.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }

        if (onSearch) {
            onSearch(parsed)
        }

        setShowSuggestions(false)
        setQuery('')
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    const handleSuggestionClick = (suggestion) => {
        if (suggestion.type === 'history') {
            setQuery(suggestion.value)
            handleSearch(suggestion.value)
        } else {
            setQuery(suggestion.value)
        }
    }

    return (
        <div className={`smart-search ${className}`}>
            <div className="search-input-container">
                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder="Paste an asset code, tx hash, account address, or ledger sequence here"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                        // Delay to allow suggestion clicks
                        setTimeout(() => setShowSuggestions(false), 200)
                    }}
                />
                <button
                    className="search-button"
                    onClick={() => handleSearch()}
                    title="Search"
                >
                    🔍
                </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`suggestion-item suggestion-${suggestion.type}`}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <span className="suggestion-icon">
                                {suggestion.type === 'history' && '🕐'}
                                {suggestion.type === 'account' && '👤'}
                                {suggestion.type === 'transaction' && '📝'}
                                {suggestion.type === 'asset' && '💰'}
                            </span>
                            <span className="suggestion-text">{suggestion.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {query.length > 0 && query.length < 50 && (
                <div className="search-preview">
                    <div className="preview-label">AI Analysis:</div>
                    <div className="preview-content">
                        {(() => {
                            const parsed = smartSearch.parseQuery(query)
                            return (
                                <>
                                    <span className="preview-type">Type: {parsed.type}</span>
                                    {parsed.entities.accounts.length > 0 && (
                                        <span className="preview-entity">
                                            Accounts: {parsed.entities.accounts.length}
                                        </span>
                                    )}
                                    {parsed.filters.minAmount && (
                                        <span className="preview-filter">
                                            Min: {parsed.filters.minAmount.value} {parsed.filters.minAmount.unit}
                                        </span>
                                    )}
                                </>
                            )
                        })()}
                    </div>
                </div>
            )}
        </div>
    )
}

