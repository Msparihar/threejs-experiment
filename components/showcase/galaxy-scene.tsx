"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"

function GalaxySpiral() {
  const pointsRef = useRef<THREE.Points>(null!)

  const { positions, colors } = useMemo(() => {
    const count = 15000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const branches = 5
    const spin = 1
    const randomness = 0.2

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      const radius = Math.random() * 5
      const spinAngle = radius * spin
      const branchAngle = ((i % branches) / branches) * Math.PI * 2

      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * randomness * radius

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
      positions[i3 + 1] = randomY
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

      // Color based on distance from center
      const colorInner = new THREE.Color('#ff6030')
      const colorOuter = new THREE.Color('#1b3984')
      const mixedColor = colorInner.clone()
      mixedColor.lerp(colorOuter, radius / 5)

      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b
    }

    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function GalaxyScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [3, 3, 3], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000000"]} />
        <GalaxySpiral />
        <EffectComposer>
          <Bloom intensity={0.5} luminanceThreshold={0.4} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
