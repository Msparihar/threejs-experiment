"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { ResponsiveCamera } from "@/components/shared/responsive-camera"

function FlowFieldParticles() {
  const pointsRef = useRef<THREE.Points>(null!)
  const count = 10000

  const { particles, velocities } = useMemo(() => {
    const particles = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Random position in a sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * 2

      particles[i3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      particles[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      particles[i3 + 2] = r * Math.cos(phi)

      velocities[i3 + 0] = 0
      velocities[i3 + 1] = 0
      velocities[i3 + 2] = 0
    }

    return { particles, velocities }
  }, [count])

  // Simplex noise function
  const noise3D = (x: number, y: number, z: number) => {
    return Math.sin(x * 0.5) * Math.cos(y * 0.5) * Math.sin(z * 0.5)
  }

  const curl = (x: number, y: number, z: number, time: number) => {
    const e = 0.1
    const n1 = noise3D(x, y + e + time * 0.1, z)
    const n2 = noise3D(x, y - e + time * 0.1, z)
    const n3 = noise3D(x, y, z + e + time * 0.1)
    const n4 = noise3D(x, y, z - e + time * 0.1)
    const n5 = noise3D(x + e + time * 0.1, y, z)
    const n6 = noise3D(x - e + time * 0.1, y, z)

    return new THREE.Vector3(
      (n1 - n2) / (2 * e),
      (n3 - n4) / (2 * e),
      (n5 - n6) / (2 * e)
    ).normalize()
  }

  useFrame((state) => {
    if (!pointsRef.current) return

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      const x = positions[i3 + 0]
      const y = positions[i3 + 1]
      const z = positions[i3 + 2]

      // Flow field force
      const force = curl(x * 0.3, y * 0.3, z * 0.3, time)

      // Update velocity
      velocities[i3 + 0] += force.x * 0.02
      velocities[i3 + 1] += force.y * 0.02
      velocities[i3 + 2] += force.z * 0.02

      // Damping
      velocities[i3 + 0] *= 0.98
      velocities[i3 + 1] *= 0.98
      velocities[i3 + 2] *= 0.98

      // Update position
      positions[i3 + 0] += velocities[i3 + 0] * 0.016
      positions[i3 + 1] += velocities[i3 + 1] * 0.016
      positions[i3 + 2] += velocities[i3 + 2] * 0.016

      // Keep particles in bounds
      const dist = Math.sqrt(x * x + y * y + z * z)
      if (dist > 3) {
        const factor = 3 / dist
        positions[i3 + 0] *= factor
        positions[i3 + 1] *= factor
        positions[i3 + 2] *= factor
        velocities[i3 + 0] *= -0.5
        velocities[i3 + 1] *= -0.5
        velocities[i3 + 2] *= -0.5
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.rotation.y += 0.001
  })

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vColor;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = 3.0;

        // Color based on position
        vColor = normalize(position) * 0.5 + 0.5;
        vColor = vec3(0.3, 0.6, 1.0) + vColor * 0.3;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;

      void main() {
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;

        float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  )
}

export default function FlowFieldScene() {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 50 }} 
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#000000"]} />
        <ResponsiveCamera baseFov={50} minFov={40} maxFov={65} />
        <FlowFieldParticles />
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
