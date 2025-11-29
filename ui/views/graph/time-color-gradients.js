import {useMemo} from 'react'
import * as THREE from 'three'

/**
 * Time-based color gradients for transactions
 * Transactions fade over time based on age
 */
export function useTimeBasedColors(transactions, maxAge = 600000) { // 10 minutes default
    return useMemo(() => {
        const now = Date.now()

        return transactions.map(tx => {
            const txTime = tx.created_at ? new Date(tx.created_at).getTime() : now
            const age = now - txTime
            const ageRatio = Math.min(age / maxAge, 1) // 0 = new, 1 = old

            // Base colors
            let baseColor
            if (tx.isWhale) {
                baseColor = new THREE.Color('#ff0080')
            } else if (tx.highFee) {
                baseColor = new THREE.Color('#ff4400')
            } else if (tx.isSoroban) {
                baseColor = new THREE.Color('#00ffff')
            } else {
                baseColor = new THREE.Color('#6B46C1')
            }

            // Fade to dark gray as transaction ages
            const fadeColor = new THREE.Color('#333333')
            const finalColor = new THREE.Color().lerpColors(baseColor, fadeColor, ageRatio)

            // Reduce opacity for older transactions
            const opacity = Math.max(0.3, 1 - ageRatio * 0.7)

            return {
                ...tx,
                color: `#${finalColor.getHexString()}`,
                opacity
            }
        })
    }, [transactions, maxAge])
}

/**
 * Get color for transaction based on age
 */
export function getAgeBasedColor(tx, maxAge = 600000) {
    const now = Date.now()
    const txTime = tx.created_at ? new Date(tx.created_at).getTime() : now
    const age = now - txTime
    const ageRatio = Math.min(age / maxAge, 1)

    let baseColor
    if (tx.isWhale) {
        baseColor = new THREE.Color('#ff0080')
    } else if (tx.highFee) {
        baseColor = new THREE.Color('#ff4400')
    } else if (tx.isSoroban) {
        baseColor = new THREE.Color('#00ffff')
    } else {
        baseColor = new THREE.Color('#6B46C1')
    }

    const fadeColor = new THREE.Color('#333333')
    const finalColor = new THREE.Color().lerpColors(baseColor, fadeColor, ageRatio)

    return {
        color: `#${finalColor.getHexString()}`,
        opacity: Math.max(0.3, 1 - ageRatio * 0.7)
    }
}

