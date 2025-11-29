import React from 'react'

/**
 * Sound effects system for 3D visualization
 * Provides audio feedback for whale alerts, transactions, etc.
 */

class SoundManager {
    constructor() {
        this.audioContext = null
        this.sounds = new Map()
        this.enabled = false
        this.volume = 0.3
    }

    init() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            this.audioContext = new (AudioContext || webkitAudioContext)()
            this.enabled = true
        }
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return

        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = type

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + duration)
    }

    playWhaleAlert() {
        // High-pitched alert for whale transactions
        this.playTone(800, 0.2, 'sine')
        setTimeout(() => this.playTone(1000, 0.2, 'sine'), 100)
    }

    playTransaction() {
        // Subtle click for regular transactions
        this.playTone(400, 0.05, 'square')
    }

    playSoroban() {
        // Distinct sound for Soroban contracts
        this.playTone(600, 0.15, 'triangle')
        setTimeout(() => this.playTone(800, 0.15, 'triangle'), 50)
    }

    playHighFee() {
        // Alert for high fee transactions
        this.playTone(500, 0.1, 'sawtooth')
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume))
    }

    toggle() {
        this.enabled = !this.enabled
        if (this.enabled && !this.audioContext) {
            this.init()
        }
        return this.enabled
    }
}

// Singleton instance
const soundManager = new SoundManager()

/**
 * Hook for sound effects
 */
export function useSoundEffects(enabled = false) {
    React.useEffect(() => {
        if (enabled) {
            soundManager.init()
        }
    }, [enabled])

    return {
        playWhaleAlert: () => soundManager.playWhaleAlert(),
        playTransaction: () => soundManager.playTransaction(),
        playSoroban: () => soundManager.playSoroban(),
        playHighFee: () => soundManager.playHighFee(),
        setVolume: (vol) => soundManager.setVolume(vol),
        toggle: () => soundManager.toggle()
    }
}

/**
 * Sound effects toggle button
 */
export function SoundEffectsToggle() {
    const [enabled, setEnabled] = React.useState(false)
    const sounds = useSoundEffects(enabled)

    const handleToggle = () => {
        const newState = sounds.toggle()
        setEnabled(newState)
    }

    return (
        <button
            className="sound-toggle-button"
            onClick={handleToggle}
            title={enabled ? 'Disable sound effects' : 'Enable sound effects'}
        >
            {enabled ? '🔊' : '🔇'}
        </button>
    )
}

