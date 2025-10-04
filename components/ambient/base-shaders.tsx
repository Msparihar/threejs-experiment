"use client"

import * as THREE from "three"

// Base Particle Shader Material - Reusable for all particle effects
export const BaseParticleShader = new THREE.ShaderMaterial({
  vertexShader: `
    uniform float uTime;
    uniform float uSize;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uSpeed;
    uniform float uAttraction;
    uniform vec2 uMouse;
    uniform float uMouseInfluence;

    attribute vec3 offset;
    attribute float scale;
    attribute float phase;

    varying vec3 vColor;
    varying float vAlpha;

    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec3 pos = position;

      // Apply offset
      pos += offset;

      // Mouse interaction
      vec2 mouseDir = uMouse - pos.xy;
      float mouseDist = length(mouseDir);
      float mouseInfluence = (1.0 - smoothstep(0.0, uMouseInfluence, mouseDist)) * uAttraction;

      // Gentle movement toward mouse
      pos.xy += normalize(mouseDir) * mouseInfluence * 0.01;

      // Subtle floating animation
      pos.x += sin(uTime * uSpeed + phase) * 0.1;
      pos.y += cos(uTime * uSpeed * 0.8 + phase) * 0.1;
      pos.z += sin(uTime * uSpeed * 0.6 + phase) * 0.05;

      // Scale variation
      float finalScale = uSize * (0.8 + scale * 0.4);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = finalScale * (300.0 / -mvPosition.z);

      // Color based on position and time
      float colorMix = sin(uTime * 0.5 + phase) * 0.5 + 0.5;
      vColor = mix(uColor1, uColor2, colorMix);

      // Alpha based on distance from center and mouse interaction
      vAlpha = (1.0 - smoothstep(0.0, 0.8, length(pos.xy))) * (0.3 + mouseInfluence * 0.7);

      // Size attenuation for distance
      gl_PointSize *= (1.0 - smoothstep(0.0, 5.0, length(pos)));
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Circular particles
      float dist = length(gl_PointCoord - vec2(0.5));
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

      gl_FragColor = vec4(vColor, alpha * vAlpha);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
    uSize: { value: 2.0 },
    uColor1: { value: new THREE.Color("#4338ca") },
    uColor2: { value: new THREE.Color("#7c3aed") },
    uSpeed: { value: 0.5 },
    uAttraction: { value: 0.3 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseInfluence: { value: 200.0 },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
})

// Base Glow Shader Material - For glow effects
export const BaseGlowShader = new THREE.ShaderMaterial({
  vertexShader: `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec2 uMouse;
    uniform float uMouseInfluence;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vGlowIntensity;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;

      vec3 pos = position;

      // Mouse interaction
      vec2 mouseDir = uMouse - pos.xy;
      float mouseDist = length(mouseDir);
      float mouseEffect = (1.0 - smoothstep(0.0, uMouseInfluence, mouseDist));

      // Gentle pulsing and mouse-responsive movement
      float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
      pos.z += pulse * uIntensity * 0.1 + mouseEffect * 0.05;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

      // Glow intensity based on mouse proximity and pulse
      vGlowIntensity = (pulse * 0.5 + 0.5) * uIntensity * (1.0 + mouseEffect * 0.5);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uOpacity;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vGlowIntensity;

    void main() {
      // Color mixing based on position and time
      float mixValue = sin(vUv.x * 3.0 + uTime) * 0.5 + 0.5;
      vec3 color = mix(uColor1, uColor2, mixValue);

      // Fresnel-like glow effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);

      // Combine effects
      float finalGlow = fresnel * vGlowIntensity;
      float alpha = finalGlow * uOpacity;

      gl_FragColor = vec4(color, alpha);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uColor1: { value: new THREE.Color("#8b5cf6") },
    uColor2: { value: new THREE.Color("#06b6d4") },
    uOpacity: { value: 0.6 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uMouseInfluence: { value: 300.0 },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
})

// Base Transition Shader Material - For section transitions
export const BaseTransitionShader = new THREE.ShaderMaterial({
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uMouse;
    uniform float uTransitionType; // 0: dissolve, 1: liquid, 2: geometric

    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vDisplacement;

    // Noise function for organic transitions
    float noise(vec3 pos) {
      return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
      vUv = uv;
      vPosition = position;

      vec3 pos = position;

      // Different transition effects based on type
      if (uTransitionType < 0.5) {
        // Dissolve effect
        float n = noise(pos * 3.0 + uTime * 0.5);
        float dissolve = smoothstep(uProgress - 0.1, uProgress + 0.1, n);
        pos.z += dissolve * 0.5;
        vDisplacement = dissolve;
      } else if (uTransitionType < 1.5) {
        // Liquid flow effect
        float wave = sin(pos.x * 5.0 + uTime * 2.0) * cos(pos.y * 3.0 + uTime * 1.5);
        float flow = smoothstep(0.0, 1.0, uProgress + wave * 0.3);
        pos.y += flow * 0.3;
        vDisplacement = flow;
      } else {
        // Geometric morphing effect
        float morph = smoothstep(uProgress - 0.2, uProgress + 0.2, sin(pos.x * 2.0) * cos(pos.y * 2.0));
        pos.z += morph * 0.4;
        vDisplacement = morph;
      }

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uOpacity;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying float vDisplacement;

    void main() {
      // Color transition based on progress
      vec3 color = mix(uColor1, uColor2, smoothstep(0.3, 0.7, uProgress));

      // Add some shimmer based on displacement
      float shimmer = sin(vDisplacement * 10.0 + uTime * 3.0) * 0.5 + 0.5;
      color += shimmer * 0.2;

      float alpha = vDisplacement * uOpacity;

      gl_FragColor = vec4(color, alpha);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0.0 },
    uColor1: { value: new THREE.Color("#1e1b4b") },
    uColor2: { value: new THREE.Color("#312e81") },
    uOpacity: { value: 0.8 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTransitionType: { value: 0.0 },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  side: THREE.DoubleSide,
})
