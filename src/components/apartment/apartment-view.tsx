import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentBooking } from '@/components/apartment/booking'
import { ApartmentGallery } from '@/components/apartment/gallery'
import { ApartmentFaq } from '@/components/apartment/faq'
import { ApartmentMap } from '@/components/apartment/apartment-map'
import { ApartmentsCarousel } from '@/components/sections/apartments-carousel'
import { ApartmentEditorialSections } from '@/components/sections/apartment-editorial-sections'
import { Button } from '@/components/ui/button'
import { getNeighborhoodBySlug } from '@/lib/apartment-neighborhoods'
import { type Apartment } from '@/types/apartment'

interface Props {
  apartment: Apartment
  recommendations: Apartment[]
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

const BASE_FAQ = [
  'Comment fonctionne le check-in ?',
  'Le ménage est-il inclus ?',
  'Puis-je réserver en direct ?',
  'Quelle est la durée minimum du séjour ?',
  'Que comprend le prix affiché ?',
]

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

const REVIEW_BY_SLUG: Record<string, ReviewItem> = {
  'le-faubourg': {
    quote:
      'On s’est sentis chez nous dès la première minute. L’appartement est exactement comme sur les photos, en mieux.',
    name: 'Sofia & Léo',
    stay: 'Le Faubourg | Mars 2026',
  },
  'l-opera': {
    quote:
      'Le check-in autonome à minuit, sans stress. Et le quartier est parfait pour découvrir Paris à pied.',
    name: 'James W.',
    stay: 'L’Opéra | Mars 2026',
  },
  'le-saint-germain': {
    quote:
      'Trois nuits, et on a déjà réservé pour l’été. Le Saint-Germain est devenu notre adresse parisienne.',
    name: 'Marie & Thomas',
    stay: 'Le Saint-Germain | Avril 2026',
  },
}

export function ApartmentView({ apartment, recommendations }: Props) {
  const cityName = getCityName(apartment)
  const neighborhoodName = getNeighborhoodName(apartment)
  const coverImage = apartment.images[0] ?? apartment.image
  const galleryImages = getGalleryImages(apartment)
  const featureItems = getFeatureItems(apartment)
  const faqItems = getFaqItems(apartment)
  const review = REVIEW_BY_SLUG[apartment.slug] ?? REVIEW_BY_SLUG['le-faubourg']
  const recommendationItems = getRecommendationItems(apartment, recommendations)
  const recommendationTitle = cityName ? `Nos appartements à ${cityName}` : 'Nos appartements'

  return (
    <>
      <Header mode="apartment" />

      <main
        className="max-w-content px-gutter md:px-gutter-md mx-auto w-full pt-10 pb-16 lg:pt-14 lg:pb-24"
        style={{ background: 'var(--Floral-white, #FFFFF8)' }}
      >
        <section>
          <h1 className="text-coffee text-h4 max-w-4xl font-bold sm:text-h3">{apartment.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <MetaStat icon={<GuestsIcon />} value={`${apartment.guests} p.`} />
            {apartment.surface > 0 && (
              <MetaStat icon={<SurfaceIcon />} value={`${apartment.surface} m²`} />
            )}
            {apartment.bedrooms > 0 && (
              <MetaStat
                icon={<BedroomIcon />}
                value={`${apartment.bedrooms} chambre${apartment.bedrooms > 1 ? 's' : ''}`}
              />
            )}
            <MetaStat icon={<RatingIcon />} value="4,9 (113)" />
            <MetaStat value="114 voyages" />
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
                    <p className="text-coffee text-body-xl font-bold sm:text-h5">{cityName}</p>
                    <p className="text-coffee text-body-xl font-bold sm:text-h5">
                      {neighborhoodName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 max-w-3xl space-y-5 sm:mt-8">
                <p className="text-ash text-body leading-[1.6]">{apartment.description}</p>
                {apartment.space && (
                  <p className="text-ash text-body leading-[1.6]">{apartment.space}</p>
                )}
                {apartment.transit && (
                  <p className="text-ash text-body leading-[1.6]">{apartment.transit}</p>
                )}
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
              <ApartmentFaq items={faqItems} />
            </section>
          </div>

          <aside className="hidden self-start lg:sticky lg:top-28 lg:block">
            <ApartmentBooking
              price={apartment.price}
              slug={apartment.slug}
              listingId={apartment.id}
              capacity={apartment.guests}
              minNights={apartment.minNights}
              maxNights={apartment.maxNights}
            />
          </aside>
        </div>

        <div className="mt-10 space-y-10">
          {recommendationItems.length > 0 && (
            <section className="pt-2">
              <ApartmentsCarousel apartments={recommendationItems} title={recommendationTitle} />
            </section>
          )}

          <ApartmentEditorialSections review={review} />
        </div>
      </main>

      <Footer reserveStickyCtaSpace="mobile" />

      <div className="bg-cream/95 border-divider fixed inset-x-0 bottom-0 z-40 border-t p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-coffee text-body-xl font-semibold">
              Dès {apartment.price.toLocaleString('fr-FR')}&euro;
            </span>
            <span className="text-taupe text-body-sm"> /nuit</span>
          </div>
          <Button href={`/book/${apartment.slug}`}>Réserver</Button>
        </div>
      </div>
    </>
  )
}

function getFeatureItems(apartment: Apartment): FeatureItem[] {
  const items: FeatureItem[] = []
  const seen = new Set<string>()
  const normalizedAmenities = apartment.amenities.map(normalizeValue)

  for (const preset of FEATURE_LIBRARY) {
    const matchFound = normalizedAmenities.some((amenity) =>
      preset.matches.some((match) => amenity.includes(match)),
    )

    if (!matchFound || seen.has(preset.title)) continue

    seen.add(preset.title)
    items.push({ title: preset.title, description: preset.description })

    if (items.length === 5) break
  }

  for (const fallback of FALLBACK_FEATURES) {
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

function getFaqItems(apartment: Apartment) {
  const minNights = apartment.minNights > 0 ? apartment.minNights : 2
  const cityName = getCityName(apartment)

  return [
    {
      question: BASE_FAQ[0],
      answer:
        'L’arrivée se fait en autonomie avec des instructions envoyées avant le séjour. L’équipe reste disponible si vous avez besoin d’aide.',
    },
    {
      question: BASE_FAQ[1],
      answer:
        'Le ménage de départ est prévu et l’appartement est préparé avant votre arrivée pour un séjour sans logistique supplémentaire.',
    },
    {
      question: BASE_FAQ[2],
      answer:
        'Oui. La réservation peut se faire directement sur Alto avec le même niveau d’information, un contact plus direct et un suivi plus simple.',
    },
    {
      question: BASE_FAQ[3],
      answer: `Le séjour minimum est de ${minNights} nuit${minNights > 1 ? 's' : ''}. Cela permet de conserver une expérience homogène dans l’appartement et dans ${cityName}.`,
    },
    {
      question: BASE_FAQ[4],
      answer:
        'Le tarif couvre le logement, le linge de maison, le Wi-Fi et l’accompagnement de l’équipe. Les conditions exactes restent précisées au moment de la réservation.',
    },
  ]
}

function getRecommendationItems(apartment: Apartment, recommendations: Apartment[]) {
  const sameCity = recommendations.filter(
    (item) => normalizeValue(item.city) === normalizeValue(apartment.city),
  )
  const fallback = recommendations.filter(
    (item) => normalizeValue(item.city) !== normalizeValue(apartment.city),
  )

  return [...sameCity, ...fallback].slice(0, 4).map((item) => ({
    ...item,
    neighborhoodLabel: getNeighborhoodName(item),
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

function getNeighborhoodName(apartment: Apartment) {
  const mapped = getNeighborhoodBySlug(apartment.slug)
  if (mapped) return mapped

  const raw = apartment.address ?? ''
  const byDash = raw.split(' - ')[0]?.trim()
  if (byDash && byDash.length <= 32) return byDash

  const byComma = raw.split(',')[0]?.trim()
  if (byComma && byComma.length <= 32) return byComma

  return apartment.city ?? 'Quartier central'
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

function RatingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z" />
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
