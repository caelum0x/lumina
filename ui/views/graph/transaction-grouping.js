import {useMemo} from 'react'
import * as THREE from 'three'

/**
 * Transaction grouping by account
 * Groups related transactions together in 3D space
 */
export function useTransactionGrouping(transactions) {
    return useMemo(() => {
        // Group transactions by source account
        const accountGroups = new Map()

        transactions.forEach(tx => {
            const account = tx.source || 'unknown'
            if (!accountGroups.has(account)) {
                accountGroups.set(account, {
                    account,
                    transactions: [],
                    center: null,
                    totalAmount: 0
                })
            }

            const group = accountGroups.get(account)
            group.transactions.push(tx)
            group.totalAmount += tx.amount || 0
        })

        // Calculate group centers
        accountGroups.forEach((group, account) => {
            if (group.transactions.length === 0) return

            const center = new THREE.Vector3(0, 0, 0)
            group.transactions.forEach(tx => {
                const pos = new THREE.Vector3(...tx.position)
                center.add(pos)
            })
            center.divideScalar(group.transactions.length)
            group.center = center
        })

        return accountGroups
    }, [transactions])
}

/**
 * Position transactions near their group center
 */
export function useGroupedPositions(transactions, groupingEnabled = false) {
    const groups = useTransactionGrouping(transactions)

    return useMemo(() => {
        if (!groupingEnabled) return transactions

        return transactions.map(tx => {
            const account = tx.source || 'unknown'
            const group = groups.get(account)

            if (group && group.transactions.length > 1 && group.center) {
                // Position near group center with some spread
                const spread = 10
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread,
                    (Math.random() - 0.5) * spread
                )
                const newPos = new THREE.Vector3().addVectors(group.center, offset)
                return {
                    ...tx,
                    position: [newPos.x, newPos.y, newPos.z],
                    groupId: account
                }
            }

            return tx
        })
    }, [transactions, groups, groupingEnabled])
}

/**
 * Group visualization component - shows account clusters
 */
export function AccountGroupVisualization({groups, visible = false}) {
    if (!visible || !groups) return null

    return (
        <>
            {Array.from(groups.values()).map((group, i) => {
                if (group.transactions.length < 2 || !group.center) return null

                return (
                    <mesh
                        key={i}
                        position={[group.center.x, group.center.y, group.center.z]}
                    >
                        <sphereGeometry args={[5, 16, 16]} />
                        <meshBasicMaterial
                            color="#00ff00"
                            transparent
                            opacity={0.1}
                            wireframe
                        />
                    </mesh>
                )
            })}
        </>
    )
}

