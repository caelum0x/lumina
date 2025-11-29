import React, {useRef, useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Particle system for transaction trails and effects
 */
export function ParticleSystem({transactions}) {
    const particlesRef = useRef()
    const particleCount = Math.min(transactions.length * 10, 10000) // Max 10k particles

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount * 3)
        const colors = new Float32Array(particleCount * 3)
        const lifetimes = new Float32Array(particleCount)

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 200
            positions[i3 + 1] = (Math.random() - 0.5) * 200
            positions[i3 + 2] = (Math.random() - 0.5) * 200

            // Random velocities
            velocities[i3] = (Math.random() - 0.5) * 0.02
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02

            // Colors based on transaction types
            const tx = transactions[Math.floor(Math.random() * transactions.length)]
            if (tx) {
                if (tx.isWhale) {
                    colors[i3] = 1.0 // R
                    colors[i3 + 1] = 0.0 // G
                    colors[i3 + 2] = 0.5 // B
                } else if (tx.isSoroban) {
                    colors[i3] = 0.0
                    colors[i3 + 1] = 1.0
                    colors[i3 + 2] = 1.0
                } else {
                    colors[i3] = 0.27
                    colors[i3 + 1] = 0.53
                    colors[i3 + 2] = 1.0
                }
            }

            lifetimes[i] = Math.random()
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geo.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1))

        return geo
    }, [particleCount, transactions])

    const material = useMemo(() => {
        return new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        })
    }, [])

    useFrame((state) => {
        if (!particlesRef.current) return

        const positions = particlesRef.current.geometry.attributes.position
        const velocities = particlesRef.current.geometry.attributes.velocity
        const lifetimes = particlesRef.current.geometry.attributes.lifetime

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3

            // Update position
            positions.array[i3] += velocities.array[i3]
            positions.array[i3 + 1] += velocities.array[i3 + 1]
            positions.array[i3 + 2] += velocities.array[i3 + 2]

            // Update lifetime
            lifetimes.array[i] += 0.01
            if (lifetimes.array[i] > 1) {
                lifetimes.array[i] = 0
                // Reset position to random location
                positions.array[i3] = (Math.random() - 0.5) * 200
                positions.array[i3 + 1] = (Math.random() - 0.5) * 200
                positions.array[i3 + 2] = (Math.random() - 0.5) * 200
            }

            // Wrap around edges
            if (Math.abs(positions.array[i3]) > 100) positions.array[i3] *= -1
            if (Math.abs(positions.array[i3 + 1]) > 100) positions.array[i3 + 1] *= -1
            if (Math.abs(positions.array[i3 + 2]) > 100) positions.array[i3 + 2] *= -1
        }

        positions.needsUpdate = true
        lifetimes.needsUpdate = true
    })

    return (
        <points ref={particlesRef} geometry={geometry} material={material} />
    )
}

