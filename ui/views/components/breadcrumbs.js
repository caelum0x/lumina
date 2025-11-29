import React from 'react'
import {useLocation, useHistory} from 'react-router'
import './breadcrumbs.scss'

/**
 * Breadcrumb navigation component
 */
export function Breadcrumbs({items, className = ''}) {
    const location = useLocation()
    const history = useHistory()

    // Auto-generate breadcrumbs from path if not provided
    const breadcrumbs = items || generateBreadcrumbsFromPath(location.pathname)

    if (breadcrumbs.length <= 1) return null

    const handleClick = (e, path) => {
        e.preventDefault()
        history.push(path)
    }

    return (
        <nav className={`breadcrumbs ${className}`} aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1
                    return (
                        <li key={index} className="breadcrumb-item">
                            {isLast ? (
                                <span className="breadcrumb-current" aria-current="page">
                                    {crumb.label}
                                </span>
                            ) : (
                                <a 
                                    href={crumb.path} 
                                    className="breadcrumb-link"
                                    onClick={(e) => handleClick(e, crumb.path)}
                                >
                                    {crumb.label}
                                </a>
                            )}
                            {!isLast && <span className="breadcrumb-separator">/</span>}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbsFromPath(pathname) {
    const parts = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{label: 'Home', path: '/'}]

    let currentPath = ''
    parts.forEach((part, index) => {
        currentPath += `/${part}`
        const label = formatBreadcrumbLabel(part, index, parts)
        breadcrumbs.push({
            label,
            path: currentPath
        })
    })

    return breadcrumbs
}

/**
 * Format breadcrumb label from path segment
 */
function formatBreadcrumbLabel(segment, index, allSegments) {
    // Network names
    if (segment === 'public' || segment === 'testnet') {
        return segment.charAt(0).toUpperCase() + segment.slice(1)
    }

    // Resource types
    const resourceMap = {
        'explorer': 'Explorer',
        'account': 'Account',
        'asset': 'Asset',
        'tx': 'Transaction',
        'ledger': 'Ledger',
        'contract': 'Contract',
        'market': 'Market',
        'directory': 'Directory',
        'graph': '3D Graph',
        '3d': '3D Visualization'
    }

    if (resourceMap[segment]) {
        return resourceMap[segment]
    }

    // If it's likely an address/ID (long alphanumeric), truncate it
    if (segment.length > 20 && /^[A-Z0-9]+$/i.test(segment)) {
        return `${segment.substring(0, 8)}...${segment.substring(segment.length - 6)}`
    }

    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

