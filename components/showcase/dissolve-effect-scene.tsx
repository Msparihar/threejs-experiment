"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { ResponsiveCamera } from "@/components/shared/responsive-camera"

function CameraController() {
  const { camera, size } = useThree()

  useEffect(() => {
    // Update camera aspect ratio when component mounts or size changes
    const perspectiveCamera = camera as THREE.PerspectiveCamera
    perspectiveCamera.aspect = size.width / size.height
    perspectiveCamera.updateProjectionMatrix()
  }, [camera, size])

  return null
}

// Keep the original for backward compatibility but use ResponsiveCamera instead

function DissolveEffect() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const particlesRef = useRef<THREE.Points>(null!)

  // Dissolve shader material
  const dissolveMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        uniform float uDissolve;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vNoise;

        // Noise function
        float noise(vec3 position) {
          return sin(position.x * 2.0) * cos(position.y * 3.0) * sin(position.z * 1.5);
        }

        void main() {
          vUv = uv;
          vPosition = position;

          vec3 pos = position;
          float n = noise(pos + uTime * 0.5);
          vNoise = n;

          // Dissolve displacement
          if (n < uDissolve - 0.1) {
            pos += normal * (uDissolve - n) * 2.0;
          }

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uDissolve;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vNoise;

        void main() {
          float dissolve = uDissolve;

          // Create dissolve threshold
          if (vNoise < dissolve - 0.2) {
            discard;
          }

          // Edge glow
          float edge = smoothstep(dissolve - 0.2, dissolve, vNoise);
          vec3 glowColor = vec3(1.0, 0.3, 0.0); // Orange glow
          vec3 baseColor = vec3(0.8, 0.8, 1.0); // Light blue

          vec3 color = mix(glowColor, baseColor, edge);

          // Add rim lighting
          float fresnel = 1.0 - abs(dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)));
          color += glowColor * fresnel * 0.5;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uDissolve: { value: 0 },
      },
      transparent: true,
    })
  }, [])

  // Particle system for dissolved pieces
  const particlesMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        uniform float uDissolve;
        attribute float aScale;
        attribute vec3 aVelocity;
        varying float vAlpha;

        void main() {
          vec3 pos = position;

          // Animate particles based on dissolve
          float life = max(0.0, uDissolve - 0.3);
          pos += aVelocity * life * 5.0;

          vAlpha = 1.0 - life * 2.0;
          vAlpha = max(0.0, vAlpha);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aScale * (300.0 / -mvPosition.z) * vAlpha;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);

          if (dist > 0.5) discard;

          float alpha = (1.0 - dist * 2.0) * vAlpha;
          vec3 color = vec3(1.0, 0.5, 0.0); // Orange particles

          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uDissolve: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  // Generate particle attributes
  const particleAttributes = useMemo(() => {
    const count = 1000
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const velocities = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Random positions on sphere surface
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 1.2

      positions[i3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i3 + 1] = Math.cos(phi) * radius
      positions[i3 + 2] = Math.sin(phi) * Math.sin(theta) * radius

      scales[i] = Math.random() * 3 + 1

      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 2
      velocities[i3 + 1] = (Math.random() - 0.5) * 2
      velocities[i3 + 2] = (Math.random() - 0.5) * 2
    }

    return { positions, scales, velocities }
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // Animate dissolve value
    const dissolve = (Math.sin(time * 0.5) + 1) * 0.5

    dissolveMaterial.uniforms.uTime.value = time
    dissolveMaterial.uniforms.uDissolve.value = dissolve

    particlesMaterial.uniforms.uTime.value = time
    particlesMaterial.uniforms.uDissolve.value = dissolve

    // Rotate the mesh
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5
      meshRef.current.rotation.x = time * 0.3
    }
  })

  return (
    <group>
      {/* Main dissolving mesh */}
      <mesh ref={meshRef} material={dissolveMaterial}>
        <torusKnotGeometry args={[1, 0.4, 128, 32]} />
      </mesh>

      {/* Particle system */}
      <points ref={particlesRef} material={particlesMaterial}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleAttributes.positions.length / 3}
            array={particleAttributes.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-aScale"
            count={particleAttributes.scales.length}
            array={particleAttributes.scales}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-aVelocity"
            count={particleAttributes.velocities.length / 3}
            array={particleAttributes.velocities}
            itemSize={3}
          />
        </bufferGeometry>
      </points>
    </group>
  )
}

export default function DissolveEffectScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000000"]} />
        <ResponsiveCamera baseFov={45} minFov={40} maxFov={65} />
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <DissolveEffect />
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.3} luminanceSmoothing={0.9} height={1024} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
