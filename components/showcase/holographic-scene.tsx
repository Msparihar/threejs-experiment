"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function HolographicCube() {
  const meshRef = useRef<THREE.Mesh>(null!)

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;

      // Fresnel effect
      float fresnel(vec3 viewDirection, vec3 normal, float power) {
        return pow(1.0 - abs(dot(viewDirection, normal)), power);
      }

      // Scanlines
      float scanlines(vec2 uv, float time) {
        float line = sin((uv.y + time * 0.1) * 40.0) * 0.5 + 0.5;
        return smoothstep(0.3, 0.7, line);
      }

      // Glitch effect
      float glitch(vec2 uv, float time) {
        float glitchTime = floor(time * 2.0);
        float noise = fract(sin(dot(uv + glitchTime, vec2(12.9898, 78.233))) * 43758.5453);
        return step(0.95, noise);
      }

      void main() {
        vec3 viewDirection = normalize(vPosition);

        // Fresnel
        float fresnelValue = fresnel(viewDirection, vNormal, 2.0);

        // Color gradient based on position and time
        vec3 color = mix(uColor1, uColor2, vUv.y);
        color = mix(color, uColor3, fresnelValue);

        // Scanlines
        float scan = scanlines(vUv, uTime);
        color *= (0.7 + scan * 0.3);

        // Glitch
        float glitchEffect = glitch(vUv, uTime);
        if (glitchEffect > 0.5) {
          color = vec3(1.0);
        }

        // Holographic edge glow
        float edgeGlow = smoothstep(0.0, 1.0, fresnelValue);
        color += edgeGlow * uColor3 * 0.5;

        // Transparency based on Fresnel
        float alpha = 0.3 + fresnelValue * 0.7;

        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#00ffff") },
      uColor2: { value: new THREE.Color("#ff00ff") },
      uColor3: { value: new THREE.Color("#ffff00") },
    },
    transparent: true,
    side: THREE.DoubleSide,
  })

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime

    // Rotate the cube
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.007
    }
  })

  return (
    <mesh ref={meshRef} material={material}>
      <boxGeometry args={[2, 2, 2]} />
    </mesh>
  )
}

export default function HolographicScene() {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 60 }} 
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <HolographicCube />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
