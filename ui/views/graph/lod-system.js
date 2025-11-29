import React, {useMemo} from 'react'
import {useThree} from '@react-three/fiber'
import * as THREE from 'three'

/**
 * LOD (Level of Detail) system for transaction nodes
 * Reduces detail for distant nodes to improve performance
 */
export function useLODSystem(transactions, camera) {
    const {camera: threeCamera} = useThree()
    const cam = camera || threeCamera

    return useMemo(() => {
        const lodGroups = {
            high: [], // Close - full detail
            medium: [], // Medium distance - reduced detail
            low: [] // Far - minimal detail
        }

        if (!cam) return lodGroups

        transactions.forEach(tx => {
            const position = new THREE.Vector3(...tx.position)
            const distance = cam.position.distanceTo(position)

            if (distance < 30) {
                lodGroups.high.push(tx)
            } else if (distance < 100) {
                lodGroups.medium.push(tx)
            } else {
                lodGroups.low.push(tx)
            }
        })

        return lodGroups
    }, [transactions, cam])
}

/**
 * LOD Transaction Node - renders with different detail levels
 */
export function LODTransactionNode({tx, lod, onSelect}) {
    const geometry = useMemo(() => {
        switch (lod) {
            case 'high':
                return new THREE.SphereGeometry(1, 32, 32) // Full detail
            case 'medium':
                return new THREE.SphereGeometry(1, 16, 16) // Reduced detail
            case 'low':
                return new THREE.SphereGeometry(1, 8, 8) // Minimal detail
            default:
                return new THREE.SphereGeometry(1, 16, 16)
        }
    }, [lod])

    // Material can also be simplified for low LOD
    const material = useMemo(() => {
        const color = tx.isWhale ? '#ff0080' : 
                     tx.highFee ? '#ff4400' : 
                     tx.isSoroban ? '#00ffff' : '#6B46C1'
        
        const emissiveIntensity = lod === 'low' ? 0.3 : 
                                 tx.isWhale ? 2 : 
                                 tx.isSoroban ? 1.5 : 0.6

        return new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity,
            roughness: 0.2,
            metalness: 0.8
        })
    }, [tx, lod])

    return (
        <mesh
            position={tx.position}
            geometry={geometry}
            material={material}
            onClick={(e) => {
                e.stopPropagation()
                if (onSelect) onSelect(tx)
            }}
        />
    )
}

