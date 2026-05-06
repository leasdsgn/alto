import { Suspense } from 'react'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AppartementsGrid } from '@/components/sections/appartements-grid'
import { getApartmentsForSearch } from '@/components/sections/apartments-section'
import { SearchParamsSync } from '@/components/booking/search-params-sync'
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
  const sp = await searchParams
  const guestsCount = sp.guests ? Number(sp.guests) : undefined

  const [apartments, siteImages] = await Promise.all([
    getApartmentsForSearch({
      city: sp.city,
      checkIn: sp.checkIn,
      checkOut: sp.checkOut,
      guests: guestsCount,
    }),
    getSiteImages(),
  ])

  const cityLabel = sp.city ? formatCityLabel(sp.city) : null

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>
      <div className="relative h-[422px] overflow-hidden">
        <Image
          src={siteImages.pages.apartmentsHero}
          alt="Nos appartements"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-coffee/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-coffee/75 to-transparent" />

        <Header />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-content px-gutter pb-10 md:px-gutter-md">
            <h1 className="text-cream text-base font-bold leading-[24px]">
              {cityLabel ? `Nos appartements à ${cityLabel}` : 'Nos appartements'}
            </h1>
            <p className="text-cream/80 mt-2 max-w-[505px] text-xs font-medium leading-[20px]">
              Une collection d'adresses où chaque détail compte. Paris, Lyon, bientôt ailleurs.
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
        <AppartementsGrid apartments={apartments} />
      </main>

      <Footer />
    </>
  )
}

function formatCityLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
