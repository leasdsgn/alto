import { notFound } from 'next/navigation'
import { getApartments } from '@/components/sections/apartments-section'
import { ApartmentView } from '@/components/apartment/apartment-view'

export default async function ApartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const apartments = await getApartments()
  const apartment = apartments.find((a) => a.slug === slug)

  if (!apartment) notFound()

  const others = apartments.filter((a) => a.slug !== slug)

  return <ApartmentView apartment={apartment} recommendations={others} />
}
