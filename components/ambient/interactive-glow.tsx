"use client"

import React, { useRef, useMemo, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { BaseGlowShader } from "./base-shaders"

interface InteractiveGlowProps {
  count?: number
  intensity?: number
  mouseInfluence?: number
  color1?: string
  color2?: string
  opacity?: number
  interactive?: boolean
}

export function InteractiveGlow({
  count = 8,
  intensity = 1.0,
  mouseInfluence = 300.0,
  color1 = "#8b5cf6",
  color2 = "#06b6d4",
  opacity = 0.6,
  interactive = true,
}: InteractiveGlowProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const mouseRef = useRef({ x: 0, y: 0 })
  const { viewport, size: canvasSize } = useThree()

  // Generate glow points in a network pattern
  const { positions, connections } = useMemo(() => {
    const positions = []
    const connections = []

    // Create main nodes in a circular pattern
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 3 + Math.random() * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      const z = (Math.random() - 0.5) * 1

      positions.push(new THREE.Vector3(x, y, z))
    }

    // Create connections between nearby nodes
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const distance = positions[i].distanceTo(positions[j])
        if (distance < 4 && Math.random() > 0.3) {
          connections.push([i, j])
        }
      }
    }

    return { positions, connections }
  }, [count])

  // Handle mouse movement for interaction
  const handleMouseMove = (event: MouseEvent) => {
    if (!interactive) return

    const x = (event.clientX / canvasSize.width) * 2 - 1
    const y = -(event.clientY / canvasSize.height) * 2 + 1
    mouseRef.current = { x, y }
  }

  // Add and remove event listener
  useEffect(() => {
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [interactive])

  // Animation loop
  useFrame((state) => {
    if (groupRef.current) {
      // Rotate the entire group slowly
      groupRef.current.rotation.y += 0.002
      groupRef.current.rotation.x += 0.001

      // Update each glow point
      groupRef.current.children.forEach((child: THREE.Object3D, index: number) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          const material = child.material
          const position = positions[index]

          // Update time and intensity
          material.uniforms.uTime.value = state.clock.elapsedTime
          material.uniforms.uIntensity.value = intensity

          // Mouse interaction
          let influence = 0
          if (interactive) {
            const mouse = new THREE.Vector2(mouseRef.current.x, mouseRef.current.y)
            material.uniforms.uMouse.value.copy(mouse)
            material.uniforms.uMouseInfluence.value = mouseInfluence

            // Calculate distance to mouse for additional effect
            const mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0)
            const distance = position.distanceTo(mouse3D)
            influence = Math.max(0, (1 - distance / mouseInfluence))
            material.uniforms.uIntensity.value = intensity * (1 + influence * 0.5)
          }

          // Update colors
          material.uniforms.uColor1.value.setStyle(color1)
          material.uniforms.uColor2.value.setStyle(color2)
          material.uniforms.uOpacity.value = opacity

          // Animate scale based on time and mouse proximity
          const baseScale = 0.8 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2
          const mouseScale = interactive ? (1 + influence * 0.3) : 1
          child.scale.setScalar(baseScale * mouseScale)
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* Render glow points */}
      {positions.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <primitive object={BaseGlowShader.clone()} attach="material" />
        </mesh>
      ))}

      {/* Render connections as thin lines */}
      {connections.map(([i, j], index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...positions[i], ...positions[j]])}
              itemSize={3}
              args={[new Float32Array([...positions[i], ...positions[j]]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={color1}
            transparent
            opacity={opacity * 0.3}
          />
        </line>
      ))}
    </group>
  )
}
