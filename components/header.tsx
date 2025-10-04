"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { TransitionLink } from "./transition-link"
import { motion } from "framer-motion"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRef } from "react"
import { AmbientParticles } from "./ambient/ambient-particles"

export function Header() {
  const headerRef = useRef(null)

  useGSAP(() => {
    gsap.from(headerRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      delay: 2,
    })
  }, [])

  return (
    <motion.header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 p-4">
      {/* 3D Background */}
      <div className="absolute inset-0 -z-10">
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
          <color attach="background" args={["#000000"]} />
          <Suspense fallback={null}>
            <AmbientParticles
              count={30}
              size={1.5}
              speed={0.3}
              attraction={0.2}
              mouseInfluence={150}
              color1="#4338ca"
              color2="#7c3aed"
              interactive={true}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Header Content */}
      <div className="container mx-auto flex justify-between items-center bg-black/20 backdrop-blur-md p-4 rounded-full relative z-10">
        <TransitionLink href="/" className="text-white font-bold text-xl">
          ICI
        </TransitionLink>
        <nav className="hidden md:flex items-center gap-6 text-white">
          <TransitionLink href="/#portfolio" className="hover:text-neutral-300 transition-colors">
            Portfolio
          </TransitionLink>
          <TransitionLink href="/3d-showcase" className="hover:text-neutral-300 transition-colors">
            3D Showcase
          </TransitionLink>
          <TransitionLink href="/blog" className="hover:text-neutral-300 transition-colors">
            Blog
          </TransitionLink>
          <TransitionLink href="/contact" className="hover:text-neutral-300 transition-colors">
            Contact
          </TransitionLink>
        </nav>
        <TransitionLink href="/contact">
          <motion.button
            className="bg-white text-black font-semibold py-2 px-5 rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Let's Talk
          </motion.button>
        </TransitionLink>
      </div>
    </motion.header>
  )
}
