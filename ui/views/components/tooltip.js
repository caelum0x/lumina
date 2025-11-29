import React, {useState, useRef, useEffect} from 'react'
import './tooltip.scss'

/**
 * Tooltip component with help text
 */
export function Tooltip({text, children, position = 'top', className = ''}) {
    const [isVisible, setIsVisible] = useState(false)
    const tooltipRef = useRef(null)
    const triggerRef = useRef(null)

    useEffect(() => {
        if (isVisible && tooltipRef.current && triggerRef.current) {
            const tooltip = tooltipRef.current
            const trigger = triggerRef.current
            const rect = trigger.getBoundingClientRect()

            // Position tooltip
            switch (position) {
                case 'top':
                    tooltip.style.bottom = `${window.innerHeight - rect.top + 8}px`
                    tooltip.style.left = `${rect.left + rect.width / 2}px`
                    tooltip.style.transform = 'translateX(-50%)'
                    break
                case 'bottom':
                    tooltip.style.top = `${rect.bottom + 8}px`
                    tooltip.style.left = `${rect.left + rect.width / 2}px`
                    tooltip.style.transform = 'translateX(-50%)'
                    break
                case 'left':
                    tooltip.style.right = `${window.innerWidth - rect.left + 8}px`
                    tooltip.style.top = `${rect.top + rect.height / 2}px`
                    tooltip.style.transform = 'translateY(-50%)'
                    break
                case 'right':
                    tooltip.style.left = `${rect.right + 8}px`
                    tooltip.style.top = `${rect.top + rect.height / 2}px`
                    tooltip.style.transform = 'translateY(-50%)'
                    break
            }
        }
    }, [isVisible, position])

    return (
        <span
            className={`tooltip-wrapper ${className}`}
            ref={triggerRef}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && text && (
                <div
                    ref={tooltipRef}
                    className={`tooltip tooltip-${position}`}
                    role="tooltip"
                >
                    {text}
                </div>
            )}
        </span>
    )
}

/**
 * Help icon with tooltip
 */
export function HelpTooltip({text, className = ''}) {
    return (
        <Tooltip text={text} className={className}>
            <span className="help-icon" aria-label="Help">?</span>
        </Tooltip>
    )
}

