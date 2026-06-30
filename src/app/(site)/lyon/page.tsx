import type { Metadata } from 'next'
import { StoryblokStory } from '@storyblok/react/rsc'
import { LyonHeroSection } from '@/components/sections/lyon-hero-section'
import { StatsSection } from '@/components/sections/stats-section'
import { LyonApartmentsSection } from '@/components/sections/lyon-apartments-section'
import { getApartmentsForSearch } from '@/components/sections/apartments-section'
import { LyonServicesSection } from '@/components/sections/lyon-services-section'
import { LyonQuartiersSection } from '@/components/sections/lyon-quartiers-section'
import { LyonBlogSection } from '@/components/sections/lyon-blog-section'
import { FaqSection } from '@/components/sections/faq-section'
import { Footer } from '@/components/layout/footer'
import { StickyCta } from '@/components/ui/sticky-cta'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { getStoryblokPageMetadata } from '@/lib/storyblok-seo'

const LYON_METADATA: Record<'fr' | 'en', Metadata> = {
  fr: {
    title: 'Alto Lyon - Appartements de charme à Lyon',
    description:
      'Découvrez nos appartements soignés dans les plus beaux quartiers de Lyon : Bellecour, Vieux Lyon, Terreaux.',
  },
  en: {
    title: 'Alto Lyon - Design apartments in Lyon',
    description:
      'Discover our curated apartments in Lyon’s best districts: Bellecour, Vieux Lyon and Terreaux.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getStaticServerLocale()
  return getStoryblokPageMetadata('pages/lyon', locale, LYON_METADATA[locale])
}

export default async function LyonPage() {
  const locale = getStaticServerLocale()
  const story = await getStoryBySlug('pages/lyon', locale)

  if (
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0
  ) {
    return (
      <>
        <StoryblokStory story={story} />
        <Footer reserveStickyCtaSpace />
        <StickyCta />
      </>
    )
  }

  const [articles, lyonApartments] = await Promise.all([
    getBlogArticles(locale),
    getApartmentsForSearch({ city: 'lyon' }),
  ])

  return (
    <>
      <main>
        <LyonHeroSection backgroundImage={LYON_FALLBACK_IMAGES.heroBackground} />
        <StatsSection
          pressLogo={LYON_FALLBACK_IMAGES.pressLogo}
          monocleLogo={LYON_FALLBACK_IMAGES.monocleLogo}
        />
        <LyonApartmentsSection apartments={lyonApartments.slice(0, 3)} />
        <LyonServicesSection image={LYON_FALLBACK_IMAGES.servicesImage} />
        <LyonQuartiersSection
          images={{
            bellecour: LYON_FALLBACK_IMAGES.bellecour,
            vieuxLyon: LYON_FALLBACK_IMAGES.vieuxLyon,
            terreaux: LYON_FALLBACK_IMAGES.terreaux,
          }}
        />
        <LyonBlogSection articles={articles.filter((article) => article.section === 'lyon')} />
        <FaqSection />
      </main>
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}

const LYON_FALLBACK_IMAGES = {
  heroBackground: '/images/lyon/hero-lyon.jpg',
  bellecour: '/images/lyon/apt-bellecour.jpg',
  vieuxLyon: '/images/lyon/apt-vieux-lyon.jpg',
  terreaux: '/images/lyon/apt-terreaux.jpg',
  servicesImage: '/images/lyon/services-image.jpg',
  pressLogo: '/images/lyon/press-logo.png',
  monocleLogo: '/images/lyon/monocle-logo.png',
} as const
