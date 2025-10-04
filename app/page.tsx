import { Hero } from "@/components/hero"
import { Portfolio } from "@/components/portfolio"
import { BlogPreview } from "@/components/blog-preview"
import { LinkedInShareButton } from "@/components/LinkedInShareButton"

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
