import React, {useState, useEffect} from 'react'
import './mobile-menu.scss'

/**
 * Mobile-specific navigation menu with hamburger and slide-out drawer
 */
export function MobileMenu({children, className = ''}) {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Close menu on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }

        // Prevent body scroll when menu is open
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        document.addEventListener('keydown', handleEscape)
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen])

    return (
        <div className={`mobile-menu ${className}`}>
            <button
                className={`mobile-menu-toggle ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="mobile-menu-overlay"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`mobile-menu-drawer ${isOpen ? 'open' : ''}`}>
                        <div className="mobile-menu-header">
                            <h2>Menu</h2>
                            <button
                                className="mobile-menu-close"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close menu"
                            >
                                ×
                            </button>
                        </div>
                        <div className="mobile-menu-content">
                            {children}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

