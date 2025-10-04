"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { BaseTransitionShader } from "./base-shaders"

interface TransitionOverlayProps {
  progress?: number
  transitionType?: number // 0: dissolve, 1: liquid, 2: geometric
  color1?: string
  color2?: string
  opacity?: number
  mousePosition?: { x: number; y: number }
}

export function TransitionOverlay({
  progress = 0.0,
  transitionType = 0.0,
  color1 = "#1e1b4b",
  color2 = "#312e81",
  opacity = 0.8,
  mousePosition = { x: 0, y: 0 },
}: TransitionOverlayProps) {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Create geometry based on transition type
  const geometry = useMemo(() => {
    if (transitionType < 0.5) {
      // Dissolve: Simple plane
      return new THREE.PlaneGeometry(20, 20, 128, 128)
    } else if (transitionType < 1.5) {
      // Liquid: Wavy geometry
      return new THREE.PlaneGeometry(20, 20, 64, 64)
    } else {
      // Geometric: Icosahedron for morphing effect
      return new THREE.IcosahedronGeometry(8, 32)
    }
  }, [transitionType])

  // Animation loop
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof THREE.ShaderMaterial) {
      const material = meshRef.current.material

      // Update uniforms
      material.uniforms.uTime.value = state.clock.elapsedTime
      material.uniforms.uProgress.value = progress
      material.uniforms.uTransitionType.value = transitionType
      material.uniforms.uOpacity.value = opacity

      // Mouse interaction
      material.uniforms.uMouse.value.set(mousePosition.x, mousePosition.y)

      // Update colors
      material.uniforms.uColor1.value.setStyle(color1)
      material.uniforms.uColor2.value.setStyle(color2)

      // Rotate based on transition type
      if (transitionType < 0.5) {
        // Gentle rotation for dissolve
        meshRef.current.rotation.z += 0.002
      } else if (transitionType < 1.5) {
        // Wave-like rotation for liquid
        meshRef.current.rotation.z += 0.003
        meshRef.current.rotation.x += 0.001
      } else {
        // More complex rotation for geometric
        meshRef.current.rotation.y += 0.005
        meshRef.current.rotation.x += 0.003
      }
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <primitive object={BaseTransitionShader.clone()} attach="material" />
    </mesh>
  )
}

// Predefined transition configurations
export const TransitionConfigs = {
  dissolve: {
    transitionType: 0.0,
    color1: "#1e1b4b",
    color2: "#312e81",
    opacity: 0.8,
  },
  liquid: {
    transitionType: 1.0,
    color1: "#06b6d4",
    color2: "#8b5cf6",
    opacity: 0.6,
  },
  geometric: {
    transitionType: 2.0,
    color1: "#f59e0b",
    color2: "#ef4444",
    opacity: 0.9,
  },
}
