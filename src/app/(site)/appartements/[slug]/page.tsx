import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getApartments } from '@/components/sections/apartments-section'
import { ApartmentView } from '@/components/apartment/apartment-view'
import { SearchParamsSync } from '@/components/booking/search-params-sync'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getServerLocale } from '@/lib/i18n/server'

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getServerLocale()
  const apartments = await getApartments()
  const apartment = apartments.find((a) => a.slug === slug)

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
      />
    </>
  )
}
