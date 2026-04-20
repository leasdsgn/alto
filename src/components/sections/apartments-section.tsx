import { guestyClient } from '@/lib/guesty-client'
import { type GuestyListing } from '@/types/guesty'
import { ApartmentsCarousel } from '@/components/sections/apartments-carousel'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function mapListing(listing: GuestyListing) {
  return {
    id: listing._id,
    name: listing.title,
    price: listing.prices.basePrice,
    currency: listing.prices.currency,
    guests: listing.accommodates,
    surface: 0,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    slug: slugify(listing.nickname || listing.title),
    image: listing.pictures?.[0]?.original,
    images: listing.pictures?.map((p) => p.original) ?? [],
    lat: listing.address?.lat,
    lng: listing.address?.lng,
    address: listing.address?.full,
    city: listing.address?.city,
    description: listing.publicDescription?.summary ?? listing.description ?? '',
    space: listing.publicDescription?.space ?? '',
    neighborhood: listing.publicDescription?.neighborhood ?? '',
    transit: listing.publicDescription?.transit ?? '',
    amenities: listing.amenities ?? [],
    minNights: listing.minNights,
    maxNights: listing.maxNights,
  }
}

const FALLBACK_APARTMENTS = [
  {
    id: 'fb-1', name: 'Le Faubourg', price: 280, currency: 'EUR', guests: 4, surface: 80, bedrooms: 3, bathrooms: 1, slug: 'le-faubourg',
    lat: 48.8620, lng: 2.3645, address: 'Le Marais, Paris', city: 'Paris', images: [] as string[],
    description: "Un appartement haussmannien au cœur du Marais. Parquet ancien, plafonds hauts, moulures délicates.",
    space: "80m² lumineux avec salon, cuisine équipée, chambre avec lit king-size.",
    neighborhood: "Le Marais déploie ses ruelles vivantes et ses façades chargées d'histoire.",
    transit: "Métro Saint-Paul (L1) à 2 minutes à pied.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Free parking'], minNights: 2, maxNights: 30,
  },
  {
    id: 'fb-2', name: "L'Opéra", price: 210, currency: 'EUR', guests: 2, surface: 45, bedrooms: 1, bathrooms: 1, slug: 'l-opera',
    lat: 48.8735, lng: 2.3340, address: '9e arr., Paris', city: 'Paris', images: [] as string[],
    description: "Un studio élégant à deux pas du Palais Garnier. Parfait pour un couple en escapade parisienne.",
    space: "45m² avec coin salon, cuisine ouverte et salle de bain en marbre.",
    neighborhood: "Grands boulevards, passages couverts, terrasses animées.",
    transit: "Métro Opéra (L3, L7, L8) à 3 minutes.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
  {
    id: 'fb-3', name: 'Le Saint-Germain', price: 240, currency: 'EUR', guests: 2, surface: 55, bedrooms: 2, bathrooms: 1, slug: 'le-saint-germain',
    lat: 48.8515, lng: 2.3360, address: '6e arr., Paris', city: 'Paris', images: [] as string[],
    description: "Rive gauche, entre cafés littéraires et jardins secrets. Un refuge élégant au cœur de Saint-Germain.",
    space: "55m² avec deux chambres, salon cosy et cuisine équipée.",
    neighborhood: "Cafés, librairies, galeries. Le Paris intellectuel et bohème.",
    transit: "Métro Saint-Germain-des-Prés (L4) à 1 minute.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Free parking'], minNights: 2, maxNights: 30,
  },
  {
    id: 'fb-4', name: 'Le Marais', price: 260, currency: 'EUR', guests: 4, surface: 70, bedrooms: 2, bathrooms: 1, slug: 'le-marais',
    lat: 48.8655, lng: 2.3595, address: 'Le Marais, Paris', city: 'Paris', images: [] as string[],
    description: "Un loft contemporain dans une cour pavée du Marais. Volumes généreux et lumière zénithale.",
    space: "70m² sur deux niveaux avec mezzanine, salon double hauteur.",
    neighborhood: "Galeries d'art, concept stores, restaurants intimistes.",
    transit: "Métro Filles du Calvaire (L8) à 4 minutes.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
]

async function getApartments() {
  try {
    const { results } = await guestyClient.getListings()
    console.log(`[Guesty] ${results.length} listing(s) chargé(s)`)
    if (results.length > 0) return results.map(mapListing)
  } catch (error) {
    console.error('[Guesty] Erreur fetch listings:', error instanceof Error ? error.message : error)
  }
  return FALLBACK_APARTMENTS
}

export interface SearchCriteria {
  city?: string
  checkIn?: string
  checkOut?: string
  guests?: number
}

function normalizeCity(value: string | undefined | null): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

async function getApartmentsForSearch(criteria: SearchCriteria) {
  const { city, checkIn, checkOut, guests } = criteria
  const hasDates = Boolean(checkIn && checkOut)

  try {
    if (hasDates && checkIn && checkOut) {
      const { results } = await guestyClient.getAvailableListings(checkIn, checkOut, guests)
      console.log(
        `[Guesty] ${results.length} dispo pour ${checkIn} → ${checkOut}` +
          (guests ? ` (${guests} voyageurs)` : ''),
      )
      return applyCityFilter(results.map(mapListing), city)
    }

    const { results } = await guestyClient.getListings()
    return applyCityFilter(results.map(mapListing), city)
  } catch (error) {
    console.error(
      '[Guesty] Erreur fetch listings:',
      error instanceof Error ? error.message : error,
    )
    return applyCityFilter(FALLBACK_APARTMENTS, city)
  }
}

function applyCityFilter<T extends { city?: string }>(
  items: T[],
  city: string | undefined,
): T[] {
  if (!city) return items
  const needle = normalizeCity(city)
  if (!needle) return items
  return items.filter((apt) => normalizeCity(apt.city).includes(needle))
}

export { getApartments, getApartmentsForSearch }

export async function ApartmentsSection({ apartments }: { apartments?: Awaited<ReturnType<typeof getApartments>> }) {
  const data = apartments ?? await getApartments()

  return (
    <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
      <ApartmentsCarousel apartments={data} />
    </section>
  )
}
