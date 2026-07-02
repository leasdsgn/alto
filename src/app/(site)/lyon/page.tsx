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
import { JsonLd } from '@/components/seo/json-ld'
import { InternalLinkSection } from '@/components/seo/internal-link-section'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { buildBreadcrumbJsonLd, defineSeoMetadata } from '@/lib/seo'

const LYON_METADATA: Record<'fr' | 'en', { title: string; description: string }> = {
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
  return defineSeoMetadata({
    ...LYON_METADATA[locale],
    path: '/lyon',
    image: LYON_FALLBACK_IMAGES.heroBackground,
  })
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
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: 'Accueil', path: '/' },
            { name: 'Lyon', path: '/lyon' },
          ])}
        />
        <StoryblokStory story={story} />
        <LyonInternalLinks />
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
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Lyon', path: '/lyon' },
        ])}
      />
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
      <LyonInternalLinks />
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}

function LyonInternalLinks() {
  return (
    <div className="max-w-content px-gutter pb-section md:px-gutter-md mx-auto w-full">
      <InternalLinkSection
        eyebrow="Lyon"
        title="Continuer votre recherche"
        items={[
          {
            label: 'Tous les appartements',
            href: '/appartements?city=lyon',
            description: 'Comparer les appartements Alto disponibles à Lyon selon vos dates.',
          },
          {
            label: 'Guides de Lyon',
            href: '/blog',
            description: 'Lire nos repères sur Bellecour, Terreaux, le Vieux Lyon et la Presqu’île.',
          },
          {
            label: 'Notre histoire',
            href: '/notre-histoire',
            description: 'Comprendre la manière dont Alto sélectionne et prépare ses adresses.',
          },
        ]}
      />
    </div>
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
