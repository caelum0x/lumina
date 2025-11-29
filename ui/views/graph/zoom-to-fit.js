import {useCallback} from 'react'
import {useThree} from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Zoom to fit functionality for selected transactions or account groups
 */
export function useZoomToFit() {
    const {camera, controls} = useThree()

    const zoomToFit = useCallback((items, padding = 1.5) => {
        if (!items || items.length === 0) return

        // Calculate bounding box
        const box = new THREE.Box3()
        items.forEach(item => {
            const pos = item.position ? new THREE.Vector3(...item.position) : new THREE.Vector3(0, 0, 0)
            box.expandByPoint(pos)
        })

        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const distance = maxDim * padding

        // Calculate camera position
        const direction = new THREE.Vector3(0, 0, 1)
        const cameraPos = new THREE.Vector3().addVectors(center, direction.multiplyScalar(distance))

        // Smoothly animate camera
        if (controls) {
            // OrbitControls
            const target = center
            const currentDistance = camera.position.distanceTo(target)
            const targetDistance = distance

            // Animate
            const startPos = camera.position.clone()
            const startTarget = controls.target ? controls.target.clone() : new THREE.Vector3(0, 0, 0)
            const duration = 1000 // 1 second
            const startTime = Date.now()

            const animate = () => {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic

                // Interpolate camera position
                camera.position.lerpVectors(startPos, cameraPos, easeProgress)

                // Interpolate target
                if (controls.target) {
                    controls.target.lerpVectors(startTarget, target, easeProgress)
                }

                // Update controls
                if (controls.update) {
                    controls.update()
                }

                if (progress < 1) {
                    requestAnimationFrame(animate)
                }
            }

            animate()
        } else {
            // Direct camera positioning
            camera.position.copy(cameraPos)
            camera.lookAt(center)
        }
    }, [camera, controls])

    return zoomToFit
}

/**
 * Hook for zooming to selected transaction
 */
export function useZoomToTransaction() {
    const zoomToFit = useZoomToFit()

    return useCallback((tx) => {
        if (!tx) return
        zoomToFit([tx], 3)
    }, [zoomToFit])
}

/**
 * Hook for zooming to account group
 */
export function useZoomToAccount(transactions, accountAddress) {
    const zoomToFit = useZoomToFit()

    return useCallback(() => {
        if (!accountAddress) return
        const accountTxs = transactions.filter(tx => 
            tx.source === accountAddress || tx.destination === accountAddress
        )
        if (accountTxs.length > 0) {
            zoomToFit(accountTxs, 2)
        }
    }, [transactions, accountAddress, zoomToFit])
}

