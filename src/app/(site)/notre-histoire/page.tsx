import type { Metadata } from 'next'
import { StoryblokStory } from '@storyblok/react/rsc'
import { AboutView, type AboutViewImages } from '@/components/about/about-view'
import { Footer } from '@/components/layout/footer'
import { ApartmentsSection, getApartmentCards } from '@/components/sections/apartments-section'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { getStoryblokPageMetadata } from '@/lib/storyblok-seo'

export async function generateMetadata(): Promise<Metadata> {
  const locale = getStaticServerLocale()
  return getStoryblokPageMetadata('pages/notre-histoire', locale, NOTRE_HISTOIRE_METADATA[locale])
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

  const [globals, apartments] = await Promise.all([
    getStoryblokGlobals(locale),
    getApartmentCards(),
  ])

  return (
    <>
      <AboutView siteImages={getFallbackAboutImages(globals.sharedAssets)} />
      <ApartmentsSection apartments={apartments} />
      <Footer />
    </>
  )
}

function getFallbackAboutImages(sharedAssets: {
  locationAvatars: { src: string }[]
  travelerAvatars: { src: string }[]
}): AboutViewImages {
  return {
    shared: {
      locationAvatars: [
        sharedAssets.locationAvatars[0]?.src ?? '/images/blog-1.jpg',
        sharedAssets.locationAvatars[1]?.src ?? '/images/hero-home.webp',
        sharedAssets.locationAvatars[2]?.src ?? '/images/blog-3.jpg',
      ],
      travelerAvatars: [
        sharedAssets.travelerAvatars[0]?.src ?? '/images/avatars/voyageur-1.png',
        sharedAssets.travelerAvatars[1]?.src ?? '/images/avatars/voyageur-2.png',
        sharedAssets.travelerAvatars[2]?.src ?? '/images/avatars/voyageur-3.png',
      ],
    },
    about: {
      conceptLounge: '/images/about/about-hero.webp',
      conceptChair: '/images/alto-salon.jpg',
      conceptCorridor: '/images/about/concept-corridor.jpg',
      founders: {
        paul: '/images/about/founder-paul.jpg',
        mayeul: '/images/about/founder-mayeul.jpg',
        benjamin: '/images/about/founder-benjamin.jpg',
      },
    },
  }
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
