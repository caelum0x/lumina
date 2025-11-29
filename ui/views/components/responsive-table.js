import React from 'react'
import './responsive-table.scss'

/**
 * Responsive table component with horizontal scroll and mobile-friendly layout
 */
export function ResponsiveTable({children, className = ''}) {
    return (
        <div className={`responsive-table-wrapper ${className}`}>
            <div className="responsive-table-scroll">
                <table className="responsive-table">
                    {children}
                </table>
            </div>
        </div>
    )
}

/**
 * Responsive table row that stacks on mobile
 */
export function ResponsiveTableRow({children, className = ''}) {
    return (
        <tr className={`responsive-table-row ${className}`}>
            {children}
        </tr>
    )
}

