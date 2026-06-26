import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getApartments } from '@/components/sections/apartments-section'
import { ApartmentView } from '@/components/apartment/apartment-view'
import { SearchParamsSync } from '@/components/booking/search-params-sync'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getStaticServerLocale } from '@/lib/i18n/server'

export default async function ApartmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    checkIn?: string
    checkOut?: string
    check_in?: string
    check_out?: string
  }>
}) {
  const { slug } = await params
  const search = await searchParams
  const locale = getStaticServerLocale()
  const apartments = await getApartments()
  const apartment = apartments.find((a) => a.slug === slug)
  const hasDatedSearch = Boolean(
    (search.checkIn || search.check_in) && (search.checkOut || search.check_out),
  )

  if (!apartment) notFound()

  const others = apartments.filter((a) => a.slug !== slug)
  const globals = await getStoryblokGlobals(locale)

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>
      <ApartmentView
        apartment={apartment}
        recommendations={others}
        globalFaq={globals.apartmentFaq.items}
        globalTestimonials={globals.sharedTestimonials}
        locale={locale}
        initialShouldVerifyQuote={hasDatedSearch}
      />
    </>
  )
}
