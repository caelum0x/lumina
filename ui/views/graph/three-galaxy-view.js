import React, {useRef, useMemo, useCallback, useEffect} from 'react'
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei/core/OrbitControls'
import {Stars} from '@react-three/drei/core/Stars'
import {Float} from '@react-three/drei/core/Float'
import {Trail} from '@react-three/drei/core/Trail'
import * as THREE from 'three'
import {useStore} from './store'
import {useStellarStream} from './use-stellar-stream'
import {useCameraControls} from './camera-controls'
import {useForceLayout, useAccountClustering} from './force-layout'
import {useTimeBasedColors} from './time-color-gradients'
import {useZoomToTransaction} from './zoom-to-fit'
import {ParticleSystem} from './particle-system'
import {Minimap} from './minimap'
import {ParticleTrailSystem} from './particle-trails'
import {GlowEffectSystem} from './glow-effects'
import {AnimatedConnections} from './animated-connections'
import {NetworkTopology3D} from './network-topology-3d'
import ThreeGalaxyErrorBoundary from './error-boundary'
import appSettings from '../../app-settings'
import './three-galaxy.scss'

/**
 * Single transaction node component
 */
function TransactionNode({tx, onSelect}) {
    const ref = useRef()
    const {camera} = useThree()

    const scale = useMemo(() => {
        const amount = tx.amount || 0
        // Logarithmic scaling: larger transactions = larger spheres
        return Math.max(0.3, Math.log10(amount + 1) * 0.5)
    }, [tx.amount])

    const color = useMemo(() => {
        // Use time-based color if available, otherwise use type-based
        if (tx.color) return tx.color
        if (tx.isWhale) return '#ff0080' // Pink for whales
        if (tx.highFee) return '#ff4400' // Orange for high fees
        if (tx.isSoroban) return '#00ffff' // Cyan for Soroban contracts
        return '#6B46C1' // Purple for regular transactions
    }, [tx.color, tx.isWhale, tx.highFee, tx.isSoroban])

    const opacity = tx.opacity !== undefined ? tx.opacity : 1

    const emissiveIntensity = useMemo(() => {
        return tx.isWhale ? 2 : tx.isSoroban ? 1.5 : 0.6
    }, [tx.isWhale, tx.isSoroban])

    // Animate Soroban contracts with pulsing effect
    useFrame((state) => {
        if (!ref.current) return

        if (tx.isSoroban) {
            const pulse = Math.sin(state.clock.elapsedTime * 8) * 0.3
            ref.current.scale.setScalar(scale + pulse)
        }

        // Subtle floating animation
        const floatOffset = Math.sin(state.clock.elapsedTime * 2 + (tx.id?.charCodeAt?.(0) || 0)) * 0.0005
        ref.current.position.y += floatOffset
    })

    const handleClick = useCallback((e) => {
        e.stopPropagation()
        if (onSelect) {
            onSelect(tx)
            // Smoothly move camera closer to selected transaction
            const targetPosition = new THREE.Vector3(...tx.position).multiplyScalar(3)
            camera.position.lerp(targetPosition, 0.1)
        }
    }, [tx, onSelect, camera])

    return (
        <Trail
            width={5}
            length={10}
            color={color}
            attenuation={(t) => t * t}
        >
            <Float
                speed={tx.isWhale ? 2 : 4}
                rotationIntensity={0.5}
                floatIntensity={0.5}
            >
                <mesh
                    ref={ref}
                    position={tx.position}
                    onClick={handleClick}
                >
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={emissiveIntensity}
                        roughness={0.2}
                        metalness={0.8}
                        transparent={opacity < 1}
                        opacity={opacity}
                    />
                </mesh>
            </Float>
        </Trail>
    )
}

/**
 * Connection beam between accounts
 */
function ConnectionBeam({from, to, amount}) {
    const points = useMemo(() => {
        return [from, to].map(p => new THREE.Vector3(...p))
    }, [from, to])

    const lineGeometry = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3(points)
        return new THREE.BufferGeometry().setFromPoints(curve.getPoints(50))
    }, [points])

    const opacity = useMemo(() => {
        // Larger amounts = more visible beams
        return Math.min(0.6, Math.log10((amount || 0) + 1) * 0.1)
    }, [amount])

    return (
        <line>
            <bufferGeometry attach="geometry" {...lineGeometry} />
            <lineBasicMaterial
                color="#3366ff"
                transparent
                opacity={opacity}
                linewidth={2}
            />
        </line>
    )
}

/**
 * Main 3D scene
 */
function GalaxyScene({onTxSelect}) {
    const getFilteredTransactions = useStore(state => state.getFilteredTransactions)
    const viewMode = useStore(state => state.viewMode)
    const rawTransactions = getFilteredTransactions() || []
    const connections = useStore(state => state.connections) || []
    
    // Disable force layout temporarily to fix dependency error
    const transactions = rawTransactions
    
    // Initialize camera controls
    useCameraControls()
    
    // Zoom to fit functionality
    const zoomToTransaction = useZoomToTransaction()

    // Render Network Topology view if selected
    if (viewMode === 'topology') {
        return (
            <>
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <pointLight position={[-10, -10, -10]} intensity={1} />
                <NetworkTopology3D />
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={20}
                    maxDistance={300}
                />
            </>
        )
    }

    // Default Galaxy view
    return (
        <>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={2} />
            <pointLight position={[-10, -10, -10]} intensity={1} />
            <Stars
                radius={300}
                depth={50}
                count={5000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* Particle system for visual effects */}
            <ParticleSystem transactions={transactions} />
            
            {/* Glow effects for high-value transactions (only if not too many) */}
            {transactions.length < 500 && (
                <GlowEffectSystem transactions={transactions} />
            )}
            
            {/* Particle trails for transaction flows (only if not too many) */}
            {connections.length < 200 && (
                <ParticleTrailSystem transactions={transactions} connections={connections} />
            )}

            {transactions.map(tx => (
                <TransactionNode
                    key={tx.id || tx.hash}
                    tx={tx}
                    onSelect={(selectedTx) => {
                        onTxSelect(selectedTx)
                        zoomToTransaction(selectedTx)
                    }}
                />
            ))}

            {/* Minimap */}
            <Minimap transactions={transactions} />

            {/* Animated connections */}
            <AnimatedConnections connections={connections} />
            
            {/* Static connections (fallback) */}
            {connections.map((conn, i) => (
                <ConnectionBeam
                    key={i}
                    from={conn.from}
                    to={conn.to}
                    amount={conn.amount}
                />
            ))}

            {/* EffectComposer and Bloom removed - require React 18+ and @react-three/postprocessing */}

            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={500}
                autoRotate={false}
                autoRotateSpeed={0}
            />
        </>
    )
}

/**
 * Main 3D Galaxy View Component
 */
export default function ThreeGalaxyView({onTransactionSelect}) {
    const network = appSettings.activeNetwork || 'public'
    const setSelected = useStore(state => state.setSelected)
    const setConnectionStatus = useStore(state => state.setConnectionStatus)

    // Start SSE stream
    const {isConnected} = useStellarStream(network, {
        limit: 200,
        includeEffects: false
    })

    // Update connection status
    React.useEffect(() => {
        if (isConnected) {
            setConnectionStatus('connected')
        } else {
            setConnectionStatus('connecting')
        }
    }, [isConnected, setConnectionStatus])

    const handleTransactionSelect = useCallback((tx) => {
        setSelected(tx)
        if (onTransactionSelect) {
            onTransactionSelect(tx)
        }
    }, [setSelected, onTransactionSelect])

    return (
        <ThreeGalaxyErrorBoundary>
            <div className="three-galaxy-container">
                <Canvas
                    camera={{position: [0, 0, 120], fov: 60}}
                    gl={{antialias: true, alpha: false}}
                >
                    <GalaxyScene onTxSelect={handleTransactionSelect} />
                </Canvas>
            </div>
        </ThreeGalaxyErrorBoundary>
    )
}

