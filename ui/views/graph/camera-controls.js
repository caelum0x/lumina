import React, {useRef, useEffect} from 'react'
import {useThree} from '@react-three/fiber'
import * as THREE from 'three'
import {useStore} from './store'

// Store camera refs globally to access from outside Canvas
let cameraRef = null
let controlsRef = null

/**
 * Camera Controls Hook - must be used inside Canvas
 */
export function useCameraControls() {
    const {camera, controls} = useThree()
    const transactions = useStore(state => state.transactions)
    const getTopWhales = useStore(state => state.getTopWhales)

    useEffect(() => {
        cameraRef = camera
        controlsRef = controls
        return () => {
            cameraRef = null
            controlsRef = null
        }
    }, [camera, controls])

    const originalPosition = useRef(new THREE.Vector3(0, 0, 120))
    const originalTarget = useRef(new THREE.Vector3(0, 0, 0))

    /**
     * Reset to overview position
     */
    const resetToOverview = () => {
        if (controls) {
            const target = originalTarget.current.clone()
            const position = originalPosition.current.clone()
            
            // Smooth animation
            const startPos = camera.position.clone()
            const startTarget = controls.target.clone()
            const duration = 1000 // 1 second
            const startTime = Date.now()

            function animate() {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                const ease = 1 - Math.pow(1 - progress, 3) // Ease out cubic

                camera.position.lerpVectors(startPos, position, ease)
                controls.target.lerpVectors(startTarget, target, ease)
                controls.update()

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }
            animate()
        }
    }

    /**
     * Zoom to whales
     */
    const zoomToWhales = () => {
        const whales = getTopWhales(5)
        if (whales.length === 0) return

        // Find center of whale positions
        const positions = transactions
            .filter(tx => tx.isWhale)
            .map(tx => new THREE.Vector3(...tx.position))
        
        if (positions.length === 0) return

        const center = new THREE.Vector3()
        positions.forEach(pos => center.add(pos))
        center.divideScalar(positions.length)

        // Calculate bounding sphere
        let maxDistance = 0
        positions.forEach(pos => {
            const distance = center.distanceTo(pos)
            if (distance > maxDistance) maxDistance = distance
        })

        const distance = Math.max(maxDistance * 2, 50)
        const offset = new THREE.Vector3(0, 0, distance)
        const newPosition = center.clone().add(offset)

        // Smooth animation
        const startPos = camera.position.clone()
        const startTarget = controls.target.clone()
        const duration = 1500
        const startTime = Date.now()

        function animate() {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)

            camera.position.lerpVectors(startPos, newPosition, ease)
            controls.target.lerpVectors(startTarget, center, ease)
            controls.update()

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }
        animate()
    }

    /**
     * Follow mode - follow the latest transaction
     */
    const followLatest = () => {
        if (transactions.length === 0) return

        const latest = transactions[transactions.length - 1]
        const targetPos = new THREE.Vector3(...latest.position)
        const offset = new THREE.Vector3(0, 0, 30)
        const newPosition = targetPos.clone().add(offset)

        // Smooth follow
        const startPos = camera.position.clone()
        const startTarget = controls.target.clone()
        const duration = 2000
        const startTime = Date.now()

        function animate() {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)

            camera.position.lerpVectors(startPos, newPosition, ease)
            controls.target.lerpVectors(startTarget, targetPos, ease)
            controls.update()

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }
        animate()
    }

    return {
        resetToOverview,
        zoomToWhales,
        followLatest
    }
}

/**
 * Camera control functions (can be called from outside Canvas)
 */
export function getCameraControls() {
    if (!cameraRef || !controlsRef) return null

    // Import store dynamically to avoid circular dependencies
    const store = require('./store').useStore.getState()
    const transactions = store.transactions
    const getTopWhales = store.getTopWhales

    return {
        resetToOverview: () => {
            const camera = cameraRef
            const controls = controlsRef
            if (!camera || !controls) return

            const target = new THREE.Vector3(0, 0, 0)
            const position = new THREE.Vector3(0, 0, 120)
            
            const startPos = camera.position.clone()
            const startTarget = controls.target.clone()
            const duration = 1000
            const startTime = Date.now()

            function animate() {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                const ease = 1 - Math.pow(1 - progress, 3)

                camera.position.lerpVectors(startPos, position, ease)
                controls.target.lerpVectors(startTarget, target, ease)
                controls.update()

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }
            animate()
        },
        zoomToWhales: () => {
            const camera = cameraRef
            const controls = controlsRef
            if (!camera || !controls) return

            const store = require('./store').useStore.getState()
            const whales = store.getTopWhales(5)
            const positions = store.transactions
                .filter(tx => tx.isWhale)
                .map(tx => new THREE.Vector3(...tx.position))
            
            if (positions.length === 0) return

            const center = new THREE.Vector3()
            positions.forEach(pos => center.add(pos))
            center.divideScalar(positions.length)

            let maxDistance = 0
            positions.forEach(pos => {
                const distance = center.distanceTo(pos)
                if (distance > maxDistance) maxDistance = distance
            })

            const distance = Math.max(maxDistance * 2, 50)
            const offset = new THREE.Vector3(0, 0, distance)
            const newPosition = center.clone().add(offset)

            const startPos = camera.position.clone()
            const startTarget = controls.target.clone()
            const duration = 1500
            const startTime = Date.now()

            function animate() {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                const ease = 1 - Math.pow(1 - progress, 3)

                camera.position.lerpVectors(startPos, newPosition, ease)
                controls.target.lerpVectors(startTarget, center, ease)
                controls.update()

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }
            animate()
        },
        followLatest: () => {
            const camera = cameraRef
            const controls = controlsRef
            const store = require('./store').useStore.getState()
            const txs = store.transactions
            if (!camera || !controls || txs.length === 0) return

            const latest = txs[txs.length - 1]
            const targetPos = new THREE.Vector3(...latest.position)
            const offset = new THREE.Vector3(0, 0, 30)
            const newPosition = targetPos.clone().add(offset)

            const startPos = camera.position.clone()
            const startTarget = controls.target.clone()
            const duration = 2000
            const startTime = Date.now()

            function animate() {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                const ease = 1 - Math.pow(1 - progress, 3)

                camera.position.lerpVectors(startPos, newPosition, ease)
                controls.target.lerpVectors(startTarget, targetPos, ease)
                controls.update()

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }
            animate()
        }
    }
}

/**
 * Camera Presets Component - renders outside Canvas
 */
export function CameraPresets() {
    const transactions = useStore(state => state.transactions)
    const [followMode, setFollowMode] = React.useState(false)
    const followIntervalRef = React.useRef(null)

    const handleFollowToggle = () => {
        const controls = getCameraControls()
        if (!controls) return

        if (followMode) {
            if (followIntervalRef.current) {
                clearInterval(followIntervalRef.current)
                followIntervalRef.current = null
            }
            setFollowMode(false)
        } else {
            if (transactions.length === 0) return
            controls.followLatest()
            followIntervalRef.current = setInterval(() => {
                const ctrl = getCameraControls()
                if (ctrl) ctrl.followLatest()
            }, 2000)
            setFollowMode(true)
        }
    }

    React.useEffect(() => {
        return () => {
            if (followIntervalRef.current) {
                clearInterval(followIntervalRef.current)
            }
        }
    }, [])

    const handleOverview = () => {
        const controls = getCameraControls()
        if (controls) controls.resetToOverview()
    }

    const handleZoomToWhales = () => {
        const controls = getCameraControls()
        if (controls) controls.zoomToWhales()
    }

    return (
        <div className="camera-presets">
            <button
                className="preset-button"
                onClick={handleOverview}
                title="Reset to overview"
            >
                📍 Overview
            </button>
            <button
                className="preset-button"
                onClick={handleZoomToWhales}
                title="Zoom to whales"
            >
                🐋 Whales
            </button>
            <button
                className={`preset-button ${followMode ? 'active' : ''}`}
                onClick={handleFollowToggle}
                title="Follow latest transactions"
            >
                {followMode ? '⏸️ Follow' : '▶️ Follow'}
            </button>
        </div>
    )
}

