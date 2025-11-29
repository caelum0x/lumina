import React, {useRef, useMemo, useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

const topicColorMap = {
    'transfer': '#00ff00',
    'swap': '#ffff00',
    'mint': '#ff00ff',
    'burn': '#ff4400',
    'approve': '#00ffff',
    'default': '#ffffff'
}

function EventParticle({position, velocity, color, lifetime}) {
    const meshRef = useRef()
    const life = useRef(lifetime)

    useFrame((state, delta) => {
        if (!meshRef.current) return
        life.current -= delta
        if (life.current <= 0) {
            meshRef.current.visible = false
            return
        }
        meshRef.current.position.add(velocity.clone().multiplyScalar(delta))
        meshRef.current.material.opacity = life.current / lifetime
    })

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={1} />
        </mesh>
    )
}

function Ring({radius, color, opacity}) {
    return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius - 0.1, radius + 0.1, 64]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
        </mesh>
    )
}

export function ContractStar({
    contractId,
    position,
    events = [],
    callDepth = 1,
    tvl = 0,
    gasUsed = 0,
    isError = false,
    storageEntries = [],
    lastInvocation = null
}) {
    const pulseRef = useRef()
    const haloRef = useRef()
    const shockwaveRef = useRef()
    const moonRefs = useRef([])
    
    const baseSize = 1
    const tvlScale = Math.min(tvl / 1000000, 5) // Scale by millions
    const maxGas = 100000000

    // Pulse shader uniforms
    const uniforms = useMemo(() => ({
        time: {value: 0},
        intensity: {value: 1},
        color: {value: new THREE.Color(isError ? '#ff0000' : '#00ffff')}
    }), [isError])

    // Trigger shockwave on invocation
    useEffect(() => {
        if (lastInvocation && shockwaveRef.current) {
            const intensity = gasUsed / maxGas
            shockwaveRef.current.scale.set(1, 1, 1)
            shockwaveRef.current.material.opacity = 0.8
            
            // Animate shockwave expansion
            const startTime = Date.now()
            const animate = () => {
                const elapsed = Date.now() - startTime
                const progress = elapsed / 1000 // 1 second animation
                
                if (progress < 1 && shockwaveRef.current) {
                    const scale = 1 + progress * 10 * intensity
                    shockwaveRef.current.scale.set(scale, scale, scale)
                    shockwaveRef.current.material.opacity = 0.8 * (1 - progress)
                    requestAnimationFrame(animate)
                }
            }
            animate()
        }
    }, [lastInvocation, gasUsed])

    // Animate pulse and orbiting moons
    useFrame((state) => {
        const time = state.clock.elapsedTime
        uniforms.time.value = time

        // Pulse the core
        if (pulseRef.current) {
            const pulse = 1 + Math.sin(time * 3) * 0.1
            pulseRef.current.scale.set(pulse, pulse, pulse)
        }

        // Rotate halo
        if (haloRef.current) {
            haloRef.current.rotation.y = time * 0.5
        }

        // Orbit moons (storage entries)
        storageEntries.forEach((entry, i) => {
            if (moonRefs.current[i]) {
                const angle = time * 0.5 + i * (Math.PI * 2 / storageEntries.length)
                const radius = 2 + tvlScale
                moonRefs.current[i].position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * 0.3,
                    Math.sin(angle) * radius
                )
            }
        })
    })

    // Vertex shader for pulsar effect
    const pulsarVertex = `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
            vPosition = position;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `

    // Fragment shader for pulsar effect
    const pulsarFragment = `
        uniform float time;
        uniform float intensity;
        uniform vec3 color;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
            float pulse = sin(length(vPosition) * 5.0 - time * 3.0) * 0.5 + 0.5;
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            vec3 finalColor = color * (pulse + fresnel * intensity);
            float alpha = 0.8 + pulse * 0.2;
            gl_FragColor = vec4(finalColor, alpha);
        }
    `

    return (
        <group position={position}>
            {/* Core star with pulsar shader */}
            <mesh ref={pulseRef}>
                <sphereGeometry args={[baseSize + tvlScale * 0.3, 64, 64]} />
                <shaderMaterial
                    vertexShader={pulsarVertex}
                    fragmentShader={pulsarFragment}
                    uniforms={uniforms}
                    transparent
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Concentric rings for call depth */}
            {Array.from({length: callDepth}).map((_, i) => (
                <Ring 
                    key={i} 
                    radius={2 + i * 1.5} 
                    color={isError ? '#ff0000' : '#00ffff'} 
                    opacity={0.6 - i * 0.1} 
                />
            ))}

            {/* Halo representing TVL */}
            {tvl > 0 && (
                <mesh ref={haloRef}>
                    <sphereGeometry args={[baseSize + tvlScale * 2, 32, 32]} />
                    <meshBasicMaterial 
                        color={isError ? '#ff0000' : '#00ffff'} 
                        transparent 
                        opacity={0.15} 
                        side={THREE.BackSide} 
                    />
                </mesh>
            )}

            {/* Shockwave for invocations */}
            <mesh ref={shockwaveRef}>
                <sphereGeometry args={[baseSize + tvlScale * 0.5, 32, 32]} />
                <meshBasicMaterial 
                    color={isError ? '#ff0000' : '#00ffff'} 
                    transparent 
                    opacity={0} 
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Orbiting moons for storage entries */}
            {storageEntries.map((entry, i) => (
                <mesh 
                    key={i} 
                    ref={el => moonRefs.current[i] = el}
                >
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            ))}

            {/* Event particles */}
            {events.map((event, i) => {
                const color = topicColorMap[event.topic] || topicColorMap.default
                const angle = (i / events.length) * Math.PI * 2
                const velocity = new THREE.Vector3(
                    Math.cos(angle) * 2,
                    Math.random() * 0.5,
                    Math.sin(angle) * 2
                )
                return (
                    <EventParticle
                        key={`${event.id}-${i}`}
                        position={new THREE.Vector3(...position)}
                        velocity={velocity}
                        color={color}
                        lifetime={4}
                    />
                )
            })}

            {/* Error visualization */}
            {isError && (
                <mesh>
                    <sphereGeometry args={[baseSize + tvlScale * 0.5, 32, 32]} />
                    <meshBasicMaterial 
                        color="#000000" 
                        transparent 
                        opacity={0.5}
                    />
                </mesh>
            )}
        </group>
    )
}

export default ContractStar
