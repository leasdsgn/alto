import { guestyClient } from '@/lib/guesty-client'
import { getNeighborhoodBySlug } from '@/lib/apartment-neighborhoods'
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
  const address = listing.address?.full
  const city = listing.address?.city
  const slug = slugify(listing.nickname || listing.title)
  const neighborhoodLabel = getNeighborhoodBySlug(slug)
  return {
    id: listing._id,
    name: listing.title,
    price: listing.prices.basePrice,
    currency: listing.prices.currency,
    guests: listing.accommodates,
    surface: 0,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    slug,
    image: listing.pictures?.[0]?.original,
    images: listing.pictures?.map((p) => p.original) ?? [],
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

const FALLBACK_APARTMENTS = [
  {
    id: 'fb-1', name: 'Le Faubourg', price: 280, currency: 'EUR', guests: 4, surface: 80, bedrooms: 3, bathrooms: 1, slug: 'le-faubourg',
    lat: 48.8620, lng: 2.3645, address: 'Le Marais, Paris', city: 'Paris', neighborhoodLabel: 'Le Marais', images: [] as string[],
    description: "Un appartement haussmannien au cœur du Marais. Parquet ancien, plafonds hauts, moulures délicates.",
    space: "80m² lumineux avec salon, cuisine équipée, chambre avec lit king-size.",
    neighborhood: "Le Marais déploie ses ruelles vivantes et ses façades chargées d'histoire.",
    transit: "Métro Saint-Paul (L1) à 2 minutes à pied.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Free parking'], minNights: 2, maxNights: 30,
  },
  {
    id: 'fb-2', name: "L'Opéra", price: 210, currency: 'EUR', guests: 2, surface: 45, bedrooms: 1, bathrooms: 1, slug: 'l-opera',
    lat: 48.8735, lng: 2.3340, address: '9e arr., Paris', city: 'Paris', neighborhoodLabel: '9e arr.', images: [] as string[],
    description: "Un studio élégant à deux pas du Palais Garnier. Parfait pour un couple en escapade parisienne.",
    space: "45m² avec coin salon, cuisine ouverte et salle de bain en marbre.",
    neighborhood: "Grands boulevards, passages couverts, terrasses animées.",
    transit: "Métro Opéra (L3, L7, L8) à 3 minutes.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
  {
    id: 'fb-3', name: 'Le Saint-Germain', price: 240, currency: 'EUR', guests: 2, surface: 55, bedrooms: 2, bathrooms: 1, slug: 'le-saint-germain',
    lat: 48.8515, lng: 2.3360, address: '6e arr., Paris', city: 'Paris', neighborhoodLabel: '6e arr.', images: [] as string[],
    description: "Rive gauche, entre cafés littéraires et jardins secrets. Un refuge élégant au cœur de Saint-Germain.",
    space: "55m² avec deux chambres, salon cosy et cuisine équipée.",
    neighborhood: "Cafés, librairies, galeries. Le Paris intellectuel et bohème.",
    transit: "Métro Saint-Germain-des-Prés (L4) à 1 minute.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning', 'Free parking'], minNights: 2, maxNights: 30,
  },
  {
    id: 'fb-4', name: 'Le Marais', price: 260, currency: 'EUR', guests: 4, surface: 70, bedrooms: 2, bathrooms: 1, slug: 'le-marais',
    lat: 48.8655, lng: 2.3595, address: 'Le Marais, Paris', city: 'Paris', neighborhoodLabel: 'Le Marais', images: [] as string[],
    description: "Un loft contemporain dans une cour pavée du Marais. Volumes généreux et lumière zénithale.",
    space: "70m² sur deux niveaux avec mezzanine, salon double hauteur.",
    neighborhood: "Galeries d'art, concept stores, restaurants intimistes.",
    transit: "Métro Filles du Calvaire (L8) à 4 minutes.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
  {
    id: 'ly-1', name: 'Le Bellecour', price: 180, currency: 'EUR', guests: 4, surface: 75, bedrooms: 2, bathrooms: 1, slug: 'le-bellecour',
    lat: 45.7570, lng: 4.8330, address: "Presqu'île, Lyon", city: 'Lyon', neighborhoodLabel: "Presqu'île", images: [] as string[],
    description: "Un appartement élégant au cœur de la Presqu'île, à deux pas de la place Bellecour.",
    space: "75m² lumineux avec salon, cuisine équipée, deux chambres.",
    neighborhood: "La Presqu'île, entre Rhône et Saône, boutiques et brasseries.",
    transit: "Métro Bellecour (A, D) à 3 minutes.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
  {
    id: 'ly-2', name: 'Les Terreaux', price: 160, currency: 'EUR', guests: 2, surface: 50, bedrooms: 1, bathrooms: 1, slug: 'les-terreaux',
    lat: 45.7676, lng: 4.8341, address: "Presqu'île, Lyon", city: 'Lyon', neighborhoodLabel: "Presqu'île", images: [] as string[],
    description: "Un appartement lumineux à deux pas de la place des Terreaux et du musée des Beaux-Arts.",
    space: "50m² avec salon ouvert, cuisine équipée et salle de bain en pierre.",
    neighborhood: "Musées, galeries, vie nocturne et restaurants gastronomiques.",
    transit: "Métro Hôtel de Ville (A, C, D) à 2 minutes.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
  {
    id: 'ly-3', name: 'Le Vieux-Lyon', price: 195, currency: 'EUR', guests: 4, surface: 65, bedrooms: 2, bathrooms: 1, slug: 'le-vieux-lyon',
    lat: 45.7625, lng: 4.8272, address: 'Vieux-Lyon, Lyon', city: 'Lyon', neighborhoodLabel: 'Vieux-Lyon', images: [] as string[],
    description: "Au cœur du plus grand ensemble Renaissance d'Europe, un appartement chargé d'histoire.",
    space: "65m² avec poutres apparentes, cuisine en pierre et deux chambres cosy.",
    neighborhood: "Traboules, bouchons lyonnais, cathédrale Saint-Jean.",
    transit: "Métro Vieux-Lyon (D) à 1 minute.", amenities: ['Wifi', 'Kitchen', 'Washer', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
  {
    id: 'ly-4', name: 'La Croix-Rousse', price: 145, currency: 'EUR', guests: 2, surface: 40, bedrooms: 1, bathrooms: 1, slug: 'la-croix-rousse',
    lat: 45.7729, lng: 4.8290, address: 'Croix-Rousse, Lyon', city: 'Lyon', neighborhoodLabel: 'Croix-Rousse', images: [] as string[],
    description: "Un studio bohème sur la colline des Canuts, avec vue sur les toits de Lyon.",
    space: "40m² avec vue dégagée, cuisine équipée et coin salon chaleureux.",
    neighborhood: "Marché, ateliers d'artistes, cafés indépendants et pentes emblématiques.",
    transit: "Métro Croix-Rousse (C) à 4 minutes.", amenities: ['Wifi', 'Kitchen', 'Air conditioning'], minNights: 2, maxNights: 30,
  },
]

function normalizeCity(value: string | undefined | null): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

async function getApartments() {
  try {
    const { results } = await guestyClient.getListings()
    if (results.length > 0) return results.map(mapListing)
  } catch {
    // fall through to fallback
  }
  return FALLBACK_APARTMENTS
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

async function getApartmentsForSearch(criteria: SearchCriteria) {
  const { city, checkIn, checkOut, guests } = criteria
  const hasDates = Boolean(checkIn && checkOut)

  try {
    if (hasDates && checkIn && checkOut) {
      const { results } = await guestyClient.getAvailableListings(checkIn, checkOut, guests)
      return city ? applyCityFilter(results.map(mapListing), city) : results.map(mapListing)
    }

    const { results } = await guestyClient.getListings()
    return city ? applyCityFilter(results.map(mapListing), city) : results.map(mapListing)
  } catch {
    return city ? applyCityFilter(FALLBACK_APARTMENTS, city) : FALLBACK_APARTMENTS
  }
}

export { getApartments, getApartmentsForSearch }

export async function ApartmentsSection({
  apartments,
}: {
  apartments?: Awaited<ReturnType<typeof getApartments>>
}) {
  const data = apartments ?? (await getApartments())
  const paris = applyCityFilter(data, 'paris')
  const lyon = applyCityFilter(data, 'lyon')

  return (
    <section className="mx-auto flex max-w-content flex-col gap-12 px-gutter py-section md:px-gutter-md md:py-section-md">
      {paris.length > 0 && (
        <ApartmentsCarousel apartments={paris} title="Nos appartements à Paris" />
      )}
      {lyon.length > 0 && (
        <ApartmentsCarousel apartments={lyon} title="Nos appartements à Lyon" />
      )}
    </section>
  )
}
