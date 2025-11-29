import React, {useEffect, useState} from 'react'
import {useHistory} from 'react-router'
import './keyboard-shortcuts.scss'

/**
 * Keyboard shortcuts handler
 */
const shortcuts = {
    '/': {action: 'focus-search', description: 'Focus search box'},
    'g h': {action: 'go-home', description: 'Go to home'},
    'g 3': {action: 'go-3d', description: 'Go to 3D view'},
    'g a': {action: 'go-assets', description: 'Go to assets'},
    'g m': {action: 'go-markets', description: 'Go to markets'},
    '?': {action: 'show-help', description: 'Show keyboard shortcuts'},
    'Escape': {action: 'close-modals', description: 'Close modals/overlays'},
    'f': {action: 'toggle-fullscreen', description: 'Toggle fullscreen (in 3D view)'}
}

/**
 * Keyboard shortcuts hook
 */
export function useKeyboardShortcuts() {
    const history = useHistory()
    const [showHelp, setShowHelp] = useState(false)

    useEffect(() => {
        let keySequence = ''
        let sequenceTimeout

        const handleKeyPress = (e) => {
            // Ignore if typing in input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.key === 'Escape') {
                    e.target.blur()
                }
                return
            }

            const key = e.key.toLowerCase()

            // Handle single key shortcuts
            if (key === '/') {
                e.preventDefault()
                const searchInput = document.querySelector('.search-box input, .search-input')
                if (searchInput) {
                    searchInput.focus()
                }
                return
            }

            if (key === '?') {
                e.preventDefault()
                setShowHelp(prev => !prev)
                return
            }

            if (key === 'escape') {
                // Close any open modals
                const modals = document.querySelectorAll('.modal, .overlay-menu, .suggestions-dropdown')
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        modal.style.display = 'none'
                    }
                })
                return
            }

            if (key === 'f' && window.location.pathname.includes('/graph/3d')) {
                e.preventDefault()
                const fullscreenBtn = document.querySelector('.fullscreen-toggle')
                if (fullscreenBtn) {
                    fullscreenBtn.click()
                }
                return
            }

            // Handle sequence shortcuts (g + key)
            if (key === 'g') {
                keySequence = 'g'
                sequenceTimeout = setTimeout(() => {
                    keySequence = ''
                }, 1000)
                return
            }

            if (keySequence === 'g') {
                e.preventDefault()
                clearTimeout(sequenceTimeout)
                keySequence = ''

                switch (key) {
                    case 'h':
                        history.push('/explorer/public')
                        break
                    case '3':
                        const network = window.location.pathname.includes('testnet') ? 'testnet' : 'public'
                        history.push(`/graph/3d/${network}`)
                        break
                    case 'a':
                        history.push('/explorer/public/asset')
                        break
                    case 'm':
                        history.push('/explorer/public/market')
                        break
                }
            }
        }

        window.addEventListener('keydown', handleKeyPress)

        return () => {
            window.removeEventListener('keydown', handleKeyPress)
            clearTimeout(sequenceTimeout)
        }
    }, [history])

    return {showHelp, setShowHelp, shortcuts}
}

/**
 * Keyboard shortcuts help modal
 */
export function KeyboardShortcutsHelp({visible, onClose}) {
    if (!visible) return null

    return (
        <div className="keyboard-shortcuts-modal" onClick={onClose}>
            <div className="shortcuts-content" onClick={(e) => e.stopPropagation()}>
                <div className="shortcuts-header">
                    <h2>Keyboard Shortcuts</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="shortcuts-list">
                    {Object.entries(shortcuts).map(([keys, {description}]) => (
                        <div key={keys} className="shortcut-item">
                            <div className="shortcut-keys">
                                {keys.split(' ').map((key, i) => (
                                    <React.Fragment key={i}>
                                        <kbd>{key === ' ' ? 'Space' : key.toUpperCase()}</kbd>
                                        {i < keys.split(' ').length - 1 && <span>+</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="shortcut-description">{description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

