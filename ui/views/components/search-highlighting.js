import React from 'react'

/**
 * Search result highlighting component
 * Highlights matching text in search results
 */
export function SearchHighlight({text, query, className = ''}) {
    if (!query || !text) {
        return <span className={className}>{text}</span>
    }

    const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
    
    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.toLowerCase() === query.toLowerCase()) {
                    return (
                        <mark key={index} className="search-highlight">
                            {part}
                        </mark>
                    )
                }
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}

/**
 * Get search snippet with context around matches
 */
export function SearchSnippet({text, query, contextLength = 50}) {
    if (!query || !text) {
        return <span>{text}</span>
    }

    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) {
        return <span>{text}</span>
    }

    const start = Math.max(0, index - contextLength)
    const end = Math.min(text.length, index + query.length + contextLength)
    const snippet = text.substring(start, end)
    const prefix = start > 0 ? '...' : ''
    const suffix = end < text.length ? '...' : ''

    return (
        <span>
            {prefix}
            <SearchHighlight text={snippet} query={query} />
            {suffix}
        </span>
    )
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

