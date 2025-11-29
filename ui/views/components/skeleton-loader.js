import React from 'react'
import cn from 'classnames'
import './skeleton-loader.scss'

/**
 * Skeleton loader component for better loading UX
 */
export function SkeletonLoader({type = 'text', lines = 3, width, height, className, rounded = false}) {
    const classes = cn('skeleton-loader', `skeleton-${type}`, className, {
        'skeleton-rounded': rounded
    })

    if (type === 'text') {
        return (
            <div className={classes}>
                {Array.from({length: lines}).map((_, i) => (
                    <div
                        key={i}
                        className="skeleton-line"
                        style={{
                            width: i === lines - 1 ? '60%' : width || '100%',
                            height: height || '1em'
                        }}
                    />
                ))}
            </div>
        )
    }

    if (type === 'circle') {
        return (
            <div
                className={classes}
                style={{
                    width: width || '50px',
                    height: height || '50px',
                    borderRadius: '50%'
                }}
            />
        )
    }

    if (type === 'rectangle') {
        return (
            <div
                className={classes}
                style={{
                    width: width || '100%',
                    height: height || '100px'
                }}
            />
        )
    }

    if (type === 'card') {
        return (
            <div className={classes}>
                <div className="skeleton-header" style={{height: height || '200px'}} />
                <div className="skeleton-content">
                    <div className="skeleton-line" style={{width: '80%'}} />
                    <div className="skeleton-line" style={{width: '60%'}} />
                </div>
            </div>
        )
    }

    return <div className={classes} style={{width, height}} />
}

/**
 * Table skeleton loader
 */
export function TableSkeleton({rows = 5, columns = 4}) {
    return (
        <div className="skeleton-table">
            <div className="skeleton-table-header">
                {Array.from({length: columns}).map((_, i) => (
                    <div key={i} className="skeleton-cell" />
                ))}
            </div>
            {Array.from({length: rows}).map((_, rowIdx) => (
                <div key={rowIdx} className="skeleton-table-row">
                    {Array.from({length: columns}).map((_, colIdx) => (
                        <div key={colIdx} className="skeleton-cell" />
                    ))}
                </div>
            ))}
        </div>
    )
}

/**
 * Chart skeleton loader
 */
export function ChartSkeleton({height = '300px'}) {
    return (
        <div className="skeleton-chart" style={{height}}>
            <div className="skeleton-chart-bars">
                {Array.from({length: 12}).map((_, i) => (
                    <div
                        key={i}
                        className="skeleton-chart-bar"
                        style={{
                            height: `${30 + Math.random() * 70}%`
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

