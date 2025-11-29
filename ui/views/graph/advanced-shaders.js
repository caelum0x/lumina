import React, {useRef, useMemo} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'

// Holographic shader for whale transactions
export const holographicShader = {
    vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            float scanline = sin(vUv.y * 50.0 + time * 5.0) * 0.5 + 0.5;
            vec3 finalColor = color * (fresnel + scanline * 0.3);
            gl_FragColor = vec4(finalColor, 0.8);
        }
    `
}

// Energy pulse shader for Soroban contracts
export const energyPulseShader = {
    vertexShader: `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec3 vPosition;
        
        void main() {
            float dist = length(vPosition);
            float pulse = sin(dist * 10.0 - time * 3.0) * 0.5 + 0.5;
            float glow = 1.0 / (1.0 + dist * 2.0);
            vec3 finalColor = color * (pulse + glow);
            gl_FragColor = vec4(finalColor, pulse * 0.8);
        }
    `
}

// Warp field shader for connections
export const warpFieldShader = {
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        
        void main() {
            float wave = sin(vUv.x * 10.0 - time * 2.0) * 0.5 + 0.5;
            vec3 color = mix(color1, color2, wave);
            float alpha = (1.0 - vUv.x) * 0.6;
            gl_FragColor = vec4(color, alpha);
        }
    `
}

export function HolographicSphere({position, color = '#ff0080', size = 1}) {
    const meshRef = useRef()
    
    const uniforms = useMemo(() => ({
        time: {value: 0},
        color: {value: new THREE.Color(color)}
    }), [color])

    useFrame((state) => {
        uniforms.time.value = state.clock.elapsedTime
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01
        }
    })

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <shaderMaterial
                vertexShader={holographicShader.vertexShader}
                fragmentShader={holographicShader.fragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}

export function EnergyPulseSphere({position, color = '#00ffff', size = 1}) {
    const meshRef = useRef()
    
    const uniforms = useMemo(() => ({
        time: {value: 0},
        color: {value: new THREE.Color(color)}
    }), [color])

    useFrame((state) => {
        uniforms.time.value = state.clock.elapsedTime
    })

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 32, 32]} />
            <shaderMaterial
                vertexShader={energyPulseShader.vertexShader}
                fragmentShader={energyPulseShader.fragmentShader}
                uniforms={uniforms}
                transparent
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}

export function WarpFieldLine({start, end, color1 = '#00ffff', color2 = '#ff00ff'}) {
    const meshRef = useRef()
    
    const uniforms = useMemo(() => ({
        time: {value: 0},
        color1: {value: new THREE.Color(color1)},
        color2: {value: new THREE.Color(color2)}
    }), [color1, color2])

    const geometry = useMemo(() => {
        const points = []
        for (let i = 0; i <= 50; i++) {
            const t = i / 50
            points.push(new THREE.Vector3(
                start[0] + (end[0] - start[0]) * t,
                start[1] + (end[1] - start[1]) * t,
                start[2] + (end[2] - start[2]) * t
            ))
        }
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 50, 0.1, 8, false)
    }, [start, end])

    useFrame((state) => {
        uniforms.time.value = state.clock.elapsedTime
    })

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <shaderMaterial
                vertexShader={warpFieldShader.vertexShader}
                fragmentShader={warpFieldShader.fragmentShader}
                uniforms={uniforms}
                transparent
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    )
}
