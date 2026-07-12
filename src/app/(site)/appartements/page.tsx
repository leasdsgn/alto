import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { StoryblokStory } from '@storyblok/react/rsc'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentEditorialSections } from '@/components/sections/apartment-editorial-sections'
import { AppartementsGrid } from '@/components/sections/appartements-grid'
import { getApartmentSearchResult } from '@/components/sections/apartments-section'
import { SearchParamsSync } from '@/components/booking/search-params-sync'
import { JsonLd } from '@/components/seo/json-ld'
import { InternalLinkSection } from '@/components/seo/internal-link-section'
import { BrandKickerText } from '@/components/ui/brand-kicker-text'
import { getServerLocale } from '@/lib/i18n/server'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { buildBreadcrumbJsonLd, defineSeoMetadata } from '@/lib/seo'

interface PageProps {
  searchParams: Promise<{
    city?: string
    checkIn?: string
    checkOut?: string
    guests?: string
  }>
}

const APARTMENTS_HERO_IMAGE = '/images/appartements-hero.webp'

const APARTMENTS_METADATA: Record<'fr' | 'en', { title: string; description: string }> = {
  fr: {
    title: 'Nos appartements | Alto',
    description:
      'Découvrez les appartements Alto disponibles à Paris et Lyon pour vos séjours courte durée.',
  },
  en: {
    title: 'Our apartments | Alto',
    description: 'Discover Alto apartments available in Paris and Lyon for short-term stays.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  return defineSeoMetadata({
    ...APARTMENTS_METADATA[locale],
    path: '/appartements',
    image: APARTMENTS_HERO_IMAGE,
  })
}

export default async function AppartementsPage({ searchParams }: PageProps) {
  const locale = await getServerLocale()
  const copy = APARTMENTS_LINKS_COPY[locale]
  const sp = await searchParams
  const guestsCount = sp.guests ? Number(sp.guests) : undefined
  const gridKey = [
    sp.city ?? 'all',
    sp.checkIn ?? 'na',
    sp.checkOut ?? 'na',
    sp.guests ?? 'na',
  ].join(':')

  const [story, searchResult] = await Promise.all([
    getStoryBySlug('pages/appartements', locale),
    getApartmentSearchResult({
      city: sp.city,
      checkIn: sp.checkIn,
      checkOut: sp.checkOut,
      guests: guestsCount,
    }),
  ])

  const heroImage = APARTMENTS_HERO_IMAGE

  const hasStoryBody =
    locale === 'fr' &&
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: copy.home, path: '/' },
          { name: copy.apartments, path: '/appartements' },
        ])}
      />
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>

      {hasStoryBody ? (
        <StoryblokStory story={withApartmentsHeroFallback(story, heroImage)} />
      ) : (
        <FallbackHero imageSrc={heroImage} locale={locale} />
      )}

      <main className="max-w-content px-gutter pb-section-md md:px-gutter-md mx-auto w-full">
        <AppartementsGrid
          key={gridKey}
          apartments={searchResult.apartments}
          initialCity={sp.city}
          searchStatus={searchResult.status}
        />

        <InternalLinkSection
          eyebrow="Alto"
          title={copy.explore}
          className="mt-12"
          items={[...copy.links]}
        />
      </main>

      <ApartmentEditorialSections locale={locale} />

      <Footer />
    </>
  )
}

const APARTMENTS_LINKS_COPY = {
  fr: {
    home: 'Accueil',
    apartments: 'Appartements',
    explore: 'Explorer par intention',
    links: [
      {
        label: 'Séjourner à Lyon',
        href: '/lyon',
        description: 'Voir les appartements Alto et les quartiers à privilégier à Lyon.',
      },
      {
        label: 'Conseils de séjour',
        href: '/blog',
        description: 'Lire les guides de quartiers, adresses et conseils pratiques Alto.',
      },
      {
        label: 'Notre histoire',
        href: '/notre-histoire',
        description: 'Découvrir la vision Alto et les standards appliqués à chaque adresse.',
      },
    ],
  },
  en: {
    home: 'Home',
    apartments: 'Apartments',
    explore: 'Explore by intention',
    links: [
      {
        label: 'Stay in Lyon',
        href: '/lyon',
        description: 'Browse Alto apartments and the Lyon neighborhoods worth considering.',
      },
      {
        label: 'Travel advice',
        href: '/blog',
        description: 'Read Alto neighborhood guides, addresses, and practical advice.',
      },
      {
        label: 'Our story',
        href: '/notre-histoire',
        description: 'Discover the Alto vision and the standards applied to every address.',
      },
    ],
  },
} as const

function withApartmentsHeroFallback<T extends { content: Record<string, unknown> }>(
  story: T,
  heroImage: string,
): T {
  const body = story.content.body
  if (!Array.isArray(body)) return story

  return {
    ...story,
    content: {
      ...story.content,
      body: body.map((blok, index) => {
        if (
          index !== 0 ||
          !isRecord(blok) ||
          blok.component !== 'hero_compact_section' ||
          hasCustomStoryblokAsset(blok.background_image)
        ) {
          return blok
        }

        return {
          ...blok,
          background_image: heroImage,
        }
      }),
    },
  }
}

function hasCustomStoryblokAsset(value: unknown): boolean {
  const asset = getStoryblokAssetValue(value)
  if (!asset) return false

  return !asset.includes('/images/alto-salon.jpg') && !asset.includes('alto-salon')
}

function getStoryblokAssetValue(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null
  if (!isRecord(value)) return null

  if (typeof value.filename === 'string' && value.filename.trim()) return value.filename.trim()
  if (typeof value.url === 'string' && value.url.trim()) return value.url.trim()

  return null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function FallbackHero({ imageSrc, locale }: { imageSrc: string; locale: 'fr' | 'en' }) {
  const copy = APARTMENTS_PAGE_COPY[locale]
  return (
    <div className="h-apartments-hero relative overflow-hidden">
      <Image
        src={imageSrc}
        alt={copy.imageAlt}
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="bg-taupe absolute inset-0 opacity-70 mix-blend-multiply" />

      <Header />

      <div className="absolute inset-0 flex items-end">
        <div className="max-w-content px-gutter md:px-gutter-md mx-auto w-full pb-20">
          <p className="text-cream text-body max-w-[505px]">
            <BrandKickerText value={copy.kicker} />
          </p>
          <h1 className="text-cream text-h3 mt-1">{copy.title}</h1>
        </div>
      </div>
    </div>
  )
}

const APARTMENTS_PAGE_COPY = {
  fr: {
    imageAlt: 'Nos appartements',
    kicker: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
    title: 'Nos appartements',
  },
  en: {
    imageAlt: 'Our apartments',
    kicker: 'Alto is a new way to think about hospitality.',
    title: 'Our apartments',
  },
} as const
