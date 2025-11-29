import React, {useState, useEffect, useRef} from 'react'
import {navigation} from '@stellar-expert/navigation'
import {resolvePath} from '../../business-logic/path'
import {apiCall} from '../../models/api'
import './global-search-bar.scss'

export default function GlobalSearchBar({className, placeholder}) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState({records: [], suggestions: []})
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (query.length < 2) {
            setResults({
                suggestions: [
                    {text: 'XLM', type: 'asset'},
                    {text: 'USDC', type: 'asset'},
                    {text: 'Top pools', type: 'link'},
                    {text: 'Whales', type: 'link'},
                    {text: 'Soroban stats', type: 'link'}
                ]
            })
            setShowDropdown(query.length > 0)
            return
        }

        setLoading(true)
        const timer = setTimeout(async () => {
            try {
                const data = await apiCall(`search/unified?q=${encodeURIComponent(query)}`)
                setResults(data)
                setShowDropdown(true)
            } catch (e) {
                console.error('Search error:', e)
                setResults({records: [], suggestions: []})
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function go(url) {
        navigation.navigate(resolvePath(url))
        setQuery('')
        setShowDropdown(false)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && results.records && results.records.length > 0) {
            go(results.records[0].url)
        }
        if (e.key === 'Escape') {
            setShowDropdown(false)
            setQuery('')
        }
    }

    function getIconClass(icon) {
        const iconMap = {
            'user': 'icon-user',
            'exchange': 'icon-exchange',
            'book': 'icon-book',
            'coins': 'icon-coins',
            'tint': 'icon-tint',
            'cogs': 'icon-cogs',
            'chart-line': 'icon-chart-line',
            'dollar-sign': 'icon-dollar-sign'
        }
        return iconMap[icon] || 'icon-search'
    }

    return (
        <div className={`global-search-bar ${className || ''}`}>
            <div className="search-input-wrapper" onClick={() => inputRef.current?.focus()}>
                <i className="icon icon-search search-icon"/>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={placeholder || 'Search accounts, assets, txs, pools, contracts...'}
                    className="search-input"
                    autoComplete="off"
                />
                {loading && <div className="search-loader"/>}
            </div>

            {showDropdown && (results.records?.length > 0 || results.suggestions?.length > 0) && (
                <div ref={dropdownRef} className="search-dropdown">
                    {results.records?.map((r, i) => (
                        <div
                            key={i}
                            onClick={() => go(r.url)}
                            className="search-result-item"
                        >
                            <i className={`${getIconClass(r.icon)} result-icon`}/>
                            <div className="result-content">
                                <div className="result-title">{r.title}</div>
                                <div className="result-subtitle">{r.subtitle}</div>
                            </div>
                            <span className="result-type">{r.type}</span>
                        </div>
                    ))}
                    {results.suggestions?.map((s, i) => (
                        <div
                            key={`sug-${i}`}
                            onClick={() => s.url ? go(s.url) : setQuery(s.text)}
                            className="search-suggestion-item"
                        >
                            <i className="icon icon-lightbulb suggestion-icon"/>
                            <span className="suggestion-text">
                                {s.title || s.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
