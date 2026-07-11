import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ResponsiveBooking } from '@/components/apartment/responsive-booking'
import { ApartmentGallery } from '@/components/apartment/gallery'
import { ApartmentFaq } from '@/components/apartment/faq'
import { ApartmentMap } from '@/components/apartment/apartment-map'
import { ApartmentsCarousel } from '@/components/sections/apartments-carousel'
import { ApartmentEditorialSections } from '@/components/sections/apartment-editorial-sections'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { InternalLinkSection } from '@/components/seo/internal-link-section'
import { getNeighborhoodBySlug } from '@/lib/apartment-neighborhoods'
import { type Apartment } from '@/types/apartment'
import type { InquiryLocale } from '@/types/inquiry'
import type { StoryblokFaqItem, StoryblokTestimonial } from '@/lib/storyblok-globals'

interface Props {
  apartment: Apartment
  recommendations: Apartment[]
  globalFaq: StoryblokFaqItem[]
  globalTestimonials: StoryblokTestimonial[]
  locale: InquiryLocale
  initialShouldVerifyQuote?: boolean
}

interface ReviewItem {
  quote: string
  name: string
  stay: string
}

interface FeatureItem {
  title: string
  description: string
}

const FEATURE_LIBRARY = [
  {
    matches: ['wifi', 'internet'],
    title: 'Wifi rapide',
    description:
      'Connexion stable pour télétravailler, passer des appels ou profiter de vos contenus sans friction.',
  },
  {
    matches: ['cuisine', 'kitchen'],
    title: 'Cuisine équipée',
    description:
      'Tout le nécessaire pour cuisiner sur place et garder le rythme d’un vrai séjour, pas d’une simple nuit d’hôtel.',
  },
  {
    matches: ['linge', 'linen', 'washer', 'dryer'],
    title: 'Linge et entretien',
    description:
      'Le linge de maison et les équipements du quotidien sont prévus pour un séjour confortable dès l’arrivée.',
  },
  {
    matches: ['clim', 'air conditioning', 'heating'],
    title: 'Confort thermique',
    description:
      'L’appartement reste agréable toute l’année avec une température adaptée à la saison.',
  },
  {
    matches: ['parking'],
    title: 'Stationnement',
    description:
      'Un vrai plus pour simplifier les arrivées tardives, les départs matinaux et les séjours plus longs.',
  },
  {
    matches: ['tv', 'television'],
    title: 'Espace détente',
    description:
      'Un coin salon pensé pour se reposer après la journée, lire, regarder un film ou simplement ralentir.',
  },
  {
    matches: ['workspace', 'desk', 'travail'],
    title: 'Coin bureau',
    description:
      'Un espace pratique pour ouvrir un ordinateur, écrire quelques mails ou prolonger un séjour pro.',
  },
  {
    matches: ['coffee', 'espresso', 'maker'],
    title: 'Coin café',
    description: 'De quoi démarrer la journée sur place, sans sortie imposée dès le réveil.',
  },
  {
    matches: ['soap', 'shampoo', 'body wash'],
    title: 'Salle de bain équipée',
    description: 'Les essentiels sont prévus pour voyager plus léger et garder une arrivée simple.',
  },
]

const FALLBACK_FEATURES: FeatureItem[] = [
  {
    title: 'Arrivée fluide',
    description:
      'Le parcours de réservation et d’arrivée est pensé pour rester simple, même en cas d’arrivée tardive.',
  },
  {
    title: 'Quartier vivant',
    description:
      'L’emplacement permet de rejoindre facilement les bonnes adresses, les transports et les points d’intérêt.',
  },
  {
    title: 'Séjour autonome',
    description:
      'Vous gardez l’intimité et la liberté d’un appartement, avec le niveau d’attention attendu pour un séjour premium.',
  },
]

const FEATURE_LIBRARY_EN = [
  {
    matches: ['wifi', 'internet'],
    title: 'Fast Wi-Fi',
    description: 'A stable connection for remote work, calls, or streaming during your stay.',
  },
  {
    matches: ['cuisine', 'kitchen'],
    title: 'Equipped kitchen',
    description: 'Everything needed to cook at home and keep the rhythm of a real stay.',
  },
  {
    matches: ['linge', 'linen', 'washer', 'dryer'],
    title: 'Linen and laundry',
    description: 'Household linen and daily essentials are prepared for a comfortable arrival.',
  },
  {
    matches: ['clim', 'air conditioning', 'heating'],
    title: 'Thermal comfort',
    description: 'The apartment stays comfortable year-round with season-ready equipment.',
  },
  {
    matches: ['parking'],
    title: 'Parking',
    description: 'A practical addition for late arrivals, early departures, and longer stays.',
  },
  {
    matches: ['tv', 'television'],
    title: 'Relaxation area',
    description: 'A living space designed to rest after the day, read, watch a film, or slow down.',
  },
  {
    matches: ['workspace', 'desk', 'travail'],
    title: 'Workspace',
    description: 'A practical spot to open a laptop, answer emails, or extend a work stay.',
  },
  {
    matches: ['coffee', 'espresso', 'maker'],
    title: 'Coffee corner',
    description: 'Everything needed to start the day at home.',
  },
  {
    matches: ['soap', 'shampoo', 'body wash'],
    title: 'Equipped bathroom',
    description: 'Essentials are provided so you can travel lighter.',
  },
]

const FALLBACK_FEATURES_EN: FeatureItem[] = [
  {
    title: 'Easy arrival',
    description:
      'The booking and arrival flow is designed to stay simple, even for late check-ins.',
  },
  {
    title: 'Lively neighborhood',
    description:
      'The location keeps restaurants, transport, and points of interest within easy reach.',
  },
  {
    title: 'Independent stay',
    description:
      'You keep the privacy and freedom of an apartment, with the expected level of care.',
  },
]

const APARTMENT_COPY = {
  fr: {
    trips: '114 voyages',
    fallbackNeighborhood: 'Quartier central',
    guests: (count: number) => `${count} p.`,
    bedroom: (count: number) => `${count} chambre${count > 1 ? 's' : ''}`,
    apartmentsTitle: (city: string | null) =>
      city ? `Nos appartements à ${city}` : 'Nos appartements',
    minNightsQuestion: 'Quelle est la durée minimum du séjour ?',
    faqTitle: 'FAQ',
    faqHeading: 'Questions fréquentes',
    minNightsAnswer: (nights: number, city: string) =>
      `Le séjour minimum est de ${nights} nuit${nights > 1 ? 's' : ''}. Cela permet de conserver une expérience homogène dans l’appartement et dans ${city}.`,
    featureLibrary: FEATURE_LIBRARY,
    fallbackFeatures: FALLBACK_FEATURES,
  },
  en: {
    trips: '114 stays',
    fallbackNeighborhood: 'Central neighborhood',
    guests: (count: number) => `${count} guest${count > 1 ? 's' : ''}`,
    bedroom: (count: number) => `${count} bedroom${count > 1 ? 's' : ''}`,
    apartmentsTitle: (city: string | null) =>
      city ? `Our apartments in ${city}` : 'Our apartments',
    minNightsQuestion: 'What is the minimum stay?',
    faqTitle: 'FAQ',
    faqHeading: 'Frequently asked questions',
    minNightsAnswer: (nights: number, city: string) =>
      `The minimum stay is ${nights} night${nights > 1 ? 's' : ''}. This helps keep a consistent experience in the apartment and in ${city}.`,
    featureLibrary: FEATURE_LIBRARY_EN,
    fallbackFeatures: FALLBACK_FEATURES_EN,
  },
} as const

const FALLBACK_REVIEW: ReviewItem = {
  quote:
    'On s’est sentis chez nous dès la première minute. L’appartement est exactement comme sur les photos, en mieux.',
  name: 'Sofia & Léo',
  stay: 'Mars 2026',
}

export function ApartmentView({
  apartment,
  recommendations,
  globalFaq,
  globalTestimonials,
  locale,
  initialShouldVerifyQuote = false,
}: Props) {
  const copy = APARTMENT_COPY[locale]
  const cityName = getCityName(apartment)
  const neighborhoodName = getNeighborhoodName(apartment, copy.fallbackNeighborhood)
  const coverImage = apartment.images[0] ?? apartment.image
  const galleryImages = getGalleryImages(apartment)
  const featureItems = getFeatureItems(apartment, copy)
  const faqItems = getFaqItems(apartment, globalFaq, copy)
  const review = pickReview(globalTestimonials)
  const recommendationItems = getRecommendationItems(
    apartment,
    recommendations,
    copy.fallbackNeighborhood,
  )
  const recommendationTitle = copy.apartmentsTitle(cityName)
  const description = apartment.description
  const space = apartment.space
  const transit = apartment.transit

  return (
    <>
      <Header mode="apartment" />

      <main
        className="max-w-content px-gutter md:px-gutter-md mx-auto w-full pt-10 pb-16 lg:pt-14 lg:pb-24"
        style={{ background: 'var(--Floral-white, #FFFFF8)' }}
      >
        <Breadcrumbs
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Appartements', href: '/appartements' },
            { label: apartment.name },
          ]}
          className="mb-8"
        />

        <section>
          <h1 className="text-coffee text-h4 sm:text-h3 max-w-4xl font-bold">{apartment.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <MetaStat icon={<GuestsIcon />} value={copy.guests(apartment.guests)} />
            {apartment.surface > 0 && (
              <MetaStat icon={<SurfaceIcon />} value={`${apartment.surface} m²`} />
            )}
            {apartment.bedrooms > 0 && (
              <MetaStat icon={<BedroomIcon />} value={copy.bedroom(apartment.bedrooms)} />
            )}
            <MetaStat value={copy.trips} />
          </div>

          <div className="mt-6">
            <ApartmentGallery name={apartment.name} images={galleryImages} />
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_498px] lg:items-start">
          <div className="space-y-6">
            <section className="border-divider border-y py-8">
              <div className="flex flex-wrap items-start justify-between gap-4 sm:items-center sm:gap-5">
                <div className="flex items-center gap-4">
                  <div className="bg-sand relative size-[51px] overflow-hidden rounded-full">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={apartment.name}
                        fill
                        sizes="51px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="text-coffee flex size-full items-center justify-center">
                        <PinAvatarIcon />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                    <p className="text-coffee text-body-xl sm:text-h5 font-bold">{cityName}</p>
                    <p className="text-coffee text-body-xl sm:text-h5 font-bold">
                      {neighborhoodName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 max-w-3xl space-y-5 sm:mt-8">
                <p className="text-ash text-body leading-[1.6]">{description}</p>
                {space && <p className="text-ash text-body leading-[1.6]">{space}</p>}
                {transit && <p className="text-ash text-body leading-[1.6]">{transit}</p>}
              </div>
            </section>

            <section className="border-divider border-b pb-8">
              <ApartmentMap
                name={apartment.name}
                lat={apartment.lat}
                lng={apartment.lng}
                address={apartment.address}
                neighborhood={neighborhoodName}
              />

              <div className="mt-8 space-y-6">
                {featureItems.map((feature) => (
                  <div key={feature.title}>
                    <h2 className="text-coffee text-body-xl font-semibold">{feature.title}</h2>
                    <p className="text-ash text-body mt-2 leading-[1.6]">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="pb-8">
              <ApartmentFaq items={faqItems} title={copy.faqTitle} heading={copy.faqHeading} />
            </section>
          </div>

          <aside className="self-start lg:sticky lg:top-28">
            <ResponsiveBooking
              price={apartment.price}
              slug={apartment.slug}
              listingId={apartment.id}
              capacity={apartment.guests}
              minNights={apartment.minNights}
              maxNights={apartment.maxNights}
              initialShouldVerifyQuote={initialShouldVerifyQuote}
            />
          </aside>
        </div>

        <div className="mt-10 space-y-10">
          {recommendationItems.length > 0 && (
            <section className="pt-2">
              <ApartmentsCarousel apartments={recommendationItems} title={recommendationTitle} />
            </section>
          )}

          <InternalLinkSection
            eyebrow="Alto"
            title="Préparer votre séjour"
            items={getApartmentInternalLinks(cityName)}
          />

          <ApartmentEditorialSections review={review} />
        </div>
      </main>

      <Footer reserveStickyCtaSpace="mobile" />
    </>
  )
}

function getApartmentInternalLinks(cityName: string | null) {
  const city = normalizeValue(cityName)
  const cityLink = city.includes('lyon')
    ? {
        label: 'Appartements à Lyon',
        href: '/lyon',
        description: 'Découvrir les adresses Alto, les quartiers et les repères utiles à Lyon.',
      }
    : {
        label: 'Tous les appartements',
        href: '/appartements',
        description: 'Comparer les appartements Alto disponibles pour vos prochaines dates.',
      }

  return [
    cityLink,
    {
      label: 'Journal Alto',
      href: '/blog',
      description: 'Lire nos guides de quartiers et conseils pratiques avant votre arrivée.',
    },
    {
      label: 'Notre approche',
      href: '/notre-histoire',
      description: 'Comprendre les standards Alto et la manière dont les appartements sont pensés.',
    },
  ]
}

function pickReview(globalTestimonials: StoryblokTestimonial[]): ReviewItem {
  const first = globalTestimonials[0]
  if (!first) return FALLBACK_REVIEW
  return {
    quote: first.quote,
    name: first.name,
    stay: [first.apartment, first.stay].filter(Boolean).join(' | '),
  }
}

function getFeatureItems(
  apartment: Apartment,
  copy: (typeof APARTMENT_COPY)[InquiryLocale],
): FeatureItem[] {
  const items: FeatureItem[] = []
  const seen = new Set<string>()
  const normalizedAmenities = apartment.amenities.map(normalizeValue)

  for (const preset of copy.featureLibrary) {
    const matchFound = normalizedAmenities.some((amenity) =>
      preset.matches.some((match) => amenity.includes(match)),
    )

    if (!matchFound || seen.has(preset.title)) continue

    seen.add(preset.title)
    items.push({ title: preset.title, description: preset.description })

    if (items.length === 5) break
  }

  for (const fallback of copy.fallbackFeatures) {
    if (items.length === 5) break
    if (seen.has(fallback.title)) continue
    items.push(fallback)
  }

  return items
}

function getGalleryImages(apartment: Apartment) {
  const images = apartment.images.filter(Boolean)
  if (images.length > 0) return images
  return apartment.image ? [apartment.image] : []
}

function getFaqItems(
  apartment: Apartment,
  globalFaq: StoryblokFaqItem[],
  copy: (typeof APARTMENT_COPY)[InquiryLocale],
) {
  const minNights = apartment.minNights > 0 ? apartment.minNights : 2
  const cityName = getCityName(apartment)

  return [
    ...globalFaq,
    {
      question: copy.minNightsQuestion,
      answer: copy.minNightsAnswer(minNights, cityName),
    },
  ]
}

function getRecommendationItems(
  apartment: Apartment,
  recommendations: Apartment[],
  fallbackNeighborhood: string,
) {
  const sameCity = recommendations.filter(
    (item) => normalizeValue(item.city) === normalizeValue(apartment.city),
  )
  const fallback = recommendations.filter(
    (item) => normalizeValue(item.city) !== normalizeValue(apartment.city),
  )

  return [...sameCity, ...fallback].slice(0, 4).map((item) => ({
    ...item,
    neighborhoodLabel: getNeighborhoodName(item, fallbackNeighborhood),
  }))
}

function getCityName(apartment: Apartment) {
  if (apartment.city) return apartment.city

  const addressParts = (apartment.address ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  return addressParts.at(-1) ?? 'Paris'
}

function getNeighborhoodName(apartment: Apartment, fallbackNeighborhood: string) {
  const mapped = getNeighborhoodBySlug(apartment.slug)
  if (mapped) return mapped

  const raw = apartment.address ?? ''
  const byDash = raw.split(' - ')[0]?.trim()
  if (byDash && byDash.length <= 32) return byDash

  const byComma = raw.split(',')[0]?.trim()
  if (byComma && byComma.length <= 32) return byComma

  return apartment.city ?? fallbackNeighborhood
}

function normalizeValue(value: string | undefined | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function MetaStat({ icon, value }: { icon?: React.ReactNode; value: string }) {
  return (
    <div className="text-taupe flex items-center gap-2">
      {icon && (
        <span className="text-silver flex size-[19px] items-center justify-center">{icon}</span>
      )}
      <span className="text-caption font-bold">{value}</span>
    </div>
  )
}

function GuestsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9.5" cy="6.5" r="3" />
      <path d="M3.5 16c0-3 2.7-5 6-5s6 2 6 5" />
    </svg>
  )
}

function SurfaceIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="13" height="13" rx="0.5" />
      <path d="M5.5 5.5v2M5.5 5.5h2M13.5 13.5v-2M13.5 13.5h-2" />
    </svg>
  )
}

function BedroomIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 13V6.5M16.5 13V9.5a2 2 0 0 0-2-2H7" />
      <path d="M2.5 11h14" />
      <circle cx="5.5" cy="9" r="1.2" />
    </svg>
  )
}

function PinAvatarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17s5-4.3 5-9a5 5 0 1 0-10 0c0 4.7 5 9 5 9Z" />
      <circle cx="10" cy="8" r="1.8" />
    </svg>
  )
}
