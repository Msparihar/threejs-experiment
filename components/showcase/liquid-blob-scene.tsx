"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, MeshTransmissionMaterial } from "@react-three/drei"
import * as THREE from "three"

function LiquidBlob() {
  const meshRef = useRef<THREE.Mesh>(null!)

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vPosition;

      // 3D Noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main() {
        vec3 pos = position;

        // Multiple layers of noise for liquid effect
        float noise1 = snoise(pos * 1.5 + uTime * 0.3);
        float noise2 = snoise(pos * 3.0 + uTime * 0.2);
        float noise3 = snoise(pos * 5.0 - uTime * 0.4);

        // Combine noises
        float displacement = noise1 * 0.3 + noise2 * 0.15 + noise3 * 0.1;

        // Displace position along normal
        pos += normal * displacement;

        vNormal = normalize(normalMatrix * normal);
        vPosition = pos;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec3 vNormal;
      varying vec3 vPosition;

      // Fresnel effect
      float fresnel(vec3 viewDirection, vec3 normal, float power) {
        return pow(1.0 - abs(dot(viewDirection, normal)), power);
      }

      void main() {
        vec3 viewDirection = normalize(cameraPosition - vPosition);

        // Fresnel
        float fresnelValue = fresnel(viewDirection, vNormal, 3.0);

        // Color based on position with time animation
        float colorMix = sin(vPosition.y * 2.0 + uTime) * 0.5 + 0.5;
        vec3 color = mix(uColor1, uColor2, colorMix);

        // Add rim light
        color += fresnelValue * vec3(0.5, 0.8, 1.0) * 0.5;

        // Add subtle iridescence
        vec3 iridescence = vec3(
          sin(fresnelValue * 3.14159 + uTime),
          sin(fresnelValue * 3.14159 + uTime + 2.0),
          sin(fresnelValue * 3.14159 + uTime + 4.0)
        ) * 0.2;
        color += iridescence;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color("#6a0dad") },
      uColor2: { value: new THREE.Color("#00ffff") },
    },
  })

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime

    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002
      meshRef.current.rotation.y += 0.003
    }
  })

  return (
    <mesh ref={meshRef} material={material}>
      <icosahedronGeometry args={[1.5, 64]} />
    </mesh>
  )
}

export default function LiquidBlobScene() {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 60 }} 
        style={{ width: '100%', height: '100%', display: 'block' }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6a0dad" />
        <LiquidBlob />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
