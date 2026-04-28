import type { Metadata } from 'next'
import { AboutView } from '@/components/about/about-view'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'About | Alto',
  description:
    'Discover Alto’s hospitality concept, our design standards, and the story behind our addresses.',
}

export default function AboutPage() {
  return (
    <>
      <AboutView />
      <Footer />
    </>
  )
}
