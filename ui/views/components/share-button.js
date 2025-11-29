import React, {useState} from 'react'
import './share-button.scss'

/**
 * Share button component with multiple sharing options
 */
export function ShareButton({url, title, text, className = ''}) {
    const [showMenu, setShowMenu] = useState(false)
    const currentUrl = url || window.location.href
    const shareTitle = title || document.title
    const shareText = text || `Check out ${shareTitle} on Lumina 3D Modern Stellar Explorer`

    const shareOptions = [
        {
            name: 'Copy Link',
            icon: '🔗',
            action: () => copyToClipboard(currentUrl)
        },
        {
            name: 'Twitter',
            icon: '🐦',
            action: () => openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`)
        },
        {
            name: 'Facebook',
            icon: '📘',
            action: () => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`)
        },
        {
            name: 'LinkedIn',
            icon: '💼',
            action: () => openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`)
        },
        {
            name: 'Reddit',
            icon: '🤖',
            action: () => openShareWindow(`https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareTitle)}`)
        }
    ]

    // Use native Web Share API if available
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: currentUrl
                })
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.error('Error sharing:', e)
                }
            }
        } else {
            setShowMenu(!showMenu)
        }
    }

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            setShowMenu(false)
            // Show toast notification
            showToast('Link copied to clipboard!')
        } catch (e) {
            console.error('Failed to copy:', e)
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                showToast('Link copied to clipboard!')
            } catch (err) {
                showToast('Failed to copy link')
            }
            document.body.removeChild(textArea)
            setShowMenu(false)
        }
    }

    const openShareWindow = (url) => {
        window.open(url, '_blank', 'width=600,height=400')
        setShowMenu(false)
    }

    const showToast = (message) => {
        // Simple toast notification
        const toast = document.createElement('div')
        toast.className = 'share-toast'
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
        <div className={`share-button-container ${className}`}>
            <button
                className="share-button"
                onClick={handleNativeShare}
                title="Share"
            >
                📤 Share
            </button>
            {showMenu && (
                <>
                    <div className="share-overlay" onClick={() => setShowMenu(false)} />
                    <div className="share-menu">
                        {shareOptions.map((option, i) => (
                            <button
                                key={i}
                                className="share-option"
                                onClick={option.action}
                            >
                                <span className="share-icon">{option.icon}</span>
                                <span className="share-name">{option.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

