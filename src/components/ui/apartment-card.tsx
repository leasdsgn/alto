'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/components/providers/locale-provider'
import { type InquiryLocale } from '@/types/inquiry'

interface ApartmentCardProps {
  name: string
  price: number
  guests: number
  surface: number
  bedrooms: number
  slug: string
  image?: string
  city?: string
  neighborhood?: string
  priceSource?: 'base' | 'quote'
}

export function ApartmentCard({
  name,
  price,
  guests,
  surface,
  bedrooms,
  slug,
  image,
  city,
  neighborhood,
  priceSource = 'base',
}: ApartmentCardProps) {
  const locale = useLocale()
  const copy = CARD_COPY[locale]
  const specs = [
    { icon: 'guests' as const, value: `${guests} p.` },
    ...(surface > 0 ? [{ icon: 'surface' as const, value: `${surface} m`, sup: '2' }] : []),
    ...(bedrooms > 0 ? [{ icon: 'bedrooms' as const, value: String(bedrooms) }] : []),
  ]

  return (
    <Link href={`/appartements/${slug}`} className="group block">
      <article className="flex flex-col gap-[9px]">
        <div className="relative h-60 w-full overflow-hidden rounded-lg md:h-[278px]">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="bg-taupe size-full" />
          )}

          {(city || neighborhood) && (
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 md:top-5 md:left-5 md:gap-[10px]">
              {city && (
                <LocationBadge>{city}</LocationBadge>
              )}
              {neighborhood && (
                <LocationBadge>{neighborhood}</LocationBadge>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-[9px] pt-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-coffee text-body-xl min-w-0 flex-1 leading-[1.55] font-semibold md:w-[170px] md:truncate">
              {name}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              <StarIcon />
              <span className="text-coffee text-body-sm leading-[1.5]">4,9 (113)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {specs.map((spec) => (
              <SpecBadge
                key={`${spec.icon}-${spec.value}`}
                icon={spec.icon}
                value={spec.value}
                sup={spec.sup}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-[10px] gap-y-1">
            <span className="text-silver text-body leading-[1.5]">
              {priceSource === 'quote' ? '' : `${copy.from} `}
              {formatCurrency(price, locale)}{copy.perNight}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

const CARD_COPY = {
  fr: {
    from: 'Dès',
    perNight: '/nuit',
  },
  en: {
    from: 'From',
    perNight: '/night',
  },
} as const

function formatCurrency(value: number, locale: InquiryLocale) {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function LocationBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-cream text-ash rounded-xl px-3 py-1 font-sans text-xs leading-[155%] font-light tracking-[0.24px] md:px-4 md:py-[2px]">
      {children}
    </span>
  )
}

function SpecBadge({
  value,
  sup,
  icon,
}: {
  value: string
  sup?: string
  icon: 'guests' | 'surface' | 'bedrooms'
}) {
  return (
    <div className="flex items-center gap-[10px]">
      <SpecIcon kind={icon} />
      <span className="text-taupe text-overline font-bold">
        {sup ? (
          <>
            {value}
            <sup className="text-[7.74px] tracking-[0.24px]">{sup}</sup>
          </>
        ) : (
          value
        )}
      </span>
    </div>
  )
}

function SpecIcon({ kind }: { kind: 'guests' | 'surface' | 'bedrooms' }) {
  const common = 'shrink-0 text-silver'
  if (kind === 'guests') {
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
        className={common}
      >
        <circle cx="9.5" cy="6.5" r="3" />
        <path d="M3.5 16c0-3 2.7-5 6-5s6 2 6 5" />
      </svg>
    )
  }
  if (kind === 'surface') {
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
        className={common}
      >
        <rect x="3" y="3" width="13" height="13" rx="0.5" />
        <path d="M5.5 5.5v2M5.5 5.5h2M13.5 13.5v-2M13.5 13.5h-2" />
      </svg>
    )
  }
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
      className={common}
    >
      <path d="M2.5 13V6.5M16.5 13V9.5a2 2 0 0 0-2-2H7" />
      <path d="M2.5 11h14" />
      <circle cx="5.5" cy="9" r="1.2" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="#301A0A">
      <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z" />
    </svg>
  )
}
