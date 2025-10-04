import { Hero } from "@/components/hero"
import { Portfolio } from "@/components/portfolio"
import { BlogPreview } from "@/components/blog-preview"
import { LinkedInShareButton } from "@/components/LinkedInShareButton"

// Metadata for LinkedIn sharing
export const metadata = {
  title: 'Manish Singh Parihar - Developer Portfolio',
  description: 'Welcome to my personal portfolio. Explore my projects, skills, and recent blog posts.',
  openGraph: {
    title: 'Manish Singh Parihar - Developer Portfolio',
    description: 'Check out my portfolio to see my latest work in web development and more!',
    url: 'https://threejs-experiment-2lg31smy6-msparihars-projects.vercel.app/',
    siteName: 'My Portfolio',
    images: [
      {
        url: 'https://threejs-experiment-2lg31smy6-msparihars-projects.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function Home() {
  return (
    <>
      <Hero />
      <Portfolio />
      <BlogPreview />

      {/* LinkedIn Share Button Section */}
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Enjoyed my work?</h2>
        <p>Share my portfolio with your network!</p>
        <LinkedInShareButton />
      </div>
    </>
  )
}
