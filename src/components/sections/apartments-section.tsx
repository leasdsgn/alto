import { unstable_cache } from 'next/cache'
import { guestyClient } from '@/lib/guesty-client'
import { getNeighborhoodBySlug } from '@/lib/apartment-neighborhoods'
import { getQuoteTotalCents } from '@/lib/guesty-pricing'
import { type GuestyListing } from '@/types/guesty'
import { type Apartment, type ApartmentCardData } from '@/types/apartment'
import { ApartmentsCarousel } from '@/components/sections/apartments-carousel'
import { getStaticServerLocale } from '@/lib/i18n/server'

const APARTMENT_CARD_REVALIDATE_SECONDS = 5 * 60
const APARTMENT_STARTING_PRICES_CACHE_TAG = 'guesty-apartment-starting-prices'
const LISTING_CARD_FIELDS = [
  '_id',
  'title',
  'nickname',
  'address.full',
  'address.city',
  'address.lat',
  'address.lng',
  'pictures',
  'accommodates',
  'bedrooms',
  'bathrooms',
  'prices.basePrice',
  'prices.currency',
  'minNights',
  'maxNights',
] as const
const LISTING_DETAIL_FIELDS = [
  ...LISTING_CARD_FIELDS,
  'description',
  'publicDescription.summary',
  'publicDescription.space',
  'publicDescription.neighborhood',
  'publicDescription.transit',
  'amenities',
] as const
const LISTING_SEARCH_FIELDS = [...LISTING_CARD_FIELDS, 'totalPrice'] as const

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mapListing(listing: GuestyListing): Apartment {
  const address = listing.address?.full
  const city = listing.address?.city
  const slug = slugify(listing.nickname || listing.title)
  const neighborhoodLabel = getNeighborhoodBySlug(slug)
  return {
    id: listing._id,
    name: listing.title,
    price: getBasePrice(listing.prices?.basePrice),
    currency: listing.prices?.currency ?? 'EUR',
    guests: listing.accommodates,
    surface: 0,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    slug,
    image: normalizeGuestyImageUrl(listing.pictures?.[0]?.original),
    images:
      listing.pictures?.flatMap((picture) => {
        const url = normalizeGuestyImageUrl(picture.original || picture.thumbnail)
        return url ? [url] : []
      }) ?? [],
    lat: listing.address?.lat,
    lng: listing.address?.lng,
    address,
    city,
    neighborhoodLabel,
    description: listing.publicDescription?.summary ?? listing.description ?? '',
    space: listing.publicDescription?.space ?? '',
    neighborhood: listing.publicDescription?.neighborhood ?? '',
    transit: listing.publicDescription?.transit ?? '',
    amenities: listing.amenities ?? [],
    minNights: listing.minNights,
    maxNights: listing.maxNights,
  }
}

function mapListingCard(listing: GuestyListing): ApartmentCardData {
  const city = listing.address?.city
  const slug = slugify(listing.nickname || listing.title || listing._id)
  const neighborhoodLabel = getNeighborhoodBySlug(slug)
  const image = normalizeGuestyImageUrl(
    listing.pictures?.[0]?.original || listing.pictures?.[0]?.thumbnail,
  )
  const totalPrice = getTotalPrice(listing.totalPrice)
  const basePrice = getBasePrice(listing.prices?.basePrice)

  return {
    id: listing._id,
    name: listing.title || listing.nickname || 'Appartement Alto',
    price: totalPrice ?? basePrice,
    priceSource: totalPrice ? 'total' : 'starting',
    currency: listing.prices?.currency ?? 'EUR',
    guests: listing.accommodates ?? 0,
    surface: 0,
    bedrooms: listing.bedrooms ?? 0,
    bathrooms: listing.bathrooms ?? 0,
    slug,
    image,
    images: image ? [image] : [],
    lat: listing.address?.lat,
    lng: listing.address?.lng,
    address: listing.address?.full,
    city,
    neighborhoodLabel,
    minNights: listing.minNights,
    maxNights: listing.maxNights,
  }
}

function normalizeGuestyImageUrl(value: string | null | undefined) {
  if (!value) return undefined

  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('http://')) return value.replace('http://', 'https://')

  return value
}

const getCachedSearchQuote = unstable_cache(
  (listingId: string, checkIn: string, checkOut: string, guestsCount: number) =>
    guestyClient.createQuote(listingId, checkIn, checkOut, guestsCount),
  ['guesty-search-quote'],
  { revalidate: 300 },
)

const getCachedListings = unstable_cache(
  () => guestyClient.getListings({ fields: LISTING_DETAIL_FIELDS }),
  ['guesty-visible-listings-v1'],
  {
    revalidate: 300,
  },
)

const getCachedListingCards = unstable_cache(
  () => guestyClient.getListings({ fields: LISTING_CARD_FIELDS }),
  ['guesty-visible-listing-cards-v1'],
  { revalidate: 300 },
)

const getCachedApartmentCardSnapshot = unstable_cache(
  loadApartmentCardSnapshot,
  ['guesty-visible-apartment-card-base-price-snapshot-v1'],
  {
    revalidate: APARTMENT_CARD_REVALIDATE_SECONDS,
    tags: [APARTMENT_STARTING_PRICES_CACHE_TAG],
  },
)

const FALLBACK_APARTMENTS = [
  {
    id: 'fb-1',
    name: 'Le Faubourg',
    price: 280,
    currency: 'EUR',
    guests: 4,
    surface: 80,
    bedrooms: 3,
    bathrooms: 1,
    slug: 'le-faubourg',
    lat: 48.862,
    lng: 2.3645,
    address: 'Le Marais, Paris',
    city: 'Paris',
    neighborhoodLabel: 'Le Marais',
    images: [] as string[],
    description:
      'Un appartement haussmannien au cœur du Marais. Parquet ancien, plafonds hauts, moulures délicates.',
    space: '80m² lumineux avec salon, cuisine équipée, chambre avec lit king-size.',
    neighborhood: "Le Marais déploie ses ruelles vivantes et ses façades chargées d'histoire.",
    transit: 'Métro Saint-Paul (L1) à 2 minutes à pied.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Free parking'],
    minNights: 2,
    maxNights: 30,
  },
  {
    id: 'fb-2',
    name: "L'Opéra",
    price: 210,
    currency: 'EUR',
    guests: 2,
    surface: 45,
    bedrooms: 1,
    bathrooms: 1,
    slug: 'l-opera',
    lat: 48.8735,
    lng: 2.334,
    address: '9e arr., Paris',
    city: 'Paris',
    neighborhoodLabel: '9e arr.',
    images: [] as string[],
    description:
      'Un studio élégant à deux pas du Palais Garnier. Parfait pour un couple en escapade parisienne.',
    space: '45m² avec coin salon, cuisine ouverte et salle de bain en marbre.',
    neighborhood: 'Grands boulevards, passages couverts, terrasses animées.',
    transit: 'Métro Opéra (L3, L7, L8) à 3 minutes.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'],
    minNights: 2,
    maxNights: 30,
  },
  {
    id: 'fb-3',
    name: 'Le Saint-Germain',
    price: 240,
    currency: 'EUR',
    guests: 2,
    surface: 55,
    bedrooms: 2,
    bathrooms: 1,
    slug: 'le-saint-germain',
    lat: 48.8515,
    lng: 2.336,
    address: '6e arr., Paris',
    city: 'Paris',
    neighborhoodLabel: '6e arr.',
    images: [] as string[],
    description:
      'Rive gauche, entre cafés littéraires et jardins secrets. Un refuge élégant au cœur de Saint-Germain.',
    space: '55m² avec deux chambres, salon cosy et cuisine équipée.',
    neighborhood: 'Cafés, librairies, galeries. Le Paris intellectuel et bohème.',
    transit: 'Métro Saint-Germain-des-Prés (L4) à 1 minute.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Free parking'],
    minNights: 2,
    maxNights: 30,
  },
  {
    id: 'fb-4',
    name: 'Le Marais',
    price: 260,
    currency: 'EUR',
    guests: 4,
    surface: 70,
    bedrooms: 2,
    bathrooms: 1,
    slug: 'le-marais',
    lat: 48.8655,
    lng: 2.3595,
    address: 'Le Marais, Paris',
    city: 'Paris',
    neighborhoodLabel: 'Le Marais',
    images: [] as string[],
    description:
      'Un loft contemporain dans une cour pavée du Marais. Volumes généreux et lumière zénithale.',
    space: '70m² sur deux niveaux avec mezzanine, salon double hauteur.',
    neighborhood: "Galeries d'art, concept stores, restaurants intimistes.",
    transit: 'Métro Filles du Calvaire (L8) à 4 minutes.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'],
    minNights: 2,
    maxNights: 30,
  },
  {
    id: 'ly-1',
    name: 'Le Bellecour',
    price: 180,
    currency: 'EUR',
    guests: 4,
    surface: 75,
    bedrooms: 2,
    bathrooms: 1,
    slug: 'le-bellecour',
    lat: 45.757,
    lng: 4.833,
    address: "Presqu'île, Lyon",
    city: 'Lyon',
    neighborhoodLabel: "Presqu'île",
    images: [] as string[],
    description:
      "Un appartement élégant au cœur de la Presqu'île, à deux pas de la place Bellecour.",
    space: '75m² lumineux avec salon, cuisine équipée, deux chambres.',
    neighborhood: "La Presqu'île, entre Rhône et Saône, boutiques et brasseries.",
    transit: 'Métro Bellecour (A, D) à 3 minutes.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'],
    minNights: 2,
    maxNights: 30,
  },
  {
    id: 'ly-2',
    name: 'Les Terreaux',
    price: 160,
    currency: 'EUR',
    guests: 2,
    surface: 50,
    bedrooms: 1,
    bathrooms: 1,
    slug: 'les-terreaux',
    lat: 45.7676,
    lng: 4.8341,
    address: "Presqu'île, Lyon",
    city: 'Lyon',
    neighborhoodLabel: "Presqu'île",
    images: [] as string[],
    description:
      'Un appartement lumineux à deux pas de la place des Terreaux et du musée des Beaux-Arts.',
    space: '50m² avec salon ouvert, cuisine équipée et salle de bain en pierre.',
    neighborhood: 'Musées, galeries, vie nocturne et restaurants gastronomiques.',
    transit: 'Métro Hôtel de Ville (A, C, D) à 2 minutes.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'],
    minNights: 2,
    maxNights: 30,
  },
  {
    id: 'ly-3',
    name: 'Le Vieux-Lyon',
    price: 195,
    currency: 'EUR',
    guests: 4,
    surface: 65,
    bedrooms: 2,
    bathrooms: 1,
    slug: 'le-vieux-lyon',
    lat: 45.7625,
    lng: 4.8272,
    address: 'Vieux-Lyon, Lyon',
    city: 'Lyon',
    neighborhoodLabel: 'Vieux-Lyon',
    images: [] as string[],
    description:
      "Au cœur du plus grand ensemble Renaissance d'Europe, un appartement chargé d'histoire.",
    space: '65m² avec poutres apparentes, cuisine en pierre et deux chambres cosy.',
    neighborhood: 'Traboules, bouchons lyonnais, cathédrale Saint-Jean.',
    transit: 'Métro Vieux-Lyon (D) à 1 minute.',
    amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'],
    minNights: 2,
    maxNights: 30,
  },
  {
    id: 'ly-4',
    name: 'La Croix-Rousse',
    price: 145,
    currency: 'EUR',
    guests: 2,
    surface: 40,
    bedrooms: 1,
    bathrooms: 1,
    slug: 'la-croix-rousse',
    lat: 45.7729,
    lng: 4.829,
    address: 'Croix-Rousse, Lyon',
    city: 'Lyon',
    neighborhoodLabel: 'Croix-Rousse',
    images: [] as string[],
    description: 'Un studio bohème sur la colline des Canuts, avec vue sur les toits de Lyon.',
    space: '40m² avec vue dégagée, cuisine équipée et coin salon chaleureux.',
    neighborhood: "Marché, ateliers d'artistes, cafés indépendants et pentes emblématiques.",
    transit: 'Métro Croix-Rousse (C) à 4 minutes.',
    amenities: ['Wifi', 'Kitchen', 'Air conditioning'],
    minNights: 2,
    maxNights: 30,
  },
]

function normalizeCity(value: string | undefined | null): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

async function getApartments(): Promise<Apartment[]> {
  try {
    const { results } = await getCachedListings()
    if (results.length > 0) return results.map(mapListing)
  } catch {
    // fall through to fallback
  }
  return getFallbackApartments()
}

async function getApartmentCards(): Promise<ApartmentCardData[]> {
  return getCachedApartmentCardSnapshot()
}

async function loadApartmentCardSnapshot(): Promise<ApartmentCardData[]> {
  try {
    const { results } = await getCachedListingCards()
    if (results.length > 0) return results.map((listing) => mapListingCard(listing))
  } catch {
    // fall through to fallback
  }

  return getFallbackApartments().map(toApartmentCardData)
}

async function preloadApartmentStartingPrices() {
  const apartments = await getApartmentCards()

  return {
    count: apartments.length,
    pricedCount: apartments.filter((apartment) => isDisplayablePrice(apartment.price)).length,
    startingPriceCount: apartments.filter((apartment) => apartment.priceSource === 'starting')
      .length,
  }
}

export interface SearchCriteria {
  city?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

function applyCityFilter<T extends { city?: string }>(items: T[], city: string): T[] {
  const needle = normalizeCity(city)
  if (!needle) return items
  return items.filter((apt) => normalizeCity(apt.city).includes(needle))
}

async function getApartmentSearchResult(criteria: SearchCriteria) {
  const { city, checkIn, checkOut, guests } = criteria
  const hasDates = Boolean(checkIn && checkOut)

  if (hasDates && checkIn && checkOut) {
    try {
      const { results } = await guestyClient.getAvailableListings(checkIn, checkOut, guests, {
        fields: LISTING_SEARCH_FIELDS,
      })
      const apartments = city
        ? applyCityFilter(
            results.map((listing) => mapListingCard(listing)),
            city,
          )
        : results.map((listing) => mapListingCard(listing))
      const hasTotalPrice = apartments.some((apartment) => apartment.priceSource === 'total')

      return {
        apartments: hasTotalPrice
          ? apartments
          : await withQuotePrices(apartments, {
              checkIn,
              checkOut,
              guestsCount: guests ?? 1,
            }),
        hasDateSearch: true,
        status: 'ready' as const,
      }
    } catch (error) {
      console.error('[apartments search] availability search failed', {
        error: error instanceof Error ? error.message : String(error),
      })

      return {
        apartments: [],
        hasDateSearch: true,
        status: 'availability_error' as const,
      }
    }
  }

  try {
    const apartments = await getApartmentCards()
    const filtered = city ? applyCityFilter(apartments, city) : apartments

    return {
      apartments: filtered,
      hasDateSearch: false,
      status: 'ready' as const,
    }
  } catch {
    const fallbackApartments = getFallbackApartments().map(toApartmentCardData)

    return {
      apartments: city
        ? applyCityFilter(fallbackApartments, city)
        : fallbackApartments,
      hasDateSearch: false,
      status: 'fallback' as const,
    }
  }
}

async function getApartmentsForSearch(criteria: SearchCriteria) {
  const result = await getApartmentSearchResult(criteria)
  return result.apartments
}

async function withQuotePrices<T extends { id: string; price: number | null }>(
  apartments: T[],
  {
    checkIn,
    checkOut,
    guestsCount,
  }: {
    checkIn: string
    checkOut: string
    guestsCount: number
  },
) {
  return mapWithConcurrency(apartments, 3, async (apartment) => {
    if (isFallbackApartmentId(apartment.id)) return apartment

    try {
      const quote = await getCachedSearchQuote(apartment.id, checkIn, checkOut, guestsCount)
      const totalCents = getQuoteTotalCents(quote)
      if (!totalCents) return apartment

      return {
        ...apartment,
        price: Math.round(totalCents / 100),
        priceSource: 'total' as const,
      }
    } catch {
      return apartment
    }
  })
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
) {
  const results: R[] = []

  for (let index = 0; index < items.length; index += concurrency) {
    const batch = items.slice(index, index + concurrency)
    const mapped = await Promise.all(batch.map(mapper))
    results.push(...mapped)
  }

  return results
}

function getTotalPrice(totalPrice: number | undefined) {
  if (!Number.isFinite(totalPrice) || !totalPrice || totalPrice <= 0) return null
  return Math.round(totalPrice)
}

function getBasePrice(basePrice: number | undefined | null) {
  if (!Number.isFinite(basePrice) || !basePrice || basePrice <= 0) return null
  return Math.round(basePrice)
}

function toApartmentCardData(apartment: (typeof FALLBACK_APARTMENTS)[number]): ApartmentCardData {
  const maybeImage = (apartment as { image?: unknown }).image
  const image = typeof maybeImage === 'string' ? maybeImage : undefined

  return {
    id: apartment.id,
    name: apartment.name,
    price: apartment.price,
    currency: apartment.currency,
    guests: apartment.guests,
    surface: apartment.surface,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    slug: apartment.slug,
    image,
    images: apartment.images,
    lat: apartment.lat,
    lng: apartment.lng,
    address: apartment.address,
    city: apartment.city,
    neighborhoodLabel: apartment.neighborhoodLabel,
    minNights: apartment.minNights,
    maxNights: apartment.maxNights,
    priceSource: 'starting',
  }
}

function getFallbackApartments() {
  if (process.env.GUESTY_ALLOW_FALLBACK_APARTMENTS !== 'true') return []
  return FALLBACK_APARTMENTS
}

function isFallbackApartmentId(id: string) {
  return id.startsWith('fb-') || id.startsWith('ly-')
}

function isDisplayablePrice(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export {
  APARTMENT_STARTING_PRICES_CACHE_TAG,
  getApartments,
  getApartmentCards,
  getApartmentsForSearch,
  getApartmentSearchResult,
  preloadApartmentStartingPrices,
}

export async function ApartmentsSection({
  apartments,
  titles,
}: {
  apartments?: ApartmentCardData[]
  titles?: { paris: string; lyon: string }
}) {
  const locale = getStaticServerLocale()
  const copy = titles ?? APARTMENTS_SECTION_COPY[locale]
  const data = apartments ?? (await getApartmentCards())
  const paris = applyCityFilter(data, 'paris')
  const lyon = applyCityFilter(data, 'lyon')

  return (
    <section className="max-w-content px-gutter py-section md:px-gutter-md md:py-section-md mx-auto flex flex-col gap-12">
      {paris.length > 0 && <ApartmentsCarousel apartments={paris} title={copy.paris} />}
      {lyon.length > 0 && <ApartmentsCarousel apartments={lyon} title={copy.lyon} />}
    </section>
  )
}

const APARTMENTS_SECTION_COPY = {
  fr: {
    paris: 'Nos appartements à Paris',
    lyon: 'Nos appartements à Lyon',
  },
  en: {
    paris: 'Our apartments in Paris',
    lyon: 'Our apartments in Lyon',
  },
} as const
