"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { CubeTextureLoader } from "three"
import * as THREE from "three"

function GlassRefraction() {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Create environment cube texture for reflections/refractions
  const envMap = useMemo(() => {
    const cubeTexture = new THREE.CubeTextureLoader().load([
      // Generate simple gradient cube map
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    ])
    return cubeTexture
  }, [])

  const glassMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        varying vec2 vUv;

        void main() {
          vUv = uv;

          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;

          vWorldNormal = normalize(normalMatrix * normal);

          vec3 cameraWorldPosition = (inverse(viewMatrix) * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          vViewDirection = normalize(cameraWorldPosition - worldPosition.xyz);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uRefractiveIndex;
        uniform float uChromaticAberration;
        uniform samplerCube uEnvMap;

        varying vec3 vWorldPosition;
        varying vec3 vWorldNormal;
        varying vec3 vViewDirection;
        varying vec2 vUv;

        vec3 getRefractionColor(vec3 direction, vec3 normal, float ior) {
          vec3 refracted = refract(direction, normal, 1.0 / ior);
          return textureCube(uEnvMap, refracted).rgb;
        }

        void main() {
          vec3 normal = normalize(vWorldNormal);
          vec3 viewDir = normalize(vViewDirection);

          // Fresnel effect
          float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

          // Reflection
          vec3 reflected = reflect(-viewDir, normal);
          vec3 reflectionColor = textureCube(uEnvMap, reflected).rgb;

          // Chromatic aberration for refraction
          float iorR = uRefractiveIndex + uChromaticAberration;
          float iorG = uRefractiveIndex;
          float iorB = uRefractiveIndex - uChromaticAberration;

          vec3 refractionColorR = getRefractionColor(-viewDir, normal, iorR);
          vec3 refractionColorG = getRefractionColor(-viewDir, normal, iorG);
          vec3 refractionColorB = getRefractionColor(-viewDir, normal, iorB);

          vec3 refractionColor = vec3(refractionColorR.r, refractionColorG.g, refractionColorB.b);

          // Add some animated distortion
          vec2 distortion = vec2(
            sin(vUv.x * 10.0 + uTime) * 0.01,
            cos(vUv.y * 10.0 + uTime) * 0.01
          );

          vec3 distortedRefraction = getRefractionColor(-viewDir, normal + vec3(distortion, 0.0), uRefractiveIndex);
          refractionColor = mix(refractionColor, distortedRefraction, 0.3);

          // Mix reflection and refraction based on fresnel
          vec3 finalColor = mix(refractionColor, reflectionColor, fresnel);

          // Add slight blue tint to simulate glass
          finalColor *= vec3(0.9, 0.95, 1.0);

          // Add edge highlighting
          float edge = 1.0 - abs(dot(viewDir, normal));
          finalColor += edge * vec3(0.2, 0.4, 1.0) * 0.5;

          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uRefractiveIndex: { value: 1.52 }, // Glass
        uChromaticAberration: { value: 0.02 },
        uEnvMap: { value: envMap },
      },
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [envMap])

  // Background environment
  const backgroundMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;

          // Create animated gradient background
          vec3 color1 = vec3(0.1, 0.2, 0.8);
          vec3 color2 = vec3(0.8, 0.2, 0.8);
          vec3 color3 = vec3(0.2, 0.8, 0.4);

          float pattern1 = sin(uv.x * 5.0 + uTime) * 0.5 + 0.5;
          float pattern2 = cos(uv.y * 3.0 + uTime * 0.8) * 0.5 + 0.5;

          vec3 color = mix(color1, color2, pattern1);
          color = mix(color, color3, pattern2);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      side: THREE.BackSide,
    })
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    glassMaterial.uniforms.uTime.value = time
    backgroundMaterial.uniforms.uTime.value = time

    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.3
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2
    }
  })

  return (
    <group>
      {/* Background sphere */}
      <mesh material={backgroundMaterial}>
        <sphereGeometry args={[10, 32, 32]} />
      </mesh>

      {/* Glass objects */}
      <mesh ref={meshRef} material={glassMaterial} position={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.6, 32, 64]} />
      </mesh>

      <mesh material={glassMaterial} position={[-2, 1, 1]}>
        <sphereGeometry args={[0.8, 32, 32]} />
      </mesh>

      <mesh material={glassMaterial} position={[2, -1, -1]}>
        <octahedronGeometry args={[1]} />
      </mesh>
    </group>
  )
}

export default function GlassRefractionScene() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={["#000"]} />
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, 5]} intensity={0.5} color="#ff6600" />
        <GlassRefraction />
      </Canvas>
    </div>
  )
}
