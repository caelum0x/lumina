import {useEffect} from 'react'
import {useStore} from './store'

export function useDEXKeyboardShortcuts() {
    const setViewMode = useStore(state => state.setViewMode)
    const viewMode = useStore(state => state.viewMode)

    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

            switch(e.key.toLowerCase()) {
                case 'l':
                    setViewMode(viewMode === 'liquidity' ? 'galaxy' : 'liquidity')
                    break
                case 'a':
                    setViewMode(viewMode === 'arbitrage' ? 'galaxy' : 'arbitrage')
                    break
                case 'g':
                    setViewMode('galaxy')
                    break
                case 't':
                    setViewMode(viewMode === 'topology' ? 'galaxy' : 'topology')
                    break
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [setViewMode, viewMode])
}
