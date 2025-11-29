import {useMemo, useRef, useEffect} from 'react'
import * as THREE from 'three'

/**
 * Force-directed graph layout for better 3D node positioning
 * Uses a simple physics simulation to position nodes
 */
export function useForceLayout(transactions, connections, options = {}) {
    const {
        iterations = 50,
        strength = 0.1,
        repulsion = 100,
        attraction = 0.01,
        damping = 0.8
    } = options

    const positionsRef = useRef(new Map())
    const velocitiesRef = useRef(new Map())

    // Initialize positions and velocities
    useEffect(() => {
        if (!transactions || !Array.isArray(transactions)) return
        
        transactions.forEach(tx => {
            if (!positionsRef.current.has(tx.id)) {
                // Use existing position or random
                const pos = tx.position || [
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100
                ]
                positionsRef.current.set(tx.id, new THREE.Vector3(...pos))
                velocitiesRef.current.set(tx.id, new THREE.Vector3(0, 0, 0))
            }
        })
    }, [transactions])

    // Run force-directed layout simulation
    const layoutedPositions = useMemo(() => {
        if (transactions.length === 0) return new Map()

        const positions = new Map(positionsRef.current)
        const velocities = new Map(velocitiesRef.current)

        // Run simulation iterations
        for (let iter = 0; iter < iterations; iter++) {
            // Calculate repulsion forces (all nodes repel each other)
            transactions.forEach(tx1 => {
                const pos1 = positions.get(tx1.id)
                const vel1 = velocities.get(tx1.id)
                if (!pos1 || !vel1) return

                let force = new THREE.Vector3(0, 0, 0)

                transactions.forEach(tx2 => {
                    if (tx1.id === tx2.id) return
                    const pos2 = positions.get(tx2.id)
                    if (!pos2) return

                    const diff = new THREE.Vector3().subVectors(pos1, pos2)
                    const distance = Math.max(diff.length(), 0.1)
                    const repulsionForce = repulsion / (distance * distance)
                    diff.normalize().multiplyScalar(repulsionForce)
                    force.add(diff)
                })

                // Calculate attraction forces (connected nodes attract)
                connections.forEach(conn => {
                    const fromId = conn.fromId || transactions.find(tx => 
                        tx.position[0] === conn.from[0] && 
                        tx.position[1] === conn.from[1] && 
                        tx.position[2] === conn.from[2]
                    )?.id
                    const toId = conn.toId || transactions.find(tx => 
                        tx.position[0] === conn.to[0] && 
                        tx.position[1] === conn.to[1] && 
                        tx.position[2] === conn.to[2]
                    )?.id

                    if (fromId === tx1.id && toId) {
                        const pos2 = positions.get(toId)
                        if (pos2) {
                            const diff = new THREE.Vector3().subVectors(pos2, pos1)
                            const distance = Math.max(diff.length(), 0.1)
                            diff.normalize().multiplyScalar(attraction * distance)
                            force.add(diff)
                        }
                    }
                })

                // Update velocity
                force.multiplyScalar(strength)
                vel1.add(force)
                vel1.multiplyScalar(damping)

                // Update position
                pos1.add(vel1)

                // Apply boundary constraints (keep nodes in reasonable bounds)
                const maxBound = 150
                pos1.x = Math.max(-maxBound, Math.min(maxBound, pos1.x))
                pos1.y = Math.max(-maxBound, Math.min(maxBound, pos1.y))
                pos1.z = Math.max(-maxBound, Math.min(maxBound, pos1.z))
            })
        }

        return positions
    }, [transactions, connections, iterations, strength, repulsion, attraction, damping])

    // Update transaction positions
    const updatedTransactions = useMemo(() => {
        return transactions.map(tx => {
            const newPos = layoutedPositions.get(tx.id)
            if (newPos) {
                return {
                    ...tx,
                    position: [newPos.x, newPos.y, newPos.z]
                }
            }
            return tx
        })
    }, [transactions, layoutedPositions])

    return updatedTransactions
}

/**
 * Hook for account clustering in 3D space
 */
export function useAccountClustering(transactions) {
    return useMemo(() => {
        const clusters = new Map()
        
        // Group transactions by source account
        transactions.forEach(tx => {
            const account = tx.source || 'unknown'
            if (!clusters.has(account)) {
                clusters.set(account, [])
            }
            clusters.get(account).push(tx)
        })

        // Calculate cluster centers
        const clusterCenters = new Map()
        clusters.forEach((txs, account) => {
            if (txs.length === 0) return

            const center = new THREE.Vector3(0, 0, 0)
            txs.forEach(tx => {
                const pos = new THREE.Vector3(...tx.position)
                center.add(pos)
            })
            center.divideScalar(txs.length)
            clusterCenters.set(account, center)
        })

        // Position transactions near their cluster center
        return transactions.map(tx => {
            const account = tx.source || 'unknown'
            const center = clusterCenters.get(account)
            if (center && clusters.get(account)?.length > 1) {
                const currentPos = new THREE.Vector3(...tx.position)
                const offset = new THREE.Vector3().subVectors(currentPos, center)
                offset.multiplyScalar(0.3) // Pull towards center
                const newPos = new THREE.Vector3().addVectors(center, offset)
                return {
                    ...tx,
                    position: [newPos.x, newPos.y, newPos.z]
                }
            }
            return tx
        })
    }, [transactions])
}

