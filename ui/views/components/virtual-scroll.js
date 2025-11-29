import React, {useState, useEffect, useRef, useMemo} from 'react'
import './virtual-scroll.scss'

/**
 * Virtual scrolling component for large lists
 * Only renders visible items for better performance
 */
export function VirtualScroll({
    items,
    itemHeight = 50,
    containerHeight = 400,
    renderItem,
    className = ''
}) {
    const [scrollTop, setScrollTop] = useState(0)
    const containerRef = useRef(null)

    const totalHeight = items.length * itemHeight
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length)

    const visibleItems = useMemo(() => {
        return items.slice(startIndex, endIndex)
    }, [items, startIndex, endIndex])

    const offsetY = startIndex * itemHeight

    const handleScroll = (e) => {
        setScrollTop(e.target.scrollTop)
    }

    return (
        <div
            ref={containerRef}
            className={`virtual-scroll-container ${className}`}
            style={{height: containerHeight, overflow: 'auto'}}
            onScroll={handleScroll}
        >
            <div
                className="virtual-scroll-content"
                style={{
                    height: totalHeight,
                    position: 'relative'
                }}
            >
                <div
                    className="virtual-scroll-items"
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0
                    }}
                >
                    {visibleItems.map((item, index) => (
                        <div
                            key={startIndex + index}
                            className="virtual-scroll-item"
                            style={{height: itemHeight}}
                        >
                            {renderItem(item, startIndex + index)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Hook for virtual scrolling calculations
 */
export function useVirtualScroll(items, itemHeight, containerHeight) {
    const [scrollTop, setScrollTop] = useState(0)

    const visibleRange = useMemo(() => {
        const visibleCount = Math.ceil(containerHeight / itemHeight)
        const startIndex = Math.floor(scrollTop / itemHeight)
        const endIndex = Math.min(startIndex + visibleCount + 1, items.length)
        return {startIndex, endIndex}
    }, [scrollTop, items.length, itemHeight, containerHeight])

    const visibleItems = useMemo(() => {
        return items.slice(visibleRange.startIndex, visibleRange.endIndex)
    }, [items, visibleRange])

    const totalHeight = items.length * itemHeight
    const offsetY = visibleRange.startIndex * itemHeight

    return {
        visibleItems,
        totalHeight,
        offsetY,
        setScrollTop
    }
}

