"use client"

import { useState, Suspense, lazy, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

// Lazy load scenes
const FlowFieldScene = lazy(() => import("@/components/showcase/flow-field-scene"))
const HolographicScene = lazy(() => import("@/components/showcase/holographic-scene"))
const LiquidBlobScene = lazy(() => import("@/components/showcase/liquid-blob-scene"))
const DNAHelixScene = lazy(() => import("@/components/showcase/dna-helix-scene"))
const ShapeMorpherScene = lazy(() => import("@/components/showcase/shape-morpher-scene"))
const RippleWaterScene = lazy(() => import("@/components/showcase/ripple-water-scene"))
const GalaxyScene = lazy(() => import("@/components/showcase/galaxy-scene"))
const IridescentScene = lazy(() => import("@/components/showcase/iridescent-scene"))
const AuroraScene = lazy(() => import("@/components/showcase/aurora-scene"))
const TwistedRibbonScene = lazy(() => import("@/components/showcase/twisted-ribbon-scene"))
const DissolveEffectScene = lazy(() => import("@/components/showcase/dissolve-effect-scene"))
const GlassRefractionScene = lazy(() => import("@/components/showcase/glass-refraction-scene"))
const KaleidoscopeScene = lazy(() => import("@/components/showcase/kaleidoscope-scene"))
const TextParticlesScene = lazy(() => import("@/components/showcase/text-particles-scene"))

// Scene data
const scenes = [
  {
    id: "flow-field",
    title: "Dreamy Flow Field",
    description: "GPGPU particle system with flow field noise and glowing trails",
    category: "Particles",
    component: FlowFieldScene,
  },
  {
    id: "dissolve",
    title: "Dissolve Effect",
    description: "Mesh dissolving into particles with selective bloom",
    category: "Particles",
    component: DissolveEffectScene,
  },
  {
    id: "aurora",
    title: "Aurora Borealis",
    description: "Wavy particle curtains with color gradients",
    category: "Particles",
    component: AuroraScene,
  },
  {
    id: "galaxy",
    title: "Galaxy Spiral",
    description: "Rotating spiral particle system",
    category: "Particles",
    component: GalaxyScene,
  },
  {
    id: "holographic",
    title: "Holographic Cube",
    description: "Fresnel-based hologram with animated scanlines",
    category: "Shaders",
    component: HolographicScene,
  },
  {
    id: "iridescent",
    title: "Iridescent Sphere",
    description: "Thin-film interference creating rainbow effects",
    category: "Shaders",
    component: IridescentScene,
  },
  {
    id: "glass",
    title: "Glass Refraction",
    description: "Advanced refraction with chromatic dispersion",
    category: "Shaders",
    component: GlassRefractionScene,
  },
  {
    id: "liquid-blob",
    title: "Liquid Blob",
    description: "Metaball shader with noise displacement",
    category: "Shaders",
    component: LiquidBlobScene,
  },
  {
    id: "morpher",
    title: "Shape Morpher",
    description: "Smooth transitions between geometric forms",
    category: "Geometry",
    component: ShapeMorpherScene,
  },
  {
    id: "dna-helix",
    title: "DNA Helix",
    description: "Animated double helix structure",
    category: "Geometry",
    component: DNAHelixScene,
  },
  {
    id: "twisted-ribbon",
    title: "Twisted Ribbon",
    description: "Parametric curve with vertex displacement",
    category: "Geometry",
    component: TwistedRibbonScene,
  },
  {
    id: "kaleidoscope",
    title: "Kaleidoscope",
    description: "Mirrored geometry with fractal patterns",
    category: "Geometry",
    component: KaleidoscopeScene,
  },
  {
    id: "ripple-water",
    title: "Ripple Water",
    description: "Interactive water shader with click-to-ripple",
    category: "Interactive",
    component: RippleWaterScene,
  },
  {
    id: "text-particles",
    title: "Text Particles",
    description: "3D text dissolving into particles on hover",
    category: "Interactive",
    component: TextParticlesScene,
  },
]

export default function ShowcasePage() {
  const [selectedScene, setSelectedScene] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("All")
  const modalRef = useRef<HTMLDivElement>(null!)

  const categories = ["All", "Particles", "Shaders", "Geometry", "Interactive"]

  const filteredScenes = filter === "All"
    ? scenes
    : scenes.filter(scene => scene.category === filter)

  const selectedSceneData = scenes.find(s => s.id === selectedScene)

  // Prevent body scroll when modal is open and reset scroll position
  useEffect(() => {
    if (selectedScene) {
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = `-${window.scrollY}px`
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.top = ""
    }
  }, [selectedScene])

  // Force Canvas resize when modal opens
  useEffect(() => {
    if (selectedScene && modalRef.current) {
      // Trigger window resize to force Three.js to recalculate
      const triggerResize = () => {
        window.dispatchEvent(new Event('resize'))
      }

      // Trigger multiple times to ensure canvas picks up the correct size
      const timeouts = [
        setTimeout(triggerResize, 50),
        setTimeout(triggerResize, 150),
        setTimeout(triggerResize, 300)
      ]

      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout))
      }
    }
  }, [selectedScene])

  return (
    <>
      <div className="min-h-screen bg-black text-white pt-24 pb-16 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4">3D Showcase</h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Explore interactive 3D effects powered by WebGL, Three.js, and custom shaders
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-4 mb-12 flex-wrap"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full transition-all ${
                  filter === cat
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-white hover:bg-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Gallery Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
          {filteredScenes.map((scene, index) => (
            <motion.div
              key={scene.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedScene(scene.id)}
              className="group relative bg-neutral-900 rounded-2xl overflow-hidden cursor-pointer border border-neutral-800 hover:border-neutral-600 transition-all"
            >
              {/* Preview Container */}
              <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {scene.category === "Particles" && "✨"}
                  {scene.category === "Shaders" && "🌈"}
                  {scene.category === "Geometry" && "🔷"}
                  {scene.category === "Interactive" && "🎯"}
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="text-xs text-purple-400 mb-2">{scene.category}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {scene.title}
                </h3>
                <p className="text-sm text-neutral-400">{scene.description}</p>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-transparent transition-all pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
        </div>
      </div>

      {/* Modal for Full-Screen View - Rendered outside container to avoid transform context issues */}
      <AnimatePresence>
        {selectedScene && selectedSceneData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
            style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}
            onClick={() => setSelectedScene(null)}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute inset-0 bg-black overflow-hidden"
              style={{ width: '100%', height: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
                {/* 3D Scene Container - must be first for proper z-index layering */}
                <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
                  {selectedSceneData.component ? (
                    <Suspense fallback={
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-4">⚡</div>
                          <p className="text-xl text-neutral-400">Loading...</p>
                        </div>
                      </div>
                    }>
                      <div className="w-full h-full modal-canvas-container">
                        <selectedSceneData.component />
                      </div>
                    </Suspense>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🚧</div>
                        <p className="text-xl text-neutral-400">Coming Soon</p>
                        <p className="text-sm text-neutral-600 mt-2">
                          This effect is being crafted...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedScene(null)}
                  className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-all"
                >
                  <X size={24} />
                </button>

                {/* Scene Info */}
                <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-8 pointer-events-none">
                  <div className="text-sm text-purple-400 mb-2">{selectedSceneData.category}</div>
                  <h2 className="text-3xl font-bold mb-2">{selectedSceneData.title}</h2>
                  <p className="text-neutral-300">{selectedSceneData.description}</p>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
