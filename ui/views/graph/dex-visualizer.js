import React, {useRef, useEffect, useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {useStore} from './store'

const poolColorMap = {
    'XLM/USDC': '#6B46C1',
    'BTC/XLM': '#ff8800',
    'ETH/XLM': '#00ff88',
    'EURC/USDC': '#cccccc',
    'default': '#ff00ff'
}

function PlasmaBeam({from, to, color, width, duration, intensity}) {
    const meshRef = useRef()
    const startTime = useRef(Date.now())

    const geometry = useMemo(() => {
        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(...from),
            new THREE.Vector3(
                (from[0] + to[0]) / 2,
                (from[1] + to[1]) / 2 + 5,
                (from[2] + to[2]) / 2
            ),
            new THREE.Vector3(...to)
        )
        return new THREE.TubeGeometry(curve, 64, width, 16, false)
    }, [from, to, width])

    const uniforms = useMemo(() => ({
        time: {value: 0},
        intensity: {value: intensity},
        color: {value: new THREE.Color(color)}
    }), [color, intensity])

    useFrame((state) => {
        if (!meshRef.current) return
        const elapsed = Date.now() - startTime.current
        if (elapsed > duration) {
            meshRef.current.visible = false
            return
        }
        uniforms.time.value = state.clock.elapsedTime
        meshRef.current.material.opacity = 1 - (elapsed / duration)
    })

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `

    const fragmentShader = `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
            float flow = fract(vUv.x * 3.0 - time * 2.0);
            float pulse = sin(flow * 3.14159 * 2.0) * 0.5 + 0.5;
            vec3 finalColor = color * (pulse * intensity + 0.5);
            float alpha = pulse * 0.8;
            gl_FragColor = vec4(finalColor, alpha);
        }
    `

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}

function LightningBolt({from, to, color}) {
    const points = useMemo(() => {
        const pts = []
        const segments = 20
        for (let i = 0; i <= segments; i++) {
            const t = i / segments
            const x = from[0] + (to[0] - from[0]) * t + (Math.random() - 0.5) * 2
            const y = from[1] + (to[1] - from[1]) * t + (Math.random() - 0.5) * 2
            const z = from[2] + (to[2] - from[2]) * t + (Math.random() - 0.5) * 2
            pts.push(new THREE.Vector3(x, y, z))
        }
        return pts
    }, [from, to])

    const geometry = useMemo(() => 
        new THREE.BufferGeometry().setFromPoints(points),
        [points]
    )

    return (
        <line geometry={geometry}>
            <lineBasicMaterial color={color} linewidth={2} />
        </line>
    )
}

function RainbowShockwave({position, size}) {
    const meshRef = useRef()
    const startTime = useRef(Date.now())

    useFrame(() => {
        if (!meshRef.current) return
        const elapsed = Date.now() - startTime.current
        if (elapsed > 3000) {
            meshRef.current.visible = false
            return
        }
        const progress = elapsed / 3000
        const scale = 1 + progress * size
        meshRef.current.scale.set(scale, scale, scale)
        meshRef.current.material.opacity = 0.8 * (1 - progress)
    })

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.8}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}

function PoolStar({poolId, position, depth, volume24h, color}) {
    const meshRef = useRef()
    const diskRef = useRef()
    
    const size = Math.log10(depth + 1) * 0.5
    const diskSize = size * 2

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
        }
        if (diskRef.current) {
            diskRef.current.rotation.z = state.clock.elapsedTime * 0.3
        }
    })

    return (
        <group position={position}>
            {/* Core pool star */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshBasicMaterial color={color} />
            </mesh>
            
            {/* Accretion disk */}
            <mesh ref={diskRef} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size * 1.5, diskSize, 64]} />
                <meshBasicMaterial
                    color="#ffaa00"
                    transparent
                    opacity={0.6}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    )
}

export function DEXVisualizer({trades = [], pools = [], mode = 'normal'}) {
    const [activeBeams, setActiveBeams] = React.useState([])
    const [shockwaves, setShockwaves] = React.useState([])
    const screenShake = useStore(state => state.screenShake)

    useEffect(() => {
        trades.forEach(trade => {
            const {assetIn, assetOut, amountIn, amountOut, type, priceImpact} = trade
            const isHuge = amountIn > 100000 || amountOut > 100000

            // Create beam
            const beam = {
                id: `${trade.id}-${Date.now()}`,
                from: trade.fromPosition || [0, 0, 0],
                to: trade.toPosition || [10, 0, 0],
                color: type === 'swap' ? '#ff00ff' : '#00ffff',
                width: Math.log10(amountIn + 1) * 0.2,
                duration: isHuge ? 3000 : 1500,
                intensity: isHuge ? 5 : 1,
                type: type === 'swap' ? 'plasma' : 'lightning'
            }

            setActiveBeams(prev => [...prev, beam])

            // Whale swap effects
            if (isHuge) {
                setShockwaves(prev => [...prev, {
                    id: `shock-${Date.now()}`,
                    position: trade.toPosition || [10, 0, 0],
                    size: 50
                }])
                
                if (screenShake) {
                    screenShake(0.02, 500)
                }
            }

            // Price impact visual
            if (priceImpact && Math.abs(priceImpact) > 0.05) {
                // Trigger red pulse on target star
                console.log('High price impact detected:', priceImpact)
            }

            // Cleanup after duration
            setTimeout(() => {
                setActiveBeams(prev => prev.filter(b => b.id !== beam.id))
            }, beam.duration)
        })
    }, [trades, screenShake])

    // Filter what to show based on mode
    const visiblePools = mode === 'liquidity' ? pools : []
    const visibleBeams = mode === 'normal' || mode === 'liquidity' ? activeBeams : []

    return (
        <group>
            {/* Pool stars (only in liquidity mode) */}
            {visiblePools.map(pool => (
                <PoolStar
                    key={pool.id}
                    poolId={pool.id}
                    position={pool.position}
                    depth={pool.depth}
                    volume24h={pool.volume24h}
                    color={poolColorMap[pool.pair] || poolColorMap.default}
                />
            ))}

            {/* Trade beams */}
            {visibleBeams.map(beam => (
                beam.type === 'plasma' ? (
                    <PlasmaBeam
                        key={beam.id}
                        from={beam.from}
                        to={beam.to}
                        color={beam.color}
                        width={beam.width}
                        duration={beam.duration}
                        intensity={beam.intensity}
                    />
                ) : (
                    <LightningBolt
                        key={beam.id}
                        from={beam.from}
                        to={beam.to}
                        color={beam.color}
                    />
                )
            ))}

            {/* Shockwaves */}
            {shockwaves.map(shock => (
                <RainbowShockwave
                    key={shock.id}
                    position={shock.position}
                    size={shock.size}
                />
            ))}
        </group>
    )
}

export default DEXVisualizer
