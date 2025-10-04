"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

function RippleWater() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [ripples, setRipples] = useState<{ x: number; y: number; time: number }[]>([])
  const { mouse, camera } = useThree()

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float uTime;
      uniform vec3 uRipples[10];
      uniform int uRippleCount;
      varying vec2 vUv;
      varying float vElevation;

      void main() {
        vUv = uv;
        vec3 pos = position;
        float elevation = 0.0;

        // Apply ripples
        for(int i = 0; i < 10; i++) {
          if(i >= uRippleCount) break;

          vec2 rippleCenter = uRipples[i].xy;
          float rippleTime = uRipples[i].z;

          float dist = distance(uv, rippleCenter);
          float wave = sin(dist * 30.0 - rippleTime * 8.0) * exp(-dist * 3.0 - rippleTime * 2.0);
          elevation += wave * 0.3;
        }

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
        // Water color based on elevation
        vec3 deepWater = vec3(0.0, 0.1, 0.3);
        vec3 shallowWater = vec3(0.0, 0.5, 0.8);
        vec3 foam = vec3(0.8, 0.9, 1.0);

        float colorMix = smoothstep(-0.1, 0.1, vElevation);
        vec3 color = mix(deepWater, shallowWater, colorMix);

        // Add foam to peaks
        if(vElevation > 0.15) {
          color = mix(color, foam, smoothstep(0.15, 0.25, vElevation));
        }

        // Add subtle grid
        float grid = smoothstep(0.48, 0.52, fract(vUv.x * 20.0)) *
                     smoothstep(0.48, 0.52, fract(vUv.y * 20.0));
        color += grid * 0.05;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uRipples: { value: Array(10).fill(new THREE.Vector3(0, 0, -999)) },
      uRippleCount: { value: 0 },
    },
  })

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime

    // Update ripple times
    const currentTime = state.clock.elapsedTime
    const activeRipples = ripples.filter(r => currentTime - r.time < 3)

    setRipples(activeRipples)

    // Update shader uniforms
    material.uniforms.uRippleCount.value = Math.min(activeRipples.length, 10)
    activeRipples.slice(0, 10).forEach((ripple, i) => {
      material.uniforms.uRipples.value[i] = new THREE.Vector3(
        ripple.x,
        ripple.y,
        currentTime - ripple.time
      )
    })
  })

  const handleClick = (event: THREE.Event) => {
    event.stopPropagation()
    const uv = event.uv
    if (uv) {
      setRipples(prev => [...prev, { x: uv.x, y: uv.y, time: Date.now() / 1000 }])
    }
  }

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      material={material}
      onClick={handleClick}
    >
      <planeGeometry args={[10, 10, 128, 128]} />
    </mesh>
  )
}

export default function RippleWaterScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 5, 5], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#001122"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        <RippleWater />

        {/* Instructions */}
        <mesh position={[0, 3, -3]}>
          <planeGeometry args={[4, 1]} />
          <meshBasicMaterial color="#ffffff" opacity={0.1} transparent />
        </mesh>
      </Canvas>
    </div>
  )
}
