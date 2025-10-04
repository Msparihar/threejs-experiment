"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function IridescentSphere() {
  const meshRef = useRef<THREE.Mesh>(null!)

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      // Fresnel effect
      float fresnel(vec3 viewDir, vec3 normal) {
        return pow(1.0 - abs(dot(viewDir, normal)), 3.0);
      }

      // Thin film interference approximation
      vec3 thinFilm(float cosTheta, float thickness) {
        // Wavelengths for RGB
        vec3 wavelengths = vec3(650.0, 510.0, 475.0); // Red, Green, Blue in nm

        // Optical path difference
        vec3 delta = 2.0 * thickness * sqrt(1.0 - pow(cosTheta, 2.0)) * wavelengths;

        // Phase shift
        vec3 phase = mod(delta, wavelengths) / wavelengths * 2.0 * 3.14159;

        // Interference
        vec3 intensity = (cos(phase) + 1.0) * 0.5;

        return intensity;
      }

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        vec3 normal = normalize(vNormal);

        float fresnelValue = fresnel(viewDir, normal);

        // Varying thickness based on angle and time
        float thickness = 300.0 + sin(uTime * 0.5 + fresnelValue * 10.0) * 100.0;

        // Calculate thin film color
        vec3 filmColor = thinFilm(abs(dot(viewDir, normal)), thickness);

        // Add some base color
        vec3 baseColor = vec3(0.1, 0.1, 0.2);
        vec3 color = mix(baseColor, filmColor, fresnelValue * 0.8 + 0.2);

        // Enhance saturation
        float luminance = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(luminance), color, 2.0);

        // Add rim light
        color += fresnelValue * vec3(1.0, 0.9, 0.8) * 0.3;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
    },
  })

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime

    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} material={material}>
      <sphereGeometry args={[1.5, 128, 128]} />
    </mesh>
  )
}

export default function IridescentScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 4], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4080ff" />
        <IridescentSphere />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
