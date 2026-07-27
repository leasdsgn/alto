import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getApartments } from '@/components/sections/apartments-section'
import { ApartmentView } from '@/components/apartment/apartment-view'
import { SearchParamsSync } from '@/components/booking/search-params-sync'
import { JsonLd } from '@/components/seo/json-ld'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getServerLocale } from '@/lib/i18n/server'
import { buildApartmentJsonLd, buildBreadcrumbJsonLd, defineSeoMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const [{ slug }, locale, apartments] = await Promise.all([
    params,
    getServerLocale(),
    getApartments(),
  ])
  const apartment = apartments.find((item) => item.slug === slug)

  if (!apartment) {
    return defineSeoMetadata({
      title: locale === 'en' ? 'Apartment not found | Alto' : 'Appartement introuvable | Alto',
      description:
        locale === 'en'
          ? 'This apartment is not available.'
          : 'Cet appartement n’est pas disponible.',
      path: `/appartements/${slug}`,
      noIndex: true,
    })
  }

  const city = apartment.city ?? 'Paris'
  const description = getApartmentSeoDescription(apartment, city, locale)
  const image = apartment.images[0] ?? apartment.image

  return defineSeoMetadata({
    title:
      locale === 'en'
        ? `${apartment.name} - Apartment in ${city} | Alto`
        : `${apartment.name} - Appartement à ${city} | Alto`,
    description,
    path: `/appartements/${apartment.slug}`,
    image,
  })
}

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
  const [{ slug }, search, locale, apartments] = await Promise.all([
    params,
    searchParams,
    getServerLocale(),
    getApartments(),
  ])
  const apartment = apartments.find((a) => a.slug === slug)
  const hasDatedSearch = Boolean(
    (search.checkIn || search.check_in) && (search.checkOut || search.check_out),
  )

  if (!apartment) notFound()

  const others = apartments.filter((a) => a.slug !== slug)
  const globals = await getStoryblokGlobals(locale)

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: locale === 'en' ? 'Home' : 'Accueil', path: '/' },
            { name: locale === 'en' ? 'Apartments' : 'Appartements', path: '/appartements' },
            { name: apartment.name, path: `/appartements/${apartment.slug}` },
          ]),
          buildApartmentJsonLd(apartment),
        ]}
      />
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

function getApartmentSeoDescription(
  apartment: Awaited<ReturnType<typeof getApartments>>[number],
  city: string,
  locale: 'fr' | 'en',
) {
  if (locale === 'en') {
    return `Discover ${apartment.name}, an Alto apartment in ${city} for short-term stays.`
  }
  const fallback = `Découvrez ${apartment.name}, un appartement Alto à ${city} pour vos séjours courte durée.`
  const source = apartment.description || apartment.space || fallback
  return truncateDescription(source)
}

function truncateDescription(value: string) {
  const trimmed = value.replace(/\s+/g, ' ').trim()
  if (trimmed.length <= 155) return trimmed
  return `${trimmed.slice(0, 152).replace(/\s+\S*$/, '')}...`
}
