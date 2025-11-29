import React from 'react'
import {useKeyboardShortcuts, KeyboardShortcutsHelp} from './keyboard-shortcuts'

/**
 * Keyboard shortcuts provider component
 * Wrap app with this to enable keyboard shortcuts
 */
export function KeyboardShortcutsProvider({children}) {
    const {showHelp, setShowHelp} = useKeyboardShortcuts()

    return (
        <>
            {children}
            <KeyboardShortcutsHelp
                visible={showHelp}
                onClose={() => setShowHelp(false)}
            />
        </>
    )
}

