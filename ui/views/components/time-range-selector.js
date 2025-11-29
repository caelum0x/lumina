import React, {useState} from 'react'
import './time-range-selector.scss'

/**
 * Time range selector component for charts and data views
 */
export function TimeRangeSelector({onChange, defaultRange = '24h', className = ''}) {
    const [selectedRange, setSelectedRange] = useState(defaultRange)

    const ranges = [
        {value: '1h', label: '1 Hour'},
        {value: '24h', label: '24 Hours'},
        {value: '7d', label: '7 Days'},
        {value: '30d', label: '30 Days'},
        {value: '90d', label: '90 Days'},
        {value: '1y', label: '1 Year'},
        {value: 'all', label: 'All Time'}
    ]

    const handleChange = (range) => {
        setSelectedRange(range)
        if (onChange) {
            onChange(range)
        }
    }

    return (
        <div className={`time-range-selector ${className}`}>
            {ranges.map(range => (
                <button
                    key={range.value}
                    className={`range-button ${selectedRange === range.value ? 'active' : ''}`}
                    onClick={() => handleChange(range.value)}
                >
                    {range.label}
                </button>
            ))}
        </div>
    )
}

/**
 * Hook to get time range in milliseconds
 */
export function useTimeRange(range) {
    const now = Date.now()
    
    const ranges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
        '90d': 90 * 24 * 60 * 60 * 1000,
        '1y': 365 * 24 * 60 * 60 * 1000,
        'all': null
    }

    const duration = ranges[range] || null
    const startTime = duration ? now - duration : null

    return {startTime, endTime: now, duration}
}

