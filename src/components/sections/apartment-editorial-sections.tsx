import Image from 'next/image'
import { ExperienceSection } from '@/components/sections/experience-section'

const SERVICES = [
  {
    title: 'Self check-in',
    description: 'Arrivez quand vous voulez, et repartez quand vous voulez, comme à la maison.',
    icon: <CheckInServiceIcon />,
  },
  {
    title: 'Ménage',
    description: 'Des standards de ménage professionnels pour des appartements immaculés.',
    icon: <CleaningServiceIcon />,
  },
  {
    title: 'Support 24/24',
    description: 'Nous restons joignables 24h sur 24 pour vous assister en cas de problème.',
    icon: <SupportServiceIcon />,
  },
  {
    title: 'Pas de frais cachés',
    description: 'Pas de frais de réservation cachés ni de frais de plateformes sur notre site.',
    icon: <WalletServiceIcon />,
  },
] as const

const DEFAULT_REVIEW = {
  quote:
    'On s’est sentis chez nous dès la première minute. L’appartement est exactement comme sur les photos, en mieux.',
  name: 'Sofia & Léo',
  stay: 'L’Opéra | Mars 2026',
}

interface Review {
  quote: string
  name: string
  stay: string
}

export function ApartmentEditorialSections({ review = DEFAULT_REVIEW }: { review?: Review }) {
  return (
    <section className="mt-section-md pb-section-md">
      <ExperienceSection
        panelImages={{
          arrival: '/images/experience-espaces.png',
          checkin: '/images/experience-localisation.png',
          checkout: '/images/blog-3.jpg',
        }}
      />
      <div className="mx-auto max-w-content px-gutter md:px-gutter-md">
        <ApartmentTrustSection review={review} />
      </div>
    </section>
  )
}

function ApartmentTrustSection({ review }: { review: Review }) {
  return (
    <section className="pt-8">
      <div className="border-divider border-b pb-14">
        <p className="text-silver text-overline font-bold uppercase">Témoignages</p>

        <blockquote className="text-coffee mt-10 max-w-[1192px] text-h4 font-bold leading-[1.3] tracking-[-0.72px] md:text-h2">
          &ldquo;{review.quote}&rdquo;
        </blockquote>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-coffee text-body-xl font-semibold">{review.name}</p>
            <p className="text-ash text-body mt-1">{review.stay}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-divider size-1.5 rounded-full" />
            <span className="bg-divider size-1.5 rounded-full" />
            <span className="bg-ash size-2.5 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
        {SERVICES.map((item) => (
          <article
            key={item.title}
            className="bg-ash/10 flex min-h-[212px] flex-col items-center justify-center rounded-lg px-7 py-8 text-center md:min-h-[252px]"
          >
            <span className="text-ash flex h-[58px] items-center justify-center">{item.icon}</span>
            <h3 className="text-coffee text-body-xl mt-6 font-semibold">{item.title}</h3>
            <p className="text-coffee text-body-sm mt-4 max-w-[211px]">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function CheckInServiceIcon() {
  return (
    <Image src="/images/icons/checkin.svg" alt="" width={50} height={50} aria-hidden="true" />
  )
}

function CleaningServiceIcon() {
  return (
    <Image src="/images/icons/cleaning.svg" alt="" width={38} height={47} aria-hidden="true" />
  )
}

function SupportServiceIcon() {
  return (
    <Image src="/images/icons/support.svg" alt="" width={58} height={58} aria-hidden="true" />
  )
}

function WalletServiceIcon() {
  return (
    <Image src="/images/icons/wallet.svg" alt="" width={58} height={58} aria-hidden="true" />
  )
}
