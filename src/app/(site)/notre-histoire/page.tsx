import type { Metadata } from 'next'
import { AboutView } from '@/components/about/about-view'
import { Footer } from '@/components/layout/footer'
import { getSiteImages } from '@/lib/storyblok-site-images'

export const metadata: Metadata = {
  title: 'Notre histoire | Alto',
  description:
    'Découvrez le concept Alto, notre approche de l’hospitalité et les standards qui guident chaque adresse.',
}

export default async function NotreHistoirePage() {
  const siteImages = await getSiteImages()

  return (
    <>
      <AboutView siteImages={siteImages} />
      <Footer />
    </>
  )
}
