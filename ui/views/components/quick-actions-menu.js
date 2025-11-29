import React, {useState, useRef, useEffect} from 'react'
import './quick-actions-menu.scss'

/**
 * Quick actions menu component
 * Provides common actions like copy, view in explorer, share, etc.
 */
export function QuickActionsMenu({items, position = 'bottom-right', className = ''}) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const defaultItems = [
        {
            label: 'Copy Address',
            icon: '📋',
            action: () => copyToClipboard(items?.address || '')
        },
        {
            label: 'View in Explorer',
            icon: '🔍',
            action: () => {
                if (items?.explorerUrl) {
                    window.open(items.explorerUrl, '_blank')
                }
            }
        },
        {
            label: 'Share',
            icon: '📤',
            action: () => {
                if (navigator.share && items?.shareData) {
                    navigator.share(items.shareData)
                }
            }
        }
    ]

    const menuItems = items?.actions || defaultItems

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            showToast('Copied to clipboard!')
            setIsOpen(false)
        } catch (e) {
            console.error('Failed to copy:', e)
        }
    }

    const showToast = (message) => {
        const toast = document.createElement('div')
        toast.className = 'quick-actions-toast'
        toast.textContent = message
        document.body.appendChild(toast)
        setTimeout(() => {
            toast.classList.add('show')
        }, 10)
        setTimeout(() => {
            toast.classList.remove('show')
            setTimeout(() => document.body.removeChild(toast), 300)
        }, 2000)
    }

    return (
        <div className={`quick-actions-menu ${className} position-${position}`} ref={menuRef}>
            <button
                className="quick-actions-trigger"
                onClick={() => setIsOpen(!isOpen)}
                title="Quick actions"
            >
                ⋮
            </button>
            {isOpen && (
                <div className="quick-actions-dropdown">
                    {menuItems.map((item, i) => (
                        <button
                            key={i}
                            className="quick-action-item"
                            onClick={() => {
                                item.action()
                                if (item.closeOnClick !== false) {
                                    setIsOpen(false)
                                }
                            }}
                        >
                            {item.icon && <span className="action-icon">{item.icon}</span>}
                            <span className="action-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

