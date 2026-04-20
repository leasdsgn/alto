import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getApartments } from '@/components/sections/apartments-section'
import { ApartmentView } from '@/components/apartment/apartment-view'
import { SearchParamsSync } from '@/components/booking/search-params-sync'

export default async function ApartmentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const apartments = await getApartments()
  const apartment = apartments.find((a) => a.slug === slug)

  if (!apartment) notFound()

  const others = apartments.filter((a) => a.slug !== slug)

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync />
      </Suspense>
      <ApartmentView apartment={apartment} recommendations={others} />
    </>
  )
}
