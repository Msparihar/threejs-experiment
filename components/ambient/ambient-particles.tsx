"use client"

import { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { BaseParticleShader } from "./base-shaders"

interface AmbientParticlesProps {
  count?: number
  size?: number
  speed?: number
  attraction?: number
  mouseInfluence?: number
  color1?: string
  color2?: string
  interactive?: boolean
  className?: string
}

export function AmbientParticles({
  count = 100,
  size = 2.0,
  speed = 0.5,
  attraction = 0.3,
  mouseInfluence = 200.0,
  color1 = "#4338ca",
  color2 = "#7c3aed",
  interactive = true,
  className = "",
}: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  const mouseRef = useRef({ x: 0, y: 0 })
  const { viewport, size: canvasSize } = useThree()

  // Generate particle attributes
  const { positions, offsets, scales, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const offsets = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Random positions in a subtle area
      positions[i3] = (Math.random() - 0.5) * viewport.width * 0.8
      positions[i3 + 1] = (Math.random() - 0.5) * viewport.height * 0.8
      positions[i3 + 2] = (Math.random() - 0.5) * 2

      // Random offsets for variation
      offsets[i3] = (Math.random() - 0.5) * 0.5
      offsets[i3 + 1] = (Math.random() - 0.5) * 0.5
      offsets[i3 + 2] = (Math.random() - 0.5) * 0.5

      // Random scales and phases for variation
      scales[i] = Math.random()
      phases[i] = Math.random() * Math.PI * 2
    }

    return { positions, offsets, scales, phases }
  }, [count, viewport])

  // Handle mouse movement for interaction
  useEffect(() => {
    if (!interactive) return

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / canvasSize.width) * 2 - 1
      const y = -(event.clientY / canvasSize.height) * 2 + 1
      mouseRef.current = { x, y }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [interactive, canvasSize])

  // Animation loop
  useFrame((state) => {
    if (pointsRef.current && pointsRef.current.material) {
      const material = pointsRef.current.material as THREE.ShaderMaterial

      // Update time uniform
      material.uniforms.uTime.value = state.clock.elapsedTime

      // Update mouse position uniform
      if (interactive) {
        material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y)
        material.uniforms.uAttraction.value = attraction
        material.uniforms.uMouseInfluence.value = mouseInfluence
      }

      // Update other uniforms
      material.uniforms.uSize.value = size
      material.uniforms.uSpeed.value = speed
      material.uniforms.uColor1.value.setStyle(color1)
      material.uniforms.uColor2.value.setStyle(color2)
    }

    // Gentle rotation for subtle movement
    if (pointsRef.current) {
      pointsRef.current.rotation.z += 0.0002
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-offset"
          count={count}
          array={offsets}
          itemSize={3}
          args={[offsets, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={count}
          array={scales}
          itemSize={1}
          args={[scales, 1]}
        />
        <bufferAttribute
          attach="attributes-phase"
          count={count}
          array={phases}
          itemSize={1}
          args={[phases, 1]}
        />
      </bufferGeometry>
      <primitive object={BaseParticleShader} attach="material" />
    </points>
  )
}

// Performance-optimized version for mobile devices
export function AmbientParticlesLight({
  count = 50,
  ...props
}: AmbientParticlesProps) {
  return <AmbientParticles count={count} {...props} />
}
