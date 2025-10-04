"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { TransitionContext } from "@/context/transition-context"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useRef, useState } from "react"
import { TransitionOverlay, TransitionConfigs } from "./ambient/transition-overlay"

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(0)

  // Determine transition type based on current and target paths
  const getTransitionType = (currentPath: string, targetPath: string): number => {
    // Hero to Portfolio: Liquid transition
    if (currentPath === "/" && targetPath.includes("portfolio")) {
      return 1.0 // liquid
    }
    // Portfolio to Blog: Geometric transition
    if (currentPath.includes("portfolio") && targetPath.includes("blog")) {
      return 2.0 // geometric
    }
    // Default: Dissolve transition
    return 0.0 // dissolve
  }

  const playTransition = (href: string) => {
    const currentPath = pathname
    const targetPath = href.split("#")[0]

    if (href === currentPath || (targetPath === currentPath && href.includes("#"))) {
      return
    }

    setIsTransitioning(true)
    const transitionType = getTransitionType(currentPath, targetPath)

    const timeline = gsap.timeline({
      onComplete: () => {
        router.push(href)
        setTimeout(() => {
          setIsTransitioning(false)
          setTransitionProgress(0)
        }, 100)
      },
    })

    // Animate transition progress
    timeline.to(
      { progress: 0 },
      {
        progress: 1,
        duration: 0.8,
        ease: "power2.inOut",
        onUpdate: function() {
          setTransitionProgress(this.targets()[0].progress)
        },
      }
    )

    // Animate container
    timeline.to(
      containerRef.current,
      {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power3.in",
      },
      0
    )
  }

  useGSAP(
    () => {
      if (!isTransitioning) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            onComplete: () => {
              const hash = window.location.hash
              if (hash) {
                const targetElement = document.querySelector(hash)
                if (targetElement) {
                  gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: targetElement, autoKill: false },
                    ease: "power2.inOut",
                    delay: 0.1,
                  })
                }
              } else {
                window.scrollTo(0, 0)
              }
            },
          },
        )
      }
    },
    { dependencies: [pathname, isTransitioning] },
  )

  return (
    <TransitionContext.Provider value={{ playTransition }}>
      <div ref={containerRef} className="relative">
        {children}

        {/* 3D Transition Overlay */}
        {isTransitioning && (
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 75 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none"
              }}
            >
              <color attach="background" args={["#0000"]} />
              <Suspense fallback={null}>
                <TransitionOverlay
                  progress={transitionProgress}
                  transitionType={getTransitionType(pathname, "")}
                  color1="#1e1b4b"
                  color2="#312e81"
                  opacity={0.8}
                />
              </Suspense>
            </Canvas>
          </div>
        )}
      </div>
    </TransitionContext.Provider>
  )
}
