import React, {useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Dark matter mode - stealth payments appear as black holes
 */
export function DarkMatterNode({tx, onSelect}) {
    const meshRef = React.useRef()
    const glowRef = React.useRef()

    // Black hole effect - dark sphere with glowing accretion disk
    useFrame((state) => {
        if (!meshRef.current || !glowRef.current) return

        // Rotate accretion disk
        glowRef.current.rotation.z += 0.01

        // Pulsing effect
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1
        meshRef.current.scale.setScalar(pulse)
    })

    return (
        <group position={tx.position}>
            {/* Accretion disk */}
            <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 3, 32]} />
                <meshBasicMaterial
                    color="#0000ff"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Black hole center */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation()
                    if (onSelect) onSelect(tx)
                }}
            >
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial
                    color="#000000"
                    emissive="#000011"
                    emissiveIntensity={0.5}
                    roughness={0.1}
                    metalness={1}
                />
            </mesh>

            {/* Event horizon glow */}
            <mesh>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshBasicMaterial
                    color="#000033"
                    transparent
                    opacity={0.2}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    )
}

/**
 * Filter transactions for dark matter mode (stealth payments)
 * Uses heuristic-based algorithm to detect potential stealth payments
 */
export function useDarkMatterFilter(transactions, sensitivity = 0.5) {
    return useMemo(() => {
        return transactions.map(tx => {
            let confidence = 0
            const reasons = []

            // Heuristic 1: Small amounts with hash memos
            if (tx.amount && tx.amount < 1 && tx.memo_type === 'hash') {
                confidence += 0.3
                reasons.push('Small amount with hash memo')
            }

            // Heuristic 2: Single-operation transactions
            if (tx.operations && tx.operations.length === 1) {
                confidence += 0.2
                reasons.push('Single operation')
            }

            // Heuristic 3: Transactions with no clear payment destination
            const hasPaymentOp = tx.operations?.some(op => 
                op.type === 'payment' || op.type === 'pathPaymentStrictSend' || op.type === 'pathPaymentStrictReceive'
            )
            if (!hasPaymentOp && tx.operations?.length > 0) {
                confidence += 0.15
                reasons.push('No clear payment destination')
            }

            // Heuristic 4: New/unknown accounts (first transaction)
            // This would require account history - simplified check
            if (tx.source_account && !tx.source_account_known) {
                confidence += 0.1
                reasons.push('New account')
            }

            // Heuristic 5: Path payments (often used for privacy)
            if (tx.operations?.some(op => 
                op.type === 'pathPaymentStrictSend' || op.type === 'pathPaymentStrictReceive'
            )) {
                confidence += 0.15
                reasons.push('Path payment')
            }

            // Heuristic 6: Time-based patterns (rapid small transactions)
            // This would require transaction history analysis
            if (tx.amount && tx.amount < 0.1 && tx.fee_charged && tx.fee_charged < 100) {
                confidence += 0.1
                reasons.push('Very small amount with low fee')
            }

            // Heuristic 7: Account relationship anomalies
            // Transactions between accounts with no prior relationship
            if (tx.is_first_interaction) {
                confidence += 0.1
                reasons.push('First interaction between accounts')
            }

            return {
                ...tx,
                isStealth: confidence >= sensitivity,
                stealthConfidence: confidence,
                stealthReasons: reasons
            }
        }).filter(tx => tx.isStealth)
    }, [transactions, sensitivity])
}

/**
 * Dark matter mode toggle
 */
export function DarkMatterMode({enabled, transactions, onTxSelect}) {
    const darkMatterTxs = useDarkMatterFilter(transactions)

    if (!enabled || darkMatterTxs.length === 0) return null

    return (
        <>
            {darkMatterTxs.map(tx => (
                <DarkMatterNode
                    key={tx.id || tx.hash}
                    tx={tx}
                    onSelect={onTxSelect}
                />
            ))}
        </>
    )
}

