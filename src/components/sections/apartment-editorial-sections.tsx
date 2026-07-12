import Image from 'next/image'
import { ExperienceSection } from '@/components/sections/experience-section'
import type { InquiryLocale } from '@/types/inquiry'

const EDITORIAL_COPY = {
  fr: {
    testimonials: 'Témoignages',
    services: [
      [
        'Self check-in',
        'Arrivez quand vous voulez, et repartez quand vous voulez, comme à la maison.',
      ],
      ['Ménage', 'Des standards de ménage professionnels pour des appartements immaculés.'],
      [
        'Support 24/24',
        'Nous restons joignables 24h sur 24 pour vous assister en cas de problème.',
      ],
      [
        'Pas de frais cachés',
        'Pas de frais de réservation cachés ni de frais de plateformes sur notre site.',
      ],
    ],
  },
  en: {
    testimonials: 'Testimonials',
    services: [
      [
        'Self check-in',
        'Arrive and leave when it suits you, with the freedom of a private apartment.',
      ],
      ['Cleaning', 'Professional housekeeping standards keep every apartment ready for your stay.'],
      ['24/7 support', 'Our team remains available around the clock if you need assistance.'],
      ['No hidden fees', 'No hidden booking or platform fees when booking on our website.'],
    ],
  },
} as const

const SERVICE_ICONS = [
  <CheckInServiceIcon key="check-in" />,
  <CleaningServiceIcon key="cleaning" />,
  <SupportServiceIcon key="support" />,
  <WalletServiceIcon key="wallet" />,
]

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

export function ApartmentEditorialSections({
  review = DEFAULT_REVIEW,
  locale,
}: {
  review?: Review
  locale: InquiryLocale
}) {
  return (
    <section className="mt-section-md pb-section-md">
      <ExperienceSection
        panelImages={{
          arrival: '/images/experience-espaces.png',
          checkin: '/images/experience-localisation.png',
          checkout: '/images/experience-confort.webp',
          sustainability: '/images/experience-durabilite.webp',
        }}
      />
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
        <ApartmentTrustSection review={review} locale={locale} />
      </div>
    </section>
  )
}

function ApartmentTrustSection({ review, locale }: { review: Review; locale: InquiryLocale }) {
  const copy = EDITORIAL_COPY[locale]

  return (
    <section className="pt-8">
      <div className="border-divider border-b pb-14">
        <p className="text-silver text-overline font-bold uppercase">{copy.testimonials}</p>

        <blockquote className="text-coffee text-h4 md:text-h2 mt-10 max-w-[1192px] leading-[1.3] font-bold tracking-[-0.72px]">
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
        {copy.services.map(([title, description], index) => (
          <article
            key={title}
            className="bg-ash/10 flex min-h-[212px] flex-col items-center justify-center rounded-lg px-7 py-8 text-center md:min-h-[252px]"
          >
            <span className="text-ash flex h-[58px] items-center justify-center">
              {SERVICE_ICONS[index]}
            </span>
            <h3 className="text-coffee text-body-xl mt-6 font-semibold">{title}</h3>
            <p className="text-coffee text-body-sm mt-4 max-w-[211px]">{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function CheckInServiceIcon() {
  return (
    <Image
      src="/images/icons/checkin.svg"
      alt=""
      width={50}
      height={50}
      style={{ height: 'auto' }}
      aria-hidden="true"
    />
  )
}

function CleaningServiceIcon() {
  return (
    <Image
      src="/images/icons/cleaning.svg"
      alt=""
      width={38}
      height={47}
      style={{ height: 'auto' }}
      aria-hidden="true"
    />
  )
}

function SupportServiceIcon() {
  return (
    <Image
      src="/images/icons/support.svg"
      alt=""
      width={58}
      height={58}
      style={{ height: 'auto' }}
      aria-hidden="true"
    />
  )
}

function WalletServiceIcon() {
  return (
    <Image
      src="/images/icons/wallet.svg"
      alt=""
      width={58}
      height={58}
      style={{ height: 'auto' }}
      aria-hidden="true"
    />
  )
}
