"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function DNAHelix() {
  const group1Ref = useRef<THREE.Group>(null!)
  const group2Ref = useRef<THREE.Group>(null!)
  const connectionsRef = useRef<THREE.LineSegments>(null!)

  const { strand1, strand2, connections } = useMemo(() => {
    const count = 50
    const radius = 1
    const height = 8
    const strand1Positions: THREE.Vector3[] = []
    const strand2Positions: THREE.Vector3[] = []
    const connectionPairs: [THREE.Vector3, THREE.Vector3][] = []

    for (let i = 0; i < count; i++) {
      const t = i / count
      const angle = t * Math.PI * 4 // 2 full rotations
      const y = t * height - height / 2

      // First strand
      const x1 = Math.cos(angle) * radius
      const z1 = Math.sin(angle) * radius
      strand1Positions.push(new THREE.Vector3(x1, y, z1))

      // Second strand (opposite side)
      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius
      strand2Positions.push(new THREE.Vector3(x2, y, z2))

      // Connection pairs (base pairs)
      if (i % 3 === 0) {
        connectionPairs.push([
          new THREE.Vector3(x1, y, z1),
          new THREE.Vector3(x2, y, z2)
        ])
      }
    }

    return { strand1: strand1Positions, strand2: strand2Positions, connections: connectionPairs }
  }, [])

  // Create connection lines
  const connectionGeometry = useMemo(() => {
    const positions: number[] = []
    connections.forEach(([p1, p2]) => {
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geometry
  }, [connections])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (group1Ref.current && group2Ref.current && connectionsRef.current) {
      // Rotate the entire DNA structure
      group1Ref.current.rotation.y = time * 0.2
      group2Ref.current.rotation.y = time * 0.2
      connectionsRef.current.rotation.y = time * 0.2

      // Animate spheres
      group1Ref.current.children.forEach((child, i) => {
        const pulse = Math.sin(time * 2 + i * 0.1) * 0.1 + 1
        child.scale.setScalar(pulse)
      })

      group2Ref.current.children.forEach((child, i) => {
        const pulse = Math.sin(time * 2 + i * 0.1) * 0.1 + 1
        child.scale.setScalar(pulse)
      })
    }
  })

  return (
    <>
      {/* First strand */}
      <group ref={group1Ref}>
        {strand1.map((pos, i) => (
          <mesh key={`s1-${i}`} position={pos}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Second strand */}
      <group ref={group2Ref}>
        {strand2.map((pos, i) => (
          <mesh key={`s2-${i}`} position={pos}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Base pair connections */}
      <lineSegments ref={connectionsRef} geometry={connectionGeometry}>
        <lineBasicMaterial color="#ffff00" opacity={0.6} transparent />
      </lineSegments>
    </>
  )
}

export default function DNAHelixScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [4, 2, 4], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <DNAHelix />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
