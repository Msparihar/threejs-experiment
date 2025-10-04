"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function MorphingShape() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [morphIndex, setMorphIndex] = useState(0)
  const morphProgress = useRef(0)

  // Create geometries
  const geometries = [
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.BoxGeometry(1.5, 1.5, 1.5, 32, 32, 32),
    new THREE.TorusGeometry(1, 0.4, 32, 64),
    new THREE.OctahedronGeometry(1.2, 0),
  ]

  useFrame((state) => {
    if (!meshRef.current) return

    const speed = 0.5
    morphProgress.current += state.clock.getDelta() * speed

    // When morph completes, switch to next geometry
    if (morphProgress.current >= 1) {
      morphProgress.current = 0
      setMorphIndex((prev) => (prev + 1) % geometries.length)
    }

    // Get current and next geometry
    const currentGeo = geometries[morphIndex]
    const nextGeo = geometries[(morphIndex + 1) % geometries.length]

    // Morph between geometries
    const currentPos = currentGeo.attributes.position.array as Float32Array
    const nextPos = nextGeo.attributes.position.array as Float32Array
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array

    const minLength = Math.min(currentPos.length, nextPos.length, positions.length)

    for (let i = 0; i < minLength; i++) {
      positions[i] = THREE.MathUtils.lerp(
        currentPos[i] || 0,
        nextPos[i] || 0,
        morphProgress.current
      )
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.geometry.computeVertexNormals()

    // Rotate
    meshRef.current.rotation.x += 0.005
    meshRef.current.rotation.y += 0.007
  })

  return (
    <mesh ref={meshRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={geometries[0].attributes.position.count}
          array={new Float32Array(geometries[0].attributes.position.array)}
          itemSize={3}
        />
      </bufferGeometry>
      <meshStandardMaterial
        color="#00ffff"
        emissive="#6a0dad"
        emissiveIntensity={0.3}
        roughness={0.3}
        metalness={0.8}
      />
    </mesh>
  )
}

export default function ShapeMorpherScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 4], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6a0dad" />
        <MorphingShape />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
