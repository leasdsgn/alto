import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentBooking } from '@/components/apartment/booking'
import { ApartmentGallery } from '@/components/apartment/gallery'
import { Button } from '@/components/ui/button'
import { type Apartment } from '@/types/apartment'

interface Props {
  apartment: Apartment
  recommendations: Apartment[]
}

const AMENITIES_ICONS: Record<string, React.ReactNode> = {
  wifi: <WifiIcon />,
  cuisine: <KitchenIcon />,
  kitchen: <KitchenIcon />,
  linge: <LinenIcon />,
  climatisation: <AcIcon />,
  'air conditioning': <AcIcon />,
  parking: <ParkingIcon />,
}

const FAQ_ITEMS = [
  { question: 'Comment fonctionne le check-in ?' },
  { question: 'Y a-t-il un ménage inclus ?' },
  { question: 'Puis-je réserver sans passer par Airbnb ?' },
  { question: 'Quelle est la différence avec un hôtel ?' },
  { question: 'Que comprend le prix affiché ?' },
]

export function ApartmentView({ apartment, recommendations }: Props) {
  const a = apartment
  const quartierName = a.address?.split(' - ')[0] ?? 'Le Marais'

  return (
    <>
      <Header mode="apartment" />

      <main className="mx-auto max-w-[1132px] px-6 md:px-12 lg:px-0">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[716px_1fr] lg:gap-8">
          <ApartmentGallery name={a.name} images={a.images} />

          <div className="hidden lg:block">
            <ApartmentBooking price={a.price} slug={a.slug} listingId={a.id} />
          </div>
        </section>

        <section className="mt-8 border-b border-divider pb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-coffee text-base font-bold">{a.name}</h1>
              <p className="text-coffee mt-1 text-xs font-medium">{quartierName} - Paris</p>
            </div>
            <div className="text-right lg:hidden">
              <p className="text-coffee text-xl font-bold">{a.price}€</p>
              <p className="text-silver text-xs">/ nuit</p>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-6">
            <Stat icon={<GuestsIcon />} value={`${a.guests}p.`} />
            {a.surface > 0 && <Stat icon={<SurfaceIcon />} value={`${a.surface}m²`} />}
            {a.bedrooms > 0 && <Stat icon={<BedroomIcon />} value={`${a.bedrooms} chambre`} />}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 border-b border-divider py-10 lg:grid-cols-[1fr_220px]">
          <div>
            <p className="text-coffee max-w-[560px] text-base font-bold leading-[1.35]">
              {a.description}
            </p>

            {a.space && (
              <p className="text-coffee mt-6 max-w-[560px] text-xs font-medium leading-[1.85]">
                {a.space}
              </p>
            )}
          </div>

          <div className="hidden rounded-xl border border-silver/50 p-5 lg:block">
            <p className="text-silver text-xs font-bold uppercase leading-[15px] tracking-wide">
              Ce que propose<br />le logement
            </p>
            <div className="mt-5 flex flex-col gap-0.5">
              {a.amenities.slice(0, 6).map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 py-1">
                  <span className="text-ash flex size-4 items-center justify-center">
                    {getAmenityIcon(amenity)}
                  </span>
                  <span className="text-ash text-xs leading-[45px]">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-divider py-10 lg:hidden">
          <div className="rounded-xl border border-silver/50 px-5 py-8">
            <p className="text-silver text-center text-xs font-bold uppercase tracking-wide">
              Ce que propose le logement
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6">
              {a.amenities.slice(0, 5).map((amenity) => (
                <div key={amenity} className="flex flex-col items-center gap-2">
                  <span className="text-ash flex size-10 items-center justify-center">
                    {getAmenityIcon(amenity)}
                  </span>
                  <span className="text-ash text-xs font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {a.neighborhood && (
          <section className="border-b border-divider py-10">
            <p className="text-silver text-xs font-bold uppercase tracking-wide">Le quartier</p>
            <h2 className="text-coffee mt-1 text-base font-medium">{quartierName}</h2>
            <p className="text-coffee mt-6 max-w-[408px] text-xs font-medium leading-[1.85]">
              {a.neighborhood}
            </p>
            <Link
              href="/appartements"
              className="text-silver mt-6 inline-block border-b border-silver/50 text-xs leading-[27px]"
            >
              Voir les appartements
            </Link>
          </section>
        )}

        <section className="border-b border-divider py-10">
          <p className="text-silver text-xs font-bold uppercase tracking-wide">FAQ</p>
          <h2 className="text-coffee mt-1 text-base font-medium">Questions fréquentes</h2>

          <div className="mt-6">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border-t border-divider">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <svg
                    width="7"
                    height="11"
                    viewBox="0 0 7 11"
                    fill="none"
                    className="shrink-0"
                  >
                    <path
                      d="M1 1l4.5 4.5L1 10"
                      stroke="#aba39e"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-silver text-base font-bold">{item.question}</span>
                </button>
              </div>
            ))}
            <div className="border-t border-divider" />
          </div>
        </section>

        <section className="py-10">
          <p className="text-silver text-xs font-bold uppercase tracking-wide">Les recommandations</p>
          <h2 className="text-coffee mt-1 text-base font-medium">Vous aimerez aussi</h2>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:gap-3">
            {recommendations.slice(0, 3).map((apt) => (
              <RecommendationCard key={apt.slug} apartment={apt} />
            ))}
          </div>
        </section>
      </main>

      <Footer reserveStickyCtaSpace="mobile" />

      <div className="bg-cream/95 fixed inset-x-0 bottom-0 z-40 border-t border-divider p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-coffee text-lg font-bold">{a.price}€</span>
            <span className="text-taupe text-sm"> /nuit</span>
          </div>
          <Button href={`/book/${a.slug}`}>Réserver</Button>
        </div>
      </div>
    </>
  )
}


function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-ash">{icon}</span>
      <span className="text-ash text-xs font-extrabold">{value}</span>
    </div>
  )
}

function RecommendationCard({ apartment }: { apartment: Apartment }) {
  const a = apartment
  const img = a.images[0] ?? a.image
  const location = a.address?.split(' - ')[0] ?? a.city ?? 'Paris'

  return (
    <article className="flex min-h-[520px] flex-1 flex-col">
      <div className="relative h-[360px] overflow-hidden rounded-xl">
        {img ? (
          <Image
            src={img}
            alt={a.name}
            fill
            sizes="(max-width: 1024px) 100vw, 304px"
            quality={80}
            className="object-cover"
          />
        ) : (
          <div className="bg-sand size-full" />
        )}
      </div>

      <div className="mt-6 flex min-h-[56px] items-start justify-between gap-4">
        <div>
          <h3 className="text-coffee text-base font-bold">{a.name}</h3>
          <p className="text-coffee mt-0.5 text-xs font-medium">{location}</p>
        </div>
        <p className="text-silver text-xs font-bold uppercase">{a.price}€/nuit</p>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Stat icon={<GuestsIcon />} value={`${a.guests}p.`} />
        {a.surface > 0 && <Stat icon={<SurfaceIcon />} value={`${a.surface}m²`} />}
      </div>

      <Button href={`/appartements/${a.slug}`} className="mt-8 w-fit lg:mt-auto lg:w-24">
        Voir
      </Button>
    </article>
  )
}

// Icons
function getAmenityIcon(amenity: string) {
  const normalized = amenity.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  if (normalized.includes('wifi') || normalized.includes('internet')) return <WifiIcon />
  if (normalized.includes('cuisine') || normalized.includes('kitchen')) return <KitchenIcon />
  if (normalized.includes('linge') || normalized.includes('linen') || normalized.includes('washer') || normalized.includes('dryer')) return <LinenIcon />
  if (normalized.includes('clim') || normalized.includes('air conditioning') || normalized.includes('heating')) return <AcIcon />
  if (normalized.includes('parking')) return <ParkingIcon />
  if (normalized.includes('tv') || normalized.includes('television')) return <TvIcon />
  if (normalized.includes('ascenseur') || normalized.includes('elevator')) return <ElevatorIcon />
  if (normalized.includes('seche') || normalized.includes('hair')) return <HairDryerIcon />
  if (normalized.includes('travail') || normalized.includes('workspace') || normalized.includes('desk')) return <WorkspaceIcon />

  return AMENITIES_ICONS[normalized] ?? <CheckIcon />
}

function GuestsIcon() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="none">
      <circle cx="6" cy="3" r="2.5" stroke="currentColor" strokeWidth="1" />
      <path d="M1 12a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1" />
      <circle cx="13" cy="4" r="2" stroke="currentColor" strokeWidth="1" />
      <path d="M11 12a4 4 0 0 1 6 0" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function SurfaceIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M1 4V1h3M9 1h3v3M12 9v3H9M4 12H1V9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BedroomIcon() {
  return (
    <svg width="19" height="14" viewBox="0 0 19 14" fill="none">
      <path d="M2 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v4M1 10h17v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2ZM5 5h3v2H5zM11 5h3v2h-3z" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M1 3a10 10 0 0 1 14 0M4 6a6 6 0 0 1 8 0M7 9a2 2 0 0 1 2 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}

function KitchenIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1" />
      <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </svg>
  )
}

function LinenIcon() {
  return (
    <svg width="15" height="9" viewBox="0 0 15 9" fill="none">
      <path d="M1 4.5h13M3 1l1.5 3.5L3 8M12 1l-1.5 3.5L12 8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AcIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
      <rect x="1" y="1" width="13" height="6" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M3 9v3M7.5 9v3M12 9v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function ParkingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1" />
      <path d="M5 10V4h3a2 2 0 0 1 0 4H5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TvIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
      <rect x="1" y="2" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M5 12h5M7.5 10v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function ElevatorIcon() {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
      <rect x="1" y="1" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4.5 5L6.5 3l2 2M4.5 10l2 2 2-2M6.5 3v9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HairDryerIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
      <path d="M1 4.5h7.5a3 3 0 0 1 0 6H1v-6Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <path d="M7 10.5 9 12M11.5 5.5h3M11.8 7.5h2.2M11.5 9.5h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function WorkspaceIcon() {
  return (
    <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
      <path d="M2 6h11v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6ZM5 6V3h5v3M4 13h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2.5 6.5 5.3 9.2 10.5 3.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
