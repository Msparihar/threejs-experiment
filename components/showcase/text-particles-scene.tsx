"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"

function TextParticles() {
  const particlesRef = useRef<THREE.Points>(null!)
  const textRef = useRef<THREE.Mesh>(null!)
  const [isHovered, setIsHovered] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(0)

  // Generate particle positions based on text
  const particleData = useMemo(() => {
    const particleCount = 2000
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)
    const originalPositions = new Float32Array(particleCount * 3)

    // Create text-like formation
    const text = "AWWWARDS"
    const letterWidth = 0.8
    const totalWidth = text.length * letterWidth

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Distribute particles to form text
      const letterIndex = Math.floor((i / particleCount) * text.length)
      const localX = (Math.random() - 0.5) * letterWidth
      const localY = (Math.random() - 0.5) * 1.2
      const localZ = (Math.random() - 0.5) * 0.2

      const x = (letterIndex - text.length * 0.5) * letterWidth + localX
      const y = localY
      const z = localZ

      // Original positions (text formation)
      originalPositions[i3] = x
      originalPositions[i3 + 1] = y
      originalPositions[i3 + 2] = z

      // Starting positions
      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      // Random velocities for explosion effect
      velocities[i3] = (Math.random() - 0.5) * 8
      velocities[i3 + 1] = (Math.random() - 0.5) * 8
      velocities[i3 + 2] = (Math.random() - 0.5) * 8

      // Colors
      const hue = (letterIndex / text.length) * 0.8 + 0.2
      const color = new THREE.Color().setHSL(hue, 0.8, 0.7)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // Scales
      scales[i] = Math.random() * 2 + 0.5
    }

    return {
      positions,
      colors,
      scales,
      velocities,
      originalPositions,
      count: particleCount
    }
  }, [])

  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        uniform float uTransition;
        attribute float aScale;
        attribute vec3 aVelocity;
        attribute vec3 aOriginalPosition;
        varying vec3 vColor;

        void main() {
          vColor = color;

          vec3 pos = position;

          // Interpolate between original position and exploded position
          vec3 explodedPos = aOriginalPosition + aVelocity * uTransition;
          pos = mix(aOriginalPosition, explodedPos, uTransition);

          // Add some floating motion
          pos.y += sin(uTime + pos.x * 2.0) * 0.1 * (1.0 - uTransition);
          pos.x += cos(uTime + pos.y * 1.5) * 0.05 * (1.0 - uTransition);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aScale * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);

          if (dist > 0.5) discard;

          float alpha = 1.0 - dist * 2.0;
          alpha = smoothstep(0.0, 1.0, alpha);

          // Add sparkle effect
          float sparkle = sin(gl_PointCoord.x * 10.0) * sin(gl_PointCoord.y * 10.0);
          sparkle = smoothstep(0.8, 1.0, sparkle) * 0.5;

          vec3 color = vColor + sparkle;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uTransition: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })
  }, [])

  // Solid text material for the main text
  const textMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vUv = uv;

          vec3 pos = position;

          // Subtle breathing effect
          float breathe = sin(uTime * 0.5) * 0.02;
          pos *= (1.0 + breathe);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          // Gradient color
          vec3 color1 = vec3(1.0, 0.3, 0.8);
          vec3 color2 = vec3(0.3, 0.8, 1.0);
          vec3 color = mix(color1, color2, vUv.x);

          // Add some shimmer
          float shimmer = sin(vUv.x * 10.0 + uTime * 2.0) * 0.1 + 0.9;
          color *= shimmer;

          gl_FragColor = vec4(color, uOpacity);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 1 },
      },
      transparent: true,
    })
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Update materials
    particleMaterial.uniforms.uTime.value = time
    textMaterial.uniforms.uTime.value = time

    // Handle transition
    const targetProgress = isHovered ? 1 : 0
    setTransitionProgress(prev => THREE.MathUtils.lerp(prev, targetProgress, 0.05))

    particleMaterial.uniforms.uTransition.value = transitionProgress
    textMaterial.uniforms.uOpacity.value = 1 - transitionProgress

    // Rotate the entire group
    if (textRef.current) {
      textRef.current.rotation.y = time * 0.1
    }
  })

  return (
    <group
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* 3D Text */}
      <Text
        ref={textRef}
        fontSize={1.5}
        letterSpacing={0.1}
        material={textMaterial}
      >
        AWWWARDS
      </Text>

      {/* Particle System */}
      <points ref={particlesRef} material={particleMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleData.count}
            array={particleData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleData.count}
            array={particleData.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={particleData.count}
            array={particleData.scales}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aVelocity"
            count={particleData.count}
            array={particleData.velocities}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aOriginalPosition"
            count={particleData.count}
            array={particleData.originalPositions}
            itemSize={3}
          />
        </bufferGeometry>
      </points>
    </group>
  )
}

export default function TextParticlesScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#0a0a0a"]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <TextParticles />
      </Canvas>
    </div>
  )
}
