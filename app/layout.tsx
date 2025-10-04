import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { GsapProvider } from "@/components/gsap-provider"
import { TransitionProvider } from "@/components/transition-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Manish Singh Parihar - Developer Portfolio",
    template: "%s | Manish Singh Parihar"
  },
  description: "Welcome to my personal portfolio. Explore my projects, skills, and recent blog posts.",
  keywords: ["portfolio", "web development", "Three.js", "Next.js", "GSAP"],
  authors: [{ name: "Manish Singh Parihar" }],
  creator: "Manish Singh Parihar",
  publisher: "Manish Singh Parihar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://threejs-experiment-coral.vercel.app/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Manish Singh Parihar - Innovate. Create. Inspire.',
    description: 'Crafting award-winning digital experiences blending creativity with technology. Explore my portfolio featuring Three.js experiments and innovative web development.',
    url: 'https://threejs-experiment-coral.vercel.app/',
    siteName: 'Manish Singh Parihar',
    images: [
      {
        url: 'https://threejs-experiment-coral.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Manish Singh Parihar - Developer Portfolio Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manish Singh Parihar - Developer Portfolio',
    description: 'Check out my portfolio to see my latest work in web development and more!',
    images: ['https://threejs-experiment-coral.vercel.app/placeholder-logo.png'],
    creator: '@manishparihar',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: 'v0.app',
  icons: {
    icon: '/placeholder-logo.svg',
    shortcut: '/placeholder-logo.svg',
    apple: '/placeholder-logo.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#0a0a0a] text-white">
        <GsapProvider>
          <TransitionProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </TransitionProvider>
        </GsapProvider>
      </body>
    </html>
  )
}
