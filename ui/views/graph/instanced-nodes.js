import React, {useRef, useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Instanced transaction nodes for better performance
 * Renders many nodes efficiently using instanced meshes
 */
export function InstancedTransactionNodes({transactions, onSelect}) {
    const meshRef = useRef()
    const instancedMeshRef = useRef()
    const {camera} = useThree()

    // Create instanced mesh
    const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), [])
    
    // Create materials for different transaction types
    const materials = useMemo(() => ({
        regular: new THREE.MeshStandardMaterial({
            color: '#6B46C1',
            emissive: '#6B46C1',
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.8
        }),
        whale: new THREE.MeshStandardMaterial({
            color: '#ff0080',
            emissive: '#ff0080',
            emissiveIntensity: 2,
            roughness: 0.2,
            metalness: 0.8
        }),
        highFee: new THREE.MeshStandardMaterial({
            color: '#ff4400',
            emissive: '#ff4400',
            emissiveIntensity: 0.8,
            roughness: 0.2,
            metalness: 0.8
        }),
        soroban: new THREE.MeshStandardMaterial({
            color: '#00ffff',
            emissive: '#00ffff',
            emissiveIntensity: 1.5,
            roughness: 0.2,
            metalness: 0.8
        })
    }), [])

    // Update instance matrices
    useFrame((state) => {
        if (!instancedMeshRef.current || !meshRef.current) return

        const matrix = new THREE.Matrix4()
        transactions.forEach((tx, i) => {
            const scale = Math.max(0.3, Math.log10((tx.amount || 0) + 1) * 0.5)
            
            // Apply pulsing for Soroban
            let finalScale = scale
            if (tx.isSoroban) {
                finalScale += Math.sin(state.clock.elapsedTime * 8) * 0.3
            }

            matrix.makeScale(finalScale, finalScale, finalScale)
            matrix.setPosition(...tx.position)
            instancedMeshRef.current.setMatrixAt(i, matrix)
        })
        instancedMeshRef.current.instanceMatrix.needsUpdate = true
    })

    // Group transactions by type for material switching
    const grouped = useMemo(() => {
        const groups = {regular: [], whale: [], highFee: [], soroban: []}
        transactions.forEach((tx, i) => {
            if (tx.isSoroban) groups.soroban.push({tx, index: i})
            else if (tx.isWhale) groups.whale.push({tx, index: i})
            else if (tx.highFee) groups.highFee.push({tx, index: i})
            else groups.regular.push({tx, index: i})
        })
        return groups
    }, [transactions])

    // For now, render all as regular (can be optimized further)
    // Full instancing with material switching requires more complex setup
    return (
        <instancedMesh
            ref={instancedMeshRef.current}
            args={[geometry, materials.regular, transactions.length]}
            frustumCulled={true}
        />
    )
}

