import { Suspense } from 'react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentEditorialSections } from '@/components/sections/apartment-editorial-sections'
import { AppartementsGrid } from '@/components/sections/appartements-grid'
import { getApartmentsForSearch } from '@/components/sections/apartments-section'
import { SearchParamsSync } from '@/components/booking/search-params-sync'
import { getServerLocale } from '@/lib/i18n/server'
import { getSiteImages } from '@/lib/storyblok-site-images'

interface PageProps {
  searchParams: Promise<{
    city?: string
    checkIn?: string
    checkOut?: string
    guests?: string
  }>
}

export default async function AppartementsPage({ searchParams }: PageProps) {
  const locale = await getServerLocale()
  const copy = APARTMENTS_PAGE_COPY[locale]
  const sp = await searchParams
  const guestsCount = sp.guests ? Number(sp.guests) : undefined
  const gridKey = [sp.city ?? 'all', sp.checkIn ?? 'na', sp.checkOut ?? 'na', sp.guests ?? 'na'].join(':')

  const [apartments, siteImages] = await Promise.all([
    getApartmentsForSearch({
      city: sp.city,
      checkIn: sp.checkIn,
      checkOut: sp.checkOut,
      guests: guestsCount,
    }),
    getSiteImages(locale),
  ])

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>
      <div className="relative h-apartments-hero overflow-hidden">
        <Image
          src={siteImages.pages.apartmentsHero}
          alt={copy.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-taupe opacity-70 mix-blend-multiply" />

        <Header />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-content px-gutter pb-20 md:px-gutter-md">
            <p className="text-cream text-body max-w-[505px]">
              {copy.kicker}
            </p>
            <h1 className="text-cream text-h3 mt-1">{copy.title}</h1>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-content px-gutter pb-section-md md:px-gutter-md">
        <AppartementsGrid key={gridKey} apartments={apartments} initialCity={sp.city} />
      </main>

      <ApartmentEditorialSections />

      <Footer />
    </>
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
