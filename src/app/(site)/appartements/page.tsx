import { Suspense } from 'react'
import Image from 'next/image'
import { StoryblokStory } from '@storyblok/react/rsc'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentEditorialSections } from '@/components/sections/apartment-editorial-sections'
import { AppartementsGrid } from '@/components/sections/appartements-grid'
import { getApartmentSearchResult } from '@/components/sections/apartments-section'
import { SearchParamsSync } from '@/components/booking/search-params-sync'
import { BrandKickerText } from '@/components/ui/brand-kicker-text'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getStoryBySlug } from '@/lib/storyblok-page'

interface PageProps {
  searchParams: Promise<{
    city?: string
    checkIn?: string
    checkOut?: string
    guests?: string
  }>
}

const APARTMENTS_HERO_IMAGE = '/images/appartements-hero.webp'

export default async function AppartementsPage({ searchParams }: PageProps) {
  const locale = getStaticServerLocale()
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

  const hasStoryBody =
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>

      {hasStoryBody ? (
        <StoryblokStory story={withApartmentsHeroFallback(story)} />
      ) : (
        <FallbackHero imageSrc={APARTMENTS_HERO_IMAGE} locale={locale} />
      )}

      <main className="max-w-content px-gutter pb-section-md md:px-gutter-md mx-auto w-full">
        <AppartementsGrid
          key={gridKey}
          apartments={searchResult.apartments}
          initialCity={sp.city}
          searchStatus={searchResult.status}
        />
      </main>

      <ApartmentEditorialSections />

      <Footer />
    </>
  )
}

function withApartmentsHeroFallback<T extends { content: Record<string, unknown> }>(story: T): T {
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
          background_image: APARTMENTS_HERO_IMAGE,
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
