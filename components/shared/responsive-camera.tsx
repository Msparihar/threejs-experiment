"use client"

import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

interface ResponsiveCameraProps {
  baseFov?: number
  minFov?: number
  maxFov?: number
}

export function ResponsiveCamera({ 
  baseFov = 50, 
  minFov = 45, 
  maxFov = 75 
}: ResponsiveCameraProps) {
  const { camera, size, viewport } = useThree()

  useEffect(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera
    perspectiveCamera.aspect = size.width / size.height
    
    // Adjust FOV based on viewport aspect ratio to ensure proper scaling
    const aspectRatio = size.width / size.height
    let adjustedFov = baseFov
    
    // For very wide screens, reduce FOV slightly
    if (aspectRatio > 2) {
      adjustedFov = baseFov * 0.9
    }
    // For very tall screens (mobile portrait), increase FOV
    else if (aspectRatio < 0.7) {
      adjustedFov = baseFov * 1.2
    }
    
    // Clamp to min/max values
    perspectiveCamera.fov = Math.max(minFov, Math.min(maxFov, adjustedFov))
    perspectiveCamera.updateProjectionMatrix()
  }, [camera, size, viewport, baseFov, minFov, maxFov])

  return null
}