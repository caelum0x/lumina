import React, {useState, useEffect} from 'react'
import './theme-toggle.scss'

/**
 * Theme toggle component (dark/light mode)
 */
export function ThemeToggle({className = ''}) {
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        // Load saved theme preference
        const savedTheme = localStorage.getItem('lumina-theme') || 'light'
        setTheme(savedTheme)
        applyTheme(savedTheme)
    }, [])

    const applyTheme = (newTheme) => {
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('lumina-theme', newTheme)
    }

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        applyTheme(newTheme)
    }

    return (
        <button
            className={`theme-toggle ${className}`}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? '🌙' : '☀️'}
            <span className="theme-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
    )
}

/**
 * Hook to use theme
 */
export function useTheme() {
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        const savedTheme = localStorage.getItem('lumina-theme') || 'light'
        setTheme(savedTheme)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('lumina-theme', newTheme)
    }

    return {theme, toggleTheme}
}

