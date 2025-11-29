import React, {useRef, useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import {Line} from '@react-three/drei/core/Line'
import * as THREE from 'three'

/**
 * Animated Connection Beam
 * Creates animated flowing connections between transactions
 */
export function AnimatedConnection({from, to, amount, color = '#00f0ff'}) {
    const lineRef = useRef()
    const animationRef = useRef(0)

    // Create curved path
    const curve = useMemo(() => {
        const start = new THREE.Vector3(...from)
        const end = new THREE.Vector3(...to)
        const mid = start.clone().add(end).multiplyScalar(0.5)
        mid.y += 10 // Curve height

        return new THREE.QuadraticBezierCurve3(start, mid, end)
    }, [from, to])

    // Generate points along curve
    const points = useMemo(() => {
        return curve.getPoints(50)
    }, [curve])

    useFrame((state) => {
        if (!lineRef.current) return

        // Animate the connection
        animationRef.current += 0.01
        const offset = Math.sin(animationRef.current) * 0.1

        // Update line material opacity based on animation
        if (lineRef.current.material) {
            lineRef.current.material.opacity = 0.3 + Math.sin(animationRef.current) * 0.2
        }
    })

    const width = useMemo(() => {
        return Math.max(0.5, Math.log10(amount + 1) * 0.5)
    }, [amount])

    return (
        <Line
            ref={lineRef}
            points={points}
            color={color}
            lineWidth={width}
            transparent
            opacity={0.3}
        />
    )
}

/**
 * Animated Connections Manager
 * Manages all animated connections in the scene
 */
export function AnimatedConnections({connections}) {
    const limitedConnections = useMemo(() => {
        if (!connections || !Array.isArray(connections)) return []
        // Limit to 200 connections for performance
        return connections.slice(-200)
    }, [connections])

    return (
        <>
            {limitedConnections.map((conn, index) => {
                if (!conn || !conn.from || !conn.to) return null
                return (
                    <AnimatedConnection
                        key={`animated-${index}-${conn.from[0]}-${conn.to[0]}`}
                        from={conn.from}
                        to={conn.to}
                        amount={conn.amount || 0}
                        color={conn.isWhale ? '#ff0080' : conn.isSoroban ? '#00ffff' : '#00f0ff'}
                    />
                )
            })}
        </>
    )
}

