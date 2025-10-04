"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function Aurora() {
  const meshRef = useRef<THREE.Mesh>(null!)

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;

      // Noise function
      float noise(vec3 p) {
        return sin(p.x * 1.5) * cos(p.y * 1.5) * sin(p.z * 1.5);
      }

      void main() {
        vUv = uv;

        vec3 pos = position;

        // Create waves
        float wave1 = sin(pos.x * 2.0 + uTime) * 0.3;
        float wave2 = sin(pos.x * 3.0 - uTime * 1.5) * 0.2;
        float wave3 = cos(pos.x * 1.5 + uTime * 0.8) * 0.25;

        float elevation = wave1 + wave2 + wave3;

        // Add noise
        elevation += noise(vec3(pos.x * 2.0, uTime * 0.5, pos.y)) * 0.15;

        pos.z += elevation;
        vElevation = elevation;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        // Aurora colors
        vec3 color1 = vec3(0.0, 1.0, 0.4); // Green
        vec3 color2 = vec3(0.0, 0.5, 1.0); // Blue
        vec3 color3 = vec3(0.5, 0.0, 1.0); // Purple
        vec3 color4 = vec3(0.0, 1.0, 0.8); // Cyan

        // Mix colors based on position and elevation
        float mixValue = sin(vUv.x * 3.0 + uTime * 0.5) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, mixValue);
        color = mix(color, color3, sin(vUv.x * 5.0 - uTime) * 0.5 + 0.5);
        color = mix(color, color4, vElevation);

        // Fade at edges
        float alpha = 1.0 - abs(vUv.y - 0.5) * 2.0;
        alpha = smoothstep(0.0, 1.0, alpha);

        // Add some shimmer
        float shimmer = sin(vUv.x * 20.0 + uTime * 2.0) * 0.1 + 0.9;
        color *= shimmer;

        // Brighten based on elevation
        color *= (1.0 + vElevation * 0.5);

        gl_FragColor = vec4(color, alpha * 0.7);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  })

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <group>
      {/* Multiple layers for depth */}
      <mesh ref={meshRef} material={material} position={[0, 1, 0]}>
        <planeGeometry args={[8, 3, 64, 32]} />
      </mesh>
      <mesh material={material} position={[0, 0.5, -0.5]}>
        <planeGeometry args={[8, 3, 64, 32]} />
      </mesh>
      <mesh material={material} position={[0, 0, -1]}>
        <planeGeometry args={[8, 3, 64, 32]} />
      </mesh>
    </group>
  )
}

export default function AuroraScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000000"]} />
        <Aurora />
      </Canvas>
    </div>
  )
}
