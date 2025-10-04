"use client"

import { useEffect, useState, useMemo } from "react"

// Device performance levels
export enum PerformanceLevel {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// Performance presets for different devices
const PerformancePresets = {
  [PerformanceLevel.HIGH]: {
    particleCount: 1.0,
    quality: 1.0,
    shadowMapSize: 2048,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  },
  [PerformanceLevel.MEDIUM]: {
    particleCount: 0.6,
    quality: 0.7,
    shadowMapSize: 1024,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
  },
  [PerformanceLevel.LOW]: {
    particleCount: 0.3,
    quality: 0.5,
    shadowMapSize: 512,
    pixelRatio: 1,
  },
}

export function usePerformanceOptimization() {
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>(
    PerformanceLevel.HIGH
  )
  const [isMobile, setIsMobile] = useState(false)
  const [isLowEnd, setIsLowEnd] = useState(false)

  // Detect device capabilities
  useEffect(() => {
    const detectDevice = () => {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

      if (!gl) {
        setPerformanceLevel(PerformanceLevel.LOW)
        setIsLowEnd(true)
        return
      }

      const webglContext = gl as WebGLRenderingContext

      // Check for mobile devices
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        )
      setIsMobile(isMobileDevice)

      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 2

      // Check GPU capabilities (with error handling)
      let renderer = "Unknown"
      try {
        const debugInfo = webglContext.getExtension("WEBGL_debug_renderer_info")
        if (debugInfo) {
          renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string || "Unknown"
        }
      } catch (error) {
        console.warn("Could not detect GPU info:", error)
      }

      // Determine performance level based on device capabilities
      if (isMobileDevice) {
        // Mobile devices
        if (cores <= 4) {
          setPerformanceLevel(PerformanceLevel.LOW)
        } else {
          setPerformanceLevel(PerformanceLevel.MEDIUM)
        }
      } else {
        // Desktop devices
        if (cores <= 2 || renderer.includes("Intel")) {
          setPerformanceLevel(PerformanceLevel.MEDIUM)
        } else if (cores >= 8 && !renderer.includes("Intel")) {
          setPerformanceLevel(PerformanceLevel.HIGH)
        } else {
          setPerformanceLevel(PerformanceLevel.MEDIUM)
        }
      }

      // Override for very low-end devices
      try {
        if (cores <= 2 || (!webglContext.getExtension("OES_standard_derivatives") && isMobileDevice)) {
          setIsLowEnd(true)
          setPerformanceLevel(PerformanceLevel.LOW)
        }
      } catch (error) {
        console.warn("Could not check WebGL extensions:", error)
      }
    }

    detectDevice()
  }, [])

  // Get optimized settings based on performance level
  const settings = useMemo(() => {
    const preset = PerformancePresets[performanceLevel]

    return {
      particleCount: Math.floor(50 * preset.particleCount),
      size: 2.0 * preset.quality,
      speed: 0.5 * preset.quality,
      attraction: 0.3 * preset.quality,
      mouseInfluence: 200 * preset.quality,
      quality: preset.quality,
      pixelRatio: preset.pixelRatio,
      shadowMapSize: preset.shadowMapSize,
      enablePostProcessing: preset.quality > 0.7,
      enableShadows: preset.quality > 0.8,
    }
  }, [performanceLevel])

  return {
    performanceLevel,
    settings,
    isMobile,
    isLowEnd,
    // Utility functions
    optimizeParticleCount: (baseCount: number) => Math.floor(baseCount * settings.particleCount / 50),
    shouldUseLOD: (distance: number) => {
      // Use LOD for objects beyond certain distance based on performance
      const lodDistance = isLowEnd ? 10 : isMobile ? 15 : 20
      return distance > lodDistance
    },
    getOptimizedProps: (baseProps: Record<string, any>) => {
      if (isLowEnd) {
        return {
          ...baseProps,
          count: Math.floor((baseProps.count || 50) * 0.3),
          interactive: false,
        }
      } else if (isMobile) {
        return {
          ...baseProps,
          count: Math.floor((baseProps.count || 50) * 0.6),
        }
      }
      return baseProps
    },
  }
}

// Hook for lazy loading 3D components
export function useLazyLoad3D(threshold = 100) {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // Load 3D content when element is near viewport
          if (entry.boundingClientRect.top < window.innerHeight + threshold) {
            setShouldLoad(true)
          }
        }
      },
      { threshold: 0.1 }
    )

    // Observe all potential 3D containers
    const containers = document.querySelectorAll("[data-3d-container]")
    containers.forEach((container) => observer.observe(container))

    return () => observer.disconnect()
  }, [threshold])

  return { shouldLoad, isVisible }
}

// Memory management utilities
export function useMemoryCleanup() {
  useEffect(() => {
    const cleanup = () => {
      // Force garbage collection if available (development only)
      if (typeof window !== "undefined" && (window as any).gc) {
        (window as any).gc()
      }
    }

    // Cleanup on page unload
    window.addEventListener("beforeunload", cleanup)

    // Periodic cleanup for long sessions
    const interval = setInterval(cleanup, 30000) // Every 30 seconds

    return () => {
      window.removeEventListener("beforeunload", cleanup)
      clearInterval(interval)
    }
  }, [])
}
