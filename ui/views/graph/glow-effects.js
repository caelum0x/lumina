import React, {useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Glow Effect for High-Value Transactions
 * Creates a pulsing glow around important transactions
 */
export function GlowEffect({tx, intensity = 1}) {
    const glowRef = useRef()
    const innerRef = useRef()

    useFrame((state) => {
        if (!glowRef.current || !innerRef.current) return

        // Pulsing effect
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7
        const scale = 1 + (pulse * 0.5 * intensity)
        
        glowRef.current.scale.setScalar(scale)
        innerRef.current.material.opacity = pulse * 0.5
    })

    const color = tx.isWhale ? '#ff0080' : tx.highFee ? '#ff4400' : '#00f0ff'

    return (
        <group position={tx.position}>
            {/* Outer glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.2}
                    side={THREE.BackSide}
                />
            </mesh>
            
            {/* Inner glow */}
            <mesh ref={innerRef}>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    )
}

/**
 * Glow Effect Manager
 * Applies glow effects to high-value transactions
 */
export function GlowEffectSystem({transactions}) {
    const highValueTxs = React.useMemo(() => {
        if (!transactions || !Array.isArray(transactions)) return []
        
        // Limit to top 100 high-value transactions for performance
        return transactions
            .filter(tx => tx && (tx.isWhale || tx.highFee || (parseFloat(tx.amount || 0) > 10000)))
            .sort((a, b) => (parseFloat(b.amount || 0)) - (parseFloat(a.amount || 0)))
            .slice(0, 100)
    }, [transactions])

    return (
        <>
            {highValueTxs.map(tx => (
                <GlowEffect
                    key={tx.id || tx.hash || Math.random()}
                    tx={tx}
                    intensity={tx.isWhale ? 2 : tx.highFee ? 1.5 : 1}
                />
            ))}
        </>
    )
}

