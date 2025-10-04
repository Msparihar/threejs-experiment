"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import Image from "next/image"
import { motion } from "framer-motion"
import TransitionLink from "./transition-link"
import { AmbientParticles } from "./ambient/ambient-particles"

const projects = [
  {
    title: "Project Cyberscape",
    description: "A journey into a futuristic digital realm.",
    imgSrc: "/images/project-cyberscape.png",
    href: "/portfolio/project-cyberscape",
  },
  {
    title: "Ethereal Threads",
    description: "Weaving light and color into abstract art.",
    imgSrc: "/images/ethereal-threads.png",
    href: "/portfolio/ethereal-threads",
  },
  {
    title: "Quantum Leap",
    description: "Exploring the boundaries of space and time.",
    imgSrc: "/images/quantum-leap.png",
    href: "/portfolio/quantum-leap",
  },
]

export function Portfolio() {
  return (
    <div id="portfolio" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 -z-10">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
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
              count={50}
              size={1.8}
              speed={0.4}
              attraction={0.15}
              mouseInfluence={250}
              color1="#6366f1"
              color2="#8b5cf6"
              interactive={true}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Portfolio Content */}
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Our Creations</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-400">
            A selection of projects that define our passion for digital art.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <TransitionLink href={project.href}>
                <div className="group relative block w-full h-[450px] overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={project.imgSrc || "/placeholder.svg"}
                    fill
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                    <p className="text-neutral-300">{project.description}</p>
                  </div>
                </div>
              </TransitionLink>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
