import React, {useMemo, useCallback} from 'react'
import {OrbitControls} from '@react-three/drei/core/OrbitControls'
import {Line} from '@react-three/drei/core/Line'
import * as THREE from 'three'

/**
 * 3D Account Relationship Graph Node
 */
function AccountNode3D({node, accountAddress, highlighted, onSelect, position}) {
    const meshRef = React.useRef()
    const isMainAccount = node.id === accountAddress

    const color = useMemo(() => {
        if (isMainAccount) return '#00f0ff'
        if (highlighted) return '#ff0080'
        return '#6B46C1'
    }, [isMainAccount, highlighted])

    return (
        <mesh
            ref={meshRef}
            position={position}
            onClick={(e) => {
                e.stopPropagation()
                onSelect?.(node)
            }}
        >
            <sphereGeometry args={[isMainAccount ? 2 : 1, 32, 32]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isMainAccount ? 1.5 : 0.6}
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
    )
}

/**
 * 3D Connection Line
 */
function ConnectionLine3D({from, to, value, maxValue}) {
    const points = useMemo(() => {
        const start = new THREE.Vector3(...from)
        const end = new THREE.Vector3(...to)
        return [start, end]
    }, [from, to])

    const width = useMemo(() => {
        return Math.max(0.1, (value / maxValue) * 2)
    }, [value, maxValue])

    return (
        <Line
            points={points}
            color="rgba(0, 240, 255, 0.3)"
            lineWidth={width}
        />
    )
}

/**
 * 3D Account Relationship Graph Component
 */
export function AccountRelationshipGraph3D({graphData, accountAddress, onNodeSelect}) {
    const [selectedNode, setSelectedNode] = React.useState(null)
    const [highlightedNode, setHighlightedNode] = React.useState(null)

    // Calculate 3D positions using force-directed layout
    const nodePositions = useMemo(() => {
        if (!graphData || !graphData.nodes) return new Map()

        const positions = new Map()
        const center = [0, 0, 0]
        const radius = 50

        // Simple circular layout for now (can be enhanced with force-directed 3D layout)
        graphData.nodes.forEach((node, index) => {
            const angle = (index / graphData.nodes.length) * Math.PI * 2
            const elevation = (index % 3) * 10 - 10
            positions.set(node.id, [
                center[0] + Math.cos(angle) * radius,
                center[1] + elevation,
                center[2] + Math.sin(angle) * radius
            ])
        })

        return positions
    }, [graphData])

    const maxTransactions = useMemo(() => {
        if (!graphData?.links) return 1
        return Math.max(...graphData.links.map(l => l.value), 1)
    }, [graphData])

    const handleNodeSelect = useCallback((node) => {
        setSelectedNode(node)
        onNodeSelect?.(node)
    }, [onNodeSelect])

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        return null
    }

    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <pointLight position={[-10, -10, -10]} intensity={1} />

            {graphData.nodes.map(node => {
                const position = nodePositions.get(node.id)
                if (!position) return null

                const highlighted = highlightedNode && (
                    highlightedNode.id === node.id ||
                    graphData.links.some(l =>
                        (l.source === node.id && l.target === highlightedNode.id) ||
                        (l.target === node.id && l.source === highlightedNode.id)
                    )
                )

                return (
                    <AccountNode3D
                        key={node.id}
                        node={node}
                        accountAddress={accountAddress}
                        highlighted={highlighted}
                        position={position}
                        onSelect={handleNodeSelect}
                    />
                )
            })}

            {graphData.links.map((link, index) => {
                const fromPos = nodePositions.get(link.source)
                const toPos = nodePositions.get(link.target)
                if (!fromPos || !toPos) return null

                return (
                    <ConnectionLine3D
                        key={index}
                        from={fromPos}
                        to={toPos}
                        value={link.value}
                        maxValue={maxTransactions}
                    />
                )
            })}

            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={20}
                maxDistance={200}
            />
        </>
    )
}

