import type { Metadata } from 'next'
import { AboutView } from '@/components/about/about-view'
import { Footer } from '@/components/layout/footer'
import { ApartmentsSection, getApartments } from '@/components/sections/apartments-section'
import { getServerLocale } from '@/lib/i18n/server'
import { getSiteImages } from '@/lib/storyblok-site-images'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  return ABOUT_METADATA[locale]
}

export default async function AboutPage() {
  const locale = await getServerLocale()
  const [siteImages, apartments] = await Promise.all([getSiteImages(locale), getApartments()])

  return (
    <>
      <AboutView siteImages={siteImages} />
      <ApartmentsSection apartments={apartments} />
      <Footer />
    </>
  )
}

const ABOUT_METADATA = {
  fr: {
    title: 'À propos | Alto',
    description:
      'Découvrez le concept Alto, notre approche de l’hospitalité et les standards qui guident chaque adresse.',
  },
  en: {
    title: 'About | Alto',
    description:
      'Discover Alto’s hospitality concept, design standards, and the story behind each address.',
  },
} as const
