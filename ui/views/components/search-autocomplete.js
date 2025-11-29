import React, {useState, useRef, useEffect} from 'react'
import {useHistory} from 'react-router'
import './search-autocomplete.scss'

/**
 * Search autocomplete component with recent searches
 */
export function SearchAutocomplete({onSearch, placeholder = 'Search...', className = ''}) {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [recentSearches, setRecentSearches] = useState([])
    const inputRef = useRef(null)
    const history = useHistory()

    // Load recent searches from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('lumina_recent_searches')
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to load recent searches:', e)
            }
        }
    }, [])

    // Save recent search
    const saveRecentSearch = (term) => {
        if (!term || term.trim().length === 0) return

        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10)
        setRecentSearches(updated)
        localStorage.setItem('lumina_recent_searches', JSON.stringify(updated))
    }

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value
        setQuery(value)

        if (value.length > 0) {
            // Filter recent searches
            const filtered = recentSearches
                .filter(s => s.toLowerCase().includes(value.toLowerCase()))
                .slice(0, 5)
            setSuggestions(filtered)
            setShowSuggestions(true)
        } else {
            setSuggestions(recentSearches.slice(0, 5))
            setShowSuggestions(true)
        }
    }

    // Handle search
    const handleSearch = (searchTerm = query) => {
        if (!searchTerm || searchTerm.trim().length === 0) return

        saveRecentSearch(searchTerm.trim())
        setShowSuggestions(false)

        if (onSearch) {
            onSearch(searchTerm.trim())
        } else {
            // Default: navigate to search results
            history.push(`/explorer/${window.location.pathname.includes('testnet') ? 'testnet' : 'public'}?search=${encodeURIComponent(searchTerm.trim())}`)
        }
    }

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion)
        handleSearch(suggestion)
    }

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([])
        localStorage.removeItem('lumina_recent_searches')
    }

    return (
        <div className={`search-autocomplete ${className}`}>
            <div className="search-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    onFocus={() => {
                        if (suggestions.length > 0 || recentSearches.length > 0) {
                            setShowSuggestions(true)
                        }
                    }}
                    placeholder={placeholder}
                    className="search-input"
                />
                <button
                    className="search-button"
                    onClick={() => handleSearch()}
                    title="Search"
                >
                    🔍
                </button>
            </div>

            {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
                <div className="suggestions-dropdown">
                    {suggestions.length > 0 && (
                        <>
                            <div className="suggestions-header">Suggestions</div>
                            {suggestions.map((suggestion, i) => (
                                <div
                                    key={i}
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </>
                    )}

                    {query.length === 0 && recentSearches.length > 0 && (
                        <>
                            <div className="suggestions-header">
                                Recent Searches
                                <button
                                    className="clear-recent"
                                    onClick={clearRecentSearches}
                                    title="Clear recent searches"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.slice(0, 5).map((search, i) => (
                                <div
                                    key={i}
                                    className="suggestion-item recent"
                                    onClick={() => handleSuggestionClick(search)}
                                >
                                    <span className="suggestion-icon">🕐</span>
                                    {search}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

