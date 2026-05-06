import type { Metadata } from 'next'
import { AboutView } from '@/components/about/about-view'
import { Footer } from '@/components/layout/footer'
import { getSiteImages } from '@/lib/storyblok-site-images'

export const metadata: Metadata = {
  title: 'About | Alto',
  description:
    'Discover Alto’s hospitality concept, our design standards, and the story behind our addresses.',
}

export default async function AboutPage() {
  const siteImages = await getSiteImages()

  return (
    <>
      <AboutView siteImages={siteImages} />
      <Footer />
    </>
  )
}
