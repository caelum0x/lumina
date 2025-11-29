import React, {useMemo, useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Transaction path visualization - animated beams showing money flow
 */
export function TransactionPath({from, to, amount, animated = true}) {
    const lineRef = useRef()
    const points = useMemo(() => {
        return [from, to].map(p => new THREE.Vector3(...p))
    }, [from, to])

    const curve = useMemo(() => {
        // Create a curved path
        const midPoint = new THREE.Vector3()
            .addVectors(points[0], points[1])
            .multiplyScalar(0.5)
        
        // Add some height to the curve
        midPoint.y += 20

        return new THREE.QuadraticBezierCurve3(
            points[0],
            midPoint,
            points[1]
        )
    }, [points])

    const geometry = useMemo(() => {
        const curvePoints = curve.getPoints(50)
        return new THREE.BufferGeometry().setFromPoints(curvePoints)
    }, [curve])

    // Animate particles along the path
    useFrame((state) => {
        if (!lineRef.current || !animated) return

        const material = lineRef.current.material
        if (material && material.opacity !== undefined) {
            // Pulse effect
            material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
        }
    })

    const opacity = useMemo(() => {
        // Larger amounts = more visible
        return Math.min(0.8, Math.log10((amount || 0) + 1) * 0.15)
    }, [amount])

    return (
        <line ref={lineRef}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial
                color="#00ffff"
                transparent
                opacity={opacity}
                linewidth={3}
            />
        </line>
    )
}

/**
 * Follow the money visualization - shows transaction paths
 */
export function FollowTheMoney({transactions, connections, enabled = false}) {
    if (!enabled || !connections || connections.length === 0) return null

    return (
        <>
            {connections.map((conn, i) => (
                <TransactionPath
                    key={i}
                    from={conn.from}
                    to={conn.to}
                    amount={conn.amount}
                    animated={true}
                />
            ))}
        </>
    )
}

