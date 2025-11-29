import React, {useEffect, useRef, useState} from 'react'

/**
 * Accessibility utilities and components
 */

/**
 * Screen reader announcement component
 */
export function ScreenReaderAnnounce({message, priority = 'polite'}) {
    const announcementRef = useRef(null)

    useEffect(() => {
        if (message && announcementRef.current) {
            announcementRef.current.textContent = message
        }
    }, [message])

    return (
        <div
            ref={announcementRef}
            role="status"
            aria-live={priority}
            aria-atomic="true"
            className="sr-only"
            style={{
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
            }}
        />
    )
}

/**
 * Focus trap component for modals
 */
export function FocusTrap({children, active = true}) {
    const containerRef = useRef(null)

    useEffect(() => {
        if (!active || !containerRef.current) return

        const focusableElements = containerRef.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault()
                    lastElement?.focus()
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault()
                    firstElement?.focus()
                }
            }
        }

        containerRef.current.addEventListener('keydown', handleTabKey)
        firstElement?.focus()

        return () => {
            containerRef.current?.removeEventListener('keydown', handleTabKey)
        }
    }, [active])

    return <div ref={containerRef}>{children}</div>
}

/**
 * Skip to main content link
 */
export function SkipToMainContent({targetId = 'main-content'}) {
    return (
        <a
            href={`#${targetId}`}
            className="skip-to-main"
            style={{
                position: 'absolute',
                left: '-10000px',
                top: 'auto',
                width: '1px',
                height: '1px',
                overflow: 'hidden'
            }}
            onFocus={(e) => {
                e.target.style.left = '0'
                e.target.style.width = 'auto'
                e.target.style.height = 'auto'
                e.target.style.padding = '8px 16px'
                e.target.style.background = '#000'
                e.target.style.color = '#fff'
                e.target.style.zIndex = '10000'
            }}
            onBlur={(e) => {
                e.target.style.left = '-10000px'
                e.target.style.width = '1px'
                e.target.style.height = '1px'
            }}
        >
            Skip to main content
        </a>
    )
}

/**
 * High contrast mode support
 */
export function useHighContrast() {
    const [isHighContrast, setIsHighContrast] = useState(false)

    useEffect(() => {
        // Check for system preference
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)')
        setIsHighContrast(prefersHighContrast.matches)

        const handleChange = (e) => {
            setIsHighContrast(e.matches)
            if (e.matches) {
                document.documentElement.setAttribute('data-high-contrast', 'true')
            } else {
                document.documentElement.removeAttribute('data-high-contrast')
            }
        }

        prefersHighContrast.addEventListener('change', handleChange)
        return () => prefersHighContrast.removeEventListener('change', handleChange)
    }, [])

    return isHighContrast
}

