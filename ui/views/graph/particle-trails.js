import React, {useRef, useMemo, useState} from 'react'
import {useFrame} from '@react-three/fiber'
import {Trail} from '@react-three/drei/core/Trail'
import * as THREE from 'three'

/**
 * Particle Trail System for Transaction Flows
 * Creates animated trails showing transaction paths
 */
export function ParticleTrail({tx, targetPosition, color, duration = 2000}) {
    const meshRef = useRef()
    const startTime = useRef(Date.now())
    const [isActive, setIsActive] = useState(true)

    useFrame(() => {
        if (!meshRef.current || !isActive) return

        const elapsed = Date.now() - startTime.current
        const progress = Math.min(elapsed / duration, 1)

        if (progress >= 1) {
            // Trail complete, fade out
            setIsActive(false)
            return
        }

        // Interpolate position
        const start = new THREE.Vector3(...tx.position)
        const end = new THREE.Vector3(...targetPosition)
        const current = start.clone().lerp(end, progress)
        
        meshRef.current.position.copy(current)
    })

    if (!isActive) return null

    return (
        <Trail
            width={3}
            length={20}
            color={color}
            attenuation={(t) => t * t}
        >
            <mesh ref={meshRef} position={tx.position}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </Trail>
    )
}

/**
 * Particle Trail Manager
 * Manages multiple particle trails for transaction flows
 */
export function ParticleTrailSystem({transactions, connections}) {
    const activeTrails = useMemo(() => {
        if (!connections || !Array.isArray(connections) || connections.length === 0) {
            return []
        }
        if (!transactions || !Array.isArray(transactions)) {
            return []
        }

        const trails = []
        const maxTrails = 50 // Limit trails for performance
        
        // Only process recent connections
        const recentConnections = connections.slice(-maxTrails)
        
        recentConnections.forEach((conn, index) => {
            if (!conn || !conn.from || !conn.to) return
            
            try {
                const tx = transactions.find(t => 
                    t && t.position && 
                    Math.abs(t.position[0] - conn.from[0]) < 0.1 && 
                    Math.abs(t.position[1] - conn.from[1]) < 0.1 && 
                    Math.abs(t.position[2] - conn.from[2]) < 0.1
                )
                
                if (tx) {
                    trails.push({
                        id: `trail-${index}`,
                        tx,
                        targetPosition: conn.to,
                        color: tx.isWhale ? '#ff0080' : tx.isSoroban ? '#00ffff' : '#6B46C1',
                        duration: 2000
                    })
                }
            } catch (e) {
                console.warn('Error processing connection for trail:', e, conn)
            }
        })

        return trails
    }, [transactions, connections])

    return (
        <>
            {activeTrails.map(trail => (
                <ParticleTrail
                    key={trail.id}
                    tx={trail.tx}
                    targetPosition={trail.targetPosition}
                    color={trail.color}
                    duration={trail.duration}
                />
            ))}
        </>
    )
}

