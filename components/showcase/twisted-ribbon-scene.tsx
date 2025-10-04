"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function TwistedRibbon() {
  const meshRef = useRef<THREE.Mesh>(null!)

  const geometry = useMemo(() => {
    const segments = 200
    const width = 0.5
    const positions: number[] = []
    const indices: number[] = []
    const uvs: number[] = []

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = t * Math.PI * 4 // 2 full rotations
      const twist = t * Math.PI * 6 // Twist amount

      // Parametric curve (helix)
      const x = Math.cos(angle) * 2
      const y = t * 6 - 3 // Height from -3 to 3
      const z = Math.sin(angle) * 2

      // Ribbon edges with twist
      for (let side = 0; side <= 1; side++) {
        const offset = (side - 0.5) * width

        // Perpendicular vector rotated by twist angle
        const perpX = -Math.sin(angle + twist) * offset
        const perpZ = Math.cos(angle + twist) * offset

        positions.push(x + perpX, y, z + perpZ)
        uvs.push(side, t)
      }

      // Create triangles
      if (i < segments) {
        const current = i * 2
        const next = (i + 1) * 2

        indices.push(current, current + 1, next)
        indices.push(current + 1, next + 1, next)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()

    return geo
  }, [])

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        // Gradient along the ribbon
        vec3 color1 = vec3(1.0, 0.2, 0.5);
        vec3 color2 = vec3(0.2, 0.5, 1.0);
        vec3 color = mix(color1, color2, vUv.y);

        // Add some shimmer based on normal
        float shimmer = abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
        color += shimmer * 0.3;

        // Pulsing effect
        color *= 0.8 + sin(vUv.y * 10.0 - uTime * 2.0) * 0.2;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
    },
    side: THREE.DoubleSide,
  })

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}

export default function TwistedRibbonScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [5, 3, 5], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <TwistedRibbon />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
