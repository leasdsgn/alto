import type { Metadata } from 'next'
import { StoryblokStory } from '@storyblok/react/rsc'
import { AboutView } from '@/components/about/about-view'
import { Footer } from '@/components/layout/footer'
import { ApartmentsSection, getApartmentCards } from '@/components/sections/apartments-section'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getSiteImages } from '@/lib/storyblok-site-images'
import { getStoryBySlug } from '@/lib/storyblok-page'

export async function generateMetadata(): Promise<Metadata> {
  const locale = getStaticServerLocale()
  return NOTRE_HISTOIRE_METADATA[locale]
}

export default async function NotreHistoirePage() {
  const locale = getStaticServerLocale()
  const story = await getStoryBySlug('pages/notre-histoire', locale)

  if (
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0
  ) {
    return (
      <>
        <StoryblokStory story={story} />
        <Footer />
      </>
    )
  }

  const [siteImages, apartments] = await Promise.all([getSiteImages(locale), getApartmentCards()])

  return (
    <>
      <AboutView siteImages={siteImages} />
      <ApartmentsSection apartments={apartments} />
      <Footer />
    </>
  )
}

const NOTRE_HISTOIRE_METADATA = {
  fr: {
    title: 'Notre histoire | Alto',
    description:
      'Découvrez le concept Alto, notre approche de l’hospitalité et les standards qui guident chaque adresse.',
  },
  en: {
    title: 'Our story | Alto',
    description:
      'Discover Alto’s hospitality concept, design standards, and the story behind each address.',
  },
} as const
