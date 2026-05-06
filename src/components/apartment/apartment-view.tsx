import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentBooking } from '@/components/apartment/booking'
import { ApartmentGallery } from '@/components/apartment/gallery'
import { ApartmentFaq } from '@/components/apartment/faq'
import { ApartmentsCarousel } from '@/components/sections/apartments-carousel'
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

const SERVICE_ITEMS = [
  { title: 'Self check-in', icon: <CheckInServiceIcon /> },
  { title: 'Ménage', icon: <CleaningServiceIcon /> },
  { title: 'Support 24/24', icon: <SupportServiceIcon /> },
  { title: 'Pas de frais cachés', icon: <WalletServiceIcon /> },
]

export function ApartmentView({ apartment, recommendations }: Props) {
  const cityName = getCityName(apartment)
  const neighborhoodName = getNeighborhoodName(apartment)
  const coverImage = apartment.images[0] ?? apartment.image
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
            <ApartmentGallery name={apartment.name} images={apartment.images} />
          </div>
        </section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_498px] lg:items-start">
          <div className="space-y-10">
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

                <Link
                  href={`/appartements${cityName ? `?city=${normalizeValue(cityName)}` : ''}`}
                  aria-label="Voir les appartements sur la carte"
                  className="bg-coffee text-cream flex size-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
                >
                  <MapIcon />
                </Link>
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
              <div className="space-y-6">
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
            />
          </aside>
        </div>

        <div className="mt-10 space-y-10">
          <section className="border-divider border-b py-10">
            <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
              Témoignages
            </p>

            <blockquote className="text-coffee text-h4 mt-8 max-w-5xl leading-[1.35] font-bold tracking-[-0.03em] sm:text-[28px] md:text-h2">
              &ldquo;{review.quote}&rdquo;
            </blockquote>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-coffee text-body-xl font-semibold">{review.name}</p>
                <p className="text-ash text-body mt-1">{review.stay}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="bg-silver size-1.5 rounded-full" />
                <span className="bg-silver size-1.5 rounded-full" />
                <span className="bg-coffee size-2.5 rounded-full" />
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {SERVICE_ITEMS.map((item) => (
              <article
                key={item.title}
                className="bg-ash/10 flex min-h-40 flex-col items-center justify-center rounded-lg px-5 py-6 text-center md:min-h-[205px] md:px-6 md:py-8"
              >
                <span className="text-ash flex h-[58px] items-center justify-center">{item.icon}</span>
                <p className="text-ash text-body mt-4 font-semibold md:text-body-xl md:mt-6">
                  {item.title}
                </p>
              </article>
            ))}
          </section>

          {recommendationItems.length > 0 && (
            <section className="pt-2">
              <ApartmentsCarousel apartments={recommendationItems} title={recommendationTitle} />
            </section>
          )}
        </div>
      </main>

      <Footer reserveStickyCtaSpace="mobile" />

      <div className="bg-cream/95 border-divider fixed inset-x-0 bottom-0 z-40 border-t p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-coffee text-body-xl font-semibold">
              {apartment.price.toLocaleString('fr-FR')}&euro;
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

function MapIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  )
}

function CheckInServiceIcon() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M27.9948 29.4922C27.6281 26.5812 26.2059 23.906 23.9979 21.974C21.7898 20.0419 18.9495 18.9874 16.0156 19.0104C13.0077 18.9869 10.1009 20.0958 7.87303 22.117C5.64513 24.1381 4.25917 26.9234 3.99054 29.9194" />
      <path d="M22.7539 9.27734C22.7539 11.0644 22.044 12.7784 20.7803 14.042C19.5166 15.3057 17.8027 16.0156 16.0156 16.0156C14.2285 16.0156 12.5146 15.3057 11.2509 14.042C9.98727 12.7784 9.27734 11.0644 9.27734 9.27734V4.03646C9.27734 3.63932 9.4351 3.25846 9.71592 2.97764C9.99674 2.69682 10.3776 2.53906 10.7747 2.53906H21.2565C21.6536 2.53906 22.0345 2.69682 22.3153 2.97764C22.5961 3.25846 22.7539 3.63932 22.7539 4.03646V9.27734Z" />
      <path d="M47.4609 47.4609H2.53906V32.487C2.53906 31.6927 2.85458 30.931 3.41622 30.3693C3.97785 29.8077 4.73959 29.4922 5.53385 29.4922H44.4661C45.2604 29.4922 46.0221 29.8077 46.5838 30.3693C47.1454 30.931 47.4609 31.6927 47.4609 32.487V47.4609Z" />
      <path d="M9.28932 9.64271C11.4526 8.89493 13.7268 8.51827 16.0156 8.52865C18.3081 8.51827 20.5857 8.8963 22.7519 9.6467" />
      <path d="M30.9896 29.4922C31.0425 27.5065 31.8821 25.6232 33.3236 24.2566C34.0374 23.5799 34.8775 23.0504 35.7959 22.6984C36.7143 22.3463 37.693 22.1786 38.6762 22.2049C39.6594 22.2311 40.6278 22.4507 41.5262 22.8512C42.4245 23.2517 43.2351 23.8252 43.9118 24.5389C44.5885 25.2527 45.118 26.0928 45.47 27.0112C45.8221 27.9295 45.9898 28.9083 45.9635 29.8915" />
      <path d="M38.4766 22.0052V17.513" />
      <path d="M35.4818 17.513H41.4714" />
    </svg>
  )
}

function CleaningServiceIcon() {
  return (
    <svg
      width="38"
      height="47"
      viewBox="0 0 37.5 46.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M36.75 36.7502L28.264 45.2362L23.278 38.8362C22.6049 37.9699 22.2713 36.8877 22.3398 35.7928C22.4083 34.6979 22.8742 33.6658 23.65 32.8901L24.396 32.1441C25.1717 31.3692 26.2037 30.904 27.2981 30.8359C28.3925 30.7677 29.4741 31.1014 30.34 31.7741L36.75 36.7502Z" />
      <path d="M24.0221 32.5082L10.0081 18.4941" />
      <path d="M2.25006 6.75001C2.25006 8.34131 2.8822 9.86744 4.00742 10.9927C5.13264 12.1179 6.65876 12.75 8.25006 12.75C9.84136 12.75 11.3675 12.1179 12.4927 10.9927C13.6179 9.86744 14.2501 8.34131 14.2501 6.75001C14.2501 5.15871 13.6179 3.63258 12.4927 2.50736C11.3675 1.38214 9.84136 0.75 8.25006 0.75C6.65876 0.75 5.13264 1.38214 4.00742 2.50736C2.8822 3.63258 2.25006 5.15871 2.25006 6.75001Z" />
      <path d="M3.75 16.554C2.83791 17.0806 2.08049 17.838 1.55389 18.75C1.02728 19.6621 0.750027 20.6968 0.75 21.75V30.75C0.75 31.5456 1.06607 32.3087 1.62868 32.8713C2.19129 33.4339 2.95435 33.75 3.75 33.75V41.25C3.75 42.4435 4.22411 43.5881 5.06802 44.432C5.91193 45.2759 7.05653 45.75 8.25 45.75C9.44348 45.75 10.5881 45.2759 11.432 44.432C12.2759 43.5881 12.75 42.4435 12.75 41.25V33.75C13.5457 33.75 14.3087 33.4339 14.8713 32.8713C15.4339 32.3087 15.75 31.5456 15.75 30.75" />
    </svg>
  )
}

function SupportServiceIcon() {
  return (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.8982 32.7676C14.5415 32.1226 14.9028 31.2487 14.9028 30.3376C14.9028 29.4265 14.5415 28.5527 13.8982 27.9077L10.2515 24.2682C9.9326 23.9492 9.55398 23.6961 9.13725 23.5234C8.72049 23.3508 8.27385 23.2619 7.82275 23.2619C7.37166 23.2619 6.92501 23.3508 6.50828 23.5234C6.09155 23.6961 5.7129 23.9492 5.394 24.2682L3.39542 26.2668C2.55492 27.1061 2.03072 28.2105 1.91178 29.3922C1.79285 30.5742 2.08651 31.7608 2.74292 32.7507C8.62598 41.6075 16.2186 49.2 25.0753 55.0831C26.0654 55.7395 27.252 56.0336 28.434 55.9154C29.616 55.7974 30.7209 55.2745 31.5617 54.4354L33.5602 52.4344C33.8792 52.1157 34.1323 51.7372 34.3048 51.3208C34.4774 50.9042 34.5663 50.4578 34.5663 50.0069C34.5663 49.5559 34.4774 49.1096 34.3048 48.6929C34.1323 48.2765 33.8792 47.8981 33.5602 47.5793L29.9159 43.935C29.5969 43.616 29.2185 43.363 28.8016 43.1902C28.385 43.0176 27.9384 42.9287 27.4872 42.9287C27.036 42.9287 26.5894 43.0176 26.1727 43.1902C25.7559 43.363 25.3774 43.616 25.0584 43.935L23.8501 45.1433C19.7788 41.7919 16.0421 38.0536 12.6923 33.9808L13.8982 32.7676Z" />
      <path d="M26.9144 28.9251H25.7447C25.1312 28.9251 24.5234 28.8042 23.9565 28.5693C23.3896 28.3344 22.8745 27.9901 22.4407 27.556C22.0069 27.122 21.6629 26.6068 21.4282 26.0396C21.1936 25.4726 21.073 24.8648 21.0733 24.2512V19.575C21.073 18.9614 21.1936 18.3538 21.4283 17.7869C21.6629 17.22 22.007 16.7049 22.4409 16.2711C22.8747 15.8372 23.3898 15.4932 23.9567 15.2585C24.5236 15.0239 25.1312 14.9032 25.7447 14.9036H26.9144C27.0676 14.9036 27.2194 14.9338 27.361 14.9924C27.5026 15.0511 27.6314 15.1371 27.7397 15.2454C27.8482 15.3538 27.9343 15.4825 27.9927 15.6241C28.0515 15.7658 28.0817 15.9175 28.0817 16.0708V27.7506C28.0824 27.9043 28.0527 28.0568 27.9942 28.1991C27.9359 28.3415 27.8502 28.4707 27.7416 28.58C27.6331 28.689 27.5043 28.7757 27.3625 28.8349C27.2204 28.8942 27.0681 28.9248 26.9144 28.9251Z" />
      <path d="M51.4436 28.9248H50.2667C49.9568 28.9244 49.6601 28.8009 49.4411 28.5814C49.2224 28.3622 49.0994 28.065 49.0994 27.7552V16.0755C49.0994 15.9223 49.1296 15.7705 49.1884 15.6288C49.2468 15.4872 49.3329 15.3586 49.4414 15.2502C49.5496 15.1418 49.6785 15.0558 49.8201 14.9971C49.9617 14.9385 50.1134 14.9083 50.2667 14.9083H51.4363C52.0499 14.9073 52.6577 15.0273 53.2252 15.2613C53.7923 15.4954 54.3081 15.8389 54.7426 16.2722C55.1771 16.7056 55.5219 17.2203 55.7573 17.787C55.9927 18.3537 56.1143 18.9612 56.115 19.5749V24.2462C56.1157 24.8603 55.9954 25.4683 55.761 26.0357C55.5263 26.6032 55.1824 27.1189 54.7486 27.5534C54.3148 27.9879 53.7996 28.3328 53.2326 28.5681C52.6655 28.8033 52.0577 28.9246 51.4436 28.9248Z" />
      <path d="M25.7447 14.9085C25.7447 11.5007 27.0986 8.23235 29.5082 5.82262C31.9179 3.41289 35.1862 2.05912 38.5942 2.05912C42.0021 2.05912 45.2704 3.41289 47.6801 5.82262C50.0898 8.23235 51.4436 11.5007 51.4436 14.9085" />
      <path d="M43.2583 34.7637H46.7625C47.3761 34.764 47.9839 34.6434 48.5508 34.4087C49.118 34.1743 49.6333 33.8302 50.0673 33.3964C50.5013 32.9626 50.8457 32.4474 51.0806 31.8807C51.3155 31.3137 51.4363 30.7059 51.4363 30.0923" />
      <path d="M33.9227 13.7388C33.923 12.8824 34.1586 12.0425 34.6038 11.3109C35.0492 10.5794 35.6869 9.98434 36.4477 9.59081C37.2082 9.19728 38.0625 9.0204 38.9168 9.07956C39.7711 9.1387 40.5928 9.43157 41.2919 9.92617C41.991 10.4208 42.5408 11.098 42.8811 11.884C43.2214 12.6699 43.339 13.5342 43.2211 14.3825C43.1034 15.2308 42.7547 16.0303 42.2131 16.6938C41.6715 17.3572 40.9579 17.859 40.1505 18.1444C39.6952 18.3061 39.3013 18.6047 39.0226 18.9994C38.744 19.394 38.5942 19.8652 38.5942 20.3484V20.7471" />
      <path d="M38.6183 27.9415C38.1178 27.9415 37.7121 27.5357 37.7121 27.0352C37.7121 26.5348 38.1178 26.129 38.6183 26.129" />
      <path d="M38.6183 27.9415C39.1188 27.9415 39.5246 27.5357 39.5246 27.0352C39.5246 26.5348 39.1188 26.129 38.6183 26.129" />
    </svg>
  )
}

function WalletServiceIcon() {
  return (
    <svg
      width="58"
      height="58"
      viewBox="0 0 58 58"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M52.5625 43.5V51.9583C52.5625 52.9197 52.1807 53.8419 51.5009 54.5217C50.821 55.2015 49.8989 55.5833 48.9375 55.5833H7.25C5.80788 55.5833 4.42484 55.0103 3.40511 53.9907C2.38538 52.9709 1.8125 51.5879 1.8125 50.1458V7.85417C1.8125 6.41205 2.38538 5.02901 3.40511 4.00927C4.42484 2.98954 5.80788 2.41667 7.25 2.41667H45.3125C46.2739 2.41667 47.196 2.7986 47.8759 3.4784C48.5557 4.15821 48.9375 5.08027 48.9375 6.04167V13.8958" />
      <path d="M52.5625 43.5C53.5239 43.5 54.446 43.1182 55.1259 42.4384C55.8057 41.7585 56.1875 40.8364 56.1875 39.875V29C56.1875 28.0386 55.8057 27.1165 55.1259 26.4366C54.446 25.7568 53.5239 25.375 52.5625 25.375H42.2917C39.8881 25.375 37.583 26.3298 35.8834 28.0292C34.184 29.7289 33.2292 32.0339 33.2292 34.4375C33.2292 36.8411 34.184 39.1461 35.8834 40.8458C37.583 42.5452 39.8881 43.5 42.2917 43.5H52.5625Z" />
      <path d="M43.4882 35.3319C42.9877 35.3319 42.5819 34.9264 42.5819 34.4257C42.5819 33.9252 42.9877 33.5194 43.4882 33.5194" />
      <path d="M43.4882 35.3319C43.9887 35.3319 44.3944 34.9264 44.3944 34.4257C44.3944 33.9252 43.9887 33.5194 43.4882 33.5194" />
      <path d="M52.5625 25.375V17.5209C52.5625 16.5594 52.1807 15.6374 51.5009 14.9576C50.821 14.2778 49.8988 13.8959 48.9375 13.8959H13.6058C12.8115 13.9379 12.0214 13.7564 11.3251 13.3719C10.6288 12.9875 10.0542 12.4155 9.66667 11.7209" />
    </svg>
  )
}
