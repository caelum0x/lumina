import React, {useState, useEffect, useRef} from 'react'
import {useThree, useFrame} from '@react-three/fiber'
import {VRButton} from '@react-three/drei/core/VRButton'
import {PerspectiveCamera} from '@react-three/drei/core/PerspectiveCamera'
import * as THREE from 'three'
import './vr-mode.scss'

/**
 * VR mode component with enhanced WebXR support
 */
export function VRModeToggle({onVRToggle}) {
    const [isSupported, setIsSupported] = useState(false)
    const [isVRMode, setIsVRMode] = useState(false)
    const {camera, gl} = useThree()

    useEffect(() => {
        // Check for WebXR support
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-vr').then(supported => {
                setIsSupported(supported)
            })
        } else {
            // Check for older WebVR API
            setIsSupported(!!navigator.getVRDisplays)
        }
    }, [])

    const handleVRSessionStart = () => {
        setIsVRMode(true)
        onVRToggle?.(true)
    }

    const handleVRSessionEnd = () => {
        setIsVRMode(false)
        onVRToggle?.(false)
    }

    if (!isSupported) {
        return null // Don't show VR button if not supported
    }

    return (
        <div className="vr-mode-toggle">
            <VRButton
                sessionInit={{
                    requiredFeatures: ['local-floor'],
                    optionalFeatures: ['bounded-floor', 'hand-tracking', 'eye-tracking']
                }}
                onSessionStart={handleVRSessionStart}
                onSessionEnd={handleVRSessionEnd}
            />
            <div className="vr-info">
                <span className="vr-icon">🥽</span>
                <span className="vr-text">{isVRMode ? 'VR Active' : 'VR Mode Available'}</span>
            </div>
            {isVRMode && <VRSettings />}
        </div>
    )
}

/**
 * VR-specific camera controls and settings
 */
function VRCameraControls() {
    const {camera, gl} = useThree()
    const vrControlsRef = useRef()

    useFrame(() => {
        if (!gl.xr.isPresenting) return

        // VR-specific camera adjustments
        // The WebXR API handles most of this, but we can add comfort settings
        if (vrControlsRef.current) {
            // Apply vignette effect for comfort (handled by CSS/PostProcessing)
            // Smooth locomotion would be handled here if implemented
        }
    })

    return null
}

/**
 * VR comfort settings panel
 */
function VRSettings() {
    const [snapTurning, setSnapTurning] = useState(true)
    const [vignette, setVignette] = useState(true)
    const [smoothLocomotion, setSmoothLocomotion] = useState(false)

    return (
        <div className="vr-settings-panel">
            <h4>VR Settings</h4>
            <div className="vr-setting-item">
                <label>
                    <input
                        type="checkbox"
                        checked={snapTurning}
                        onChange={(e) => setSnapTurning(e.target.checked)}
                    />
                    Snap Turning
                </label>
            </div>
            <div className="vr-setting-item">
                <label>
                    <input
                        type="checkbox"
                        checked={vignette}
                        onChange={(e) => setVignette(e.target.checked)}
                    />
                    Vignette (Comfort)
                </label>
            </div>
            <div className="vr-setting-item">
                <label>
                    <input
                        type="checkbox"
                        checked={smoothLocomotion}
                        onChange={(e) => setSmoothLocomotion(e.target.checked)}
                    />
                    Smooth Locomotion
                </label>
            </div>
        </div>
    )
}

/**
 * VR UI panels (floating menus)
 */
export function VRUIPanel({position = [0, 1.6, -0.5], children}) {
    return (
        <mesh position={position}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color="#000" opacity={0.8} transparent />
        </mesh>
    )
}

/**
 * Gaze-based selection for VR
 */
export function useGazeSelection(raycaster, objects) {
    const {camera} = useThree()
    const [selected, setSelected] = useState(null)

    useFrame(() => {
        if (!camera) return

        // Cast ray from camera forward
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
        const intersects = raycaster.intersectObjects(objects)

        if (intersects.length > 0) {
            setSelected(intersects[0].object)
        } else {
            setSelected(null)
        }
    })

    return selected
}

/**
 * Hook to detect VR session with enhanced features
 */
export function useVRMode() {
    const [isVR, setIsVR] = useState(false)
    const [hasHandTracking, setHasHandTracking] = useState(false)
    const {gl} = useThree()

    useEffect(() => {
        const checkVRSession = () => {
            const isPresenting = gl.xr.isPresenting
            setIsVR(isPresenting)

            if (isPresenting && gl.xr.getSession) {
                const session = gl.xr.getSession()
                if (session && session.inputSources) {
                    const hasHands = session.inputSources.some(
                        source => source.hand
                    )
                    setHasHandTracking(hasHands)
                }
            }
        }

        const interval = setInterval(checkVRSession, 100)
        return () => clearInterval(interval)
    }, [gl])

    return {isVR, hasHandTracking}
}

/**
 * VR tutorial/onboarding component
 */
export function VRTutorial({onComplete}) {
    const [step, setStep] = useState(0)

    const steps = [
        'Welcome to VR mode! Use your VR controllers to navigate.',
        'Point at transactions to select them.',
        'Use the grip button to grab and move the view.',
        'Press the menu button to access settings.'
    ]

    if (step >= steps.length) {
        onComplete?.()
        return null
    }

    return (
        <div className="vr-tutorial">
            <div className="tutorial-content">
                <p>{steps[step]}</p>
                <button onClick={() => setStep(step + 1)}>
                    {step < steps.length - 1 ? 'Next' : 'Got it!'}
                </button>
            </div>
        </div>
    )
}

