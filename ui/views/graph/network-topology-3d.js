import React, {useMemo, useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import {Line} from '@react-three/drei/core/Line'
import * as THREE from 'three'
import {useStore} from './store'

/**
 * 3D Network Topology Visualization
 * Shows the network structure with accounts as nodes and transactions as edges
 */
export function NetworkTopology3D() {
    const getFilteredTransactions = useStore(state => state.getFilteredTransactions)
    const filteredTransactions = getFilteredTransactions()
    const meshRef = useRef()

    // Build network graph from transactions
    const networkGraph = useMemo(() => {
        const nodes = new Map()
        const edges = []

        filteredTransactions.forEach(tx => {
            const source = tx.source_account || tx.source
            if (!nodes.has(source)) {
                nodes.set(source, {
                    id: source,
                    position: tx.position || [0, 0, 0],
                    transactionCount: 0,
                    totalAmount: 0
                })
            }
            const sourceNode = nodes.get(source)
            sourceNode.transactionCount++
            sourceNode.totalAmount += parseFloat(tx.amount || 0)

            // Add destination nodes from operations
            if (tx.operations) {
                tx.operations.forEach(op => {
                    const dest = op.destination || op.to || op.account
                    if (dest && dest !== source) {
                        if (!nodes.has(dest)) {
                            nodes.set(dest, {
                                id: dest,
                                position: [
                                    (Math.random() - 0.5) * 100,
                                    (Math.random() - 0.5) * 100,
                                    (Math.random() - 0.5) * 100
                                ],
                                transactionCount: 0,
                                totalAmount: 0
                            })
                        }

                        edges.push({
                            from: source,
                            to: dest,
                            amount: parseFloat(op.amount || tx.amount || 0),
                            type: op.type || tx.type
                        })
                    }
                })
            }
        })

        return {
            nodes: Array.from(nodes.values()),
            edges
        }
    }, [filteredTransactions])

    // Animate network
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001
        }
    })

    const maxAmount = useMemo(() => {
        return Math.max(...networkGraph.edges.map(e => e.amount), 1)
    }, [networkGraph.edges])

    return (
        <group ref={meshRef}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Render nodes */}
            {networkGraph.nodes.map(node => {
                const size = Math.max(0.5, Math.log10(node.transactionCount + 1))
                return (
                    <mesh key={node.id} position={node.position}>
                        <sphereGeometry args={[size, 16, 16]} />
                        <meshStandardMaterial
                            color="#00f0ff"
                            emissive="#00f0ff"
                            emissiveIntensity={0.5}
                            roughness={0.2}
                            metalness={0.8}
                        />
                    </mesh>
                )
            })}

            {/* Render edges */}
            {networkGraph.edges.map((edge, index) => {
                const fromNode = networkGraph.nodes.find(n => n.id === edge.from)
                const toNode = networkGraph.nodes.find(n => n.id === edge.to)
                
                if (!fromNode || !toNode) return null

                const points = [
                    new THREE.Vector3(...fromNode.position),
                    new THREE.Vector3(...toNode.position)
                ]

                const width = Math.max(0.1, (edge.amount / maxAmount) * 2)

                return (
                    <Line
                        key={index}
                        points={points}
                        color="rgba(0, 240, 255, 0.3)"
                        lineWidth={width}
                    />
                )
            })}

        </group>
    )
}

