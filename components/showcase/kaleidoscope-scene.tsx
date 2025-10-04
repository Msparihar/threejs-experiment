"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

function KaleidoscopeEffect() {
  const groupRef = useRef<THREE.Group>(null!)
  const meshesRef = useRef<THREE.Mesh[]>([])

  const kaleidoscopeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vPosition = position;

          vec3 pos = position;

          // Add some vertex displacement for organic movement
          pos.x += sin(pos.y * 3.0 + uTime) * 0.1;
          pos.y += cos(pos.x * 2.0 + uTime * 0.8) * 0.1;
          pos.z += sin(pos.x * pos.y + uTime * 0.5) * 0.05;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;

        // Kaleidoscope function
        vec2 kaleidoscope(vec2 uv, float segments) {
          float angle = atan(uv.y, uv.x);
          float radius = length(uv);

          // Create segments
          float segmentAngle = 2.0 * 3.14159 / segments;
          angle = mod(angle, segmentAngle);

          // Mirror every other segment
          if (mod(floor(angle / segmentAngle * segments), 2.0) == 1.0) {
            angle = segmentAngle - angle;
          }

          return vec2(cos(angle), sin(angle)) * radius;
        }

        // Color palette function
        vec3 palette(float t) {
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.263, 0.416, 0.557);

          return a + b * cos(6.28318 * (c * t + d));
        }

        void main() {
          vec2 uv = vUv - 0.5;

          // Apply kaleidoscope effect
          vec2 kaleido = kaleidoscope(uv, 6.0);

          // Create fractal-like patterns
          float pattern = 0.0;
          for (int i = 0; i < 4; i++) {
            float scale = pow(2.0, float(i));
            vec2 p = kaleido * scale + uTime * 0.1;
            pattern += sin(p.x * 8.0) * cos(p.y * 8.0) / scale;
          }

          // Add spiral component
          float angle = atan(kaleido.y, kaleido.x);
          float radius = length(kaleido);
          pattern += sin(angle * 3.0 + radius * 10.0 - uTime * 2.0) * 0.5;

          // Color mapping
          float colorT = pattern * 0.5 + 0.5;
          colorT += sin(uTime * 0.5) * 0.2;

          vec3 color = palette(colorT);

          // Add radial fade
          float fade = 1.0 - smoothstep(0.3, 0.8, length(uv));
          color *= fade;

          // Add some sparkle
          float sparkle = sin(pattern * 20.0 + uTime * 5.0) * 0.1 + 0.9;
          color *= sparkle;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
    })
  }, [])

  // Create multiple mirrored planes to enhance the kaleidoscope effect
  const planes = useMemo(() => {
    const planeData = []
    const segments = 8

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      planeData.push({
        position: [Math.cos(angle) * 2, Math.sin(angle) * 2, 0] as [number, number, number],
        rotation: [0, 0, angle] as [number, number, number],
      })
    }

    return planeData
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    kaleidoscopeMaterial.uniforms.uTime.value = time

    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.2
    }

    // Animate individual meshes
    meshesRef.current.forEach((mesh, index) => {
      if (mesh) {
        mesh.rotation.x = time * (0.1 + index * 0.05)
        mesh.rotation.y = time * (0.15 + index * 0.03)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {/* Central kaleidoscope mesh */}
      <mesh material={kaleidoscopeMaterial}>
        <planeGeometry args={[4, 4, 32, 32]} />
      </mesh>

      {/* Mirrored planes around the center */}
      {planes.map((plane, index) => (
        <mesh
          key={index}
          ref={(el) => el && (meshesRef.current[index] = el)}
          material={kaleidoscopeMaterial}
          position={plane.position}
          rotation={plane.rotation}
        >
          <planeGeometry args={[1.5, 1.5, 16, 16]} />
        </mesh>
      ))}

      {/* Additional decorative elements */}
      <mesh material={kaleidoscopeMaterial} position={[0, 0, -1]}>
        <ringGeometry args={[2, 3, 32]} />
      </mesh>

      <mesh material={kaleidoscopeMaterial} position={[0, 0, 1]}>
        <circleGeometry args={[1.5, 32]} />
      </mesh>
    </group>
  )
}

export default function KaleidoscopeScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000"]} />
        <KaleidoscopeEffect />
      </Canvas>
    </div>
  )
}
