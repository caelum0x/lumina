// Simple Web Audio API sound engine for DEX events
class DEXSoundEngine {
    constructor() {
        this.audioContext = null
        this.enabled = true
        this.volume = 0.3
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
    }

    playChime() {
        if (!this.enabled) return
        this.init()
        
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        
        osc.connect(gain)
        gain.connect(this.audioContext.destination)
        
        osc.frequency.value = 800
        gain.gain.value = this.volume * 0.3
        
        osc.start()
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
        osc.stop(this.audioContext.currentTime + 0.3)
    }

    playZap() {
        if (!this.enabled) return
        this.init()
        
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        
        osc.connect(gain)
        gain.connect(this.audioContext.destination)
        
        osc.type = 'sawtooth'
        osc.frequency.value = 200
        gain.gain.value = this.volume * 0.4
        
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
        osc.stop(this.audioContext.currentTime + 0.1)
    }

    playSwoosh() {
        if (!this.enabled) return
        this.init()
        
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        
        osc.connect(gain)
        gain.connect(this.audioContext.destination)
        
        osc.type = 'sine'
        osc.frequency.value = 400
        gain.gain.value = this.volume * 0.5
        
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5)
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)
        osc.stop(this.audioContext.currentTime + 0.5)
    }

    playBassDrop() {
        if (!this.enabled) return
        this.init()
        
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        
        osc.connect(gain)
        gain.connect(this.audioContext.destination)
        
        osc.type = 'sine'
        osc.frequency.value = 80
        gain.gain.value = this.volume
        
        osc.start()
        osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)
        osc.stop(this.audioContext.currentTime + 0.3)
    }

    playHeartbeat() {
        if (!this.enabled) return
        this.init()
        
        // Two quick bass hits
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator()
                const gain = this.audioContext.createGain()
                
                osc.connect(gain)
                gain.connect(this.audioContext.destination)
                
                osc.type = 'sine'
                osc.frequency.value = 60
                gain.gain.value = this.volume * 0.8
                
                osc.start()
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
                osc.stop(this.audioContext.currentTime + 0.1)
            }, i * 150)
        }
    }

    playRapidBeeps(count = 3) {
        if (!this.enabled) return
        this.init()
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const osc = this.audioContext.createOscillator()
                const gain = this.audioContext.createGain()
                
                osc.connect(gain)
                gain.connect(this.audioContext.destination)
                
                osc.frequency.value = 1000 + i * 200
                gain.gain.value = this.volume * 0.3
                
                osc.start()
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05)
                osc.stop(this.audioContext.currentTime + 0.05)
            }, i * 100)
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume))
    }
}

export const dexSoundEngine = new DEXSoundEngine()
export default dexSoundEngine
