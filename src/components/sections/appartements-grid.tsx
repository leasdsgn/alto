'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AppartementsMap } from '@/components/sections/appartements-map'
import { ApartmentCard } from '@/components/ui/apartment-card'
import { Chip } from '@/components/ui/chip'
import { FilterToolbarButton } from '@/components/ui/filter-toolbar-button'
import { SearchBar } from '@/components/ui/search-bar'
import { SearchBarMobile } from '@/components/ui/search-bar-mobile'
import { useLocale } from '@/components/providers/locale-provider'
import { getApartmentCityKey, isApartmentInCity, normalizeCity } from '@/lib/apartment-city'
import { type InquiryLocale } from '@/types/inquiry'
import { type ApartmentPriceSource } from '@/types/apartment'

interface Apartment {
  id: string
  name: string
  price: number | null
  guests: number
  surface: number
  bedrooms: number
  slug: string
  images: string[]
  city?: string
  lat?: number
  lng?: number
  address?: string
  neighborhoodLabel?: string
  priceSource?: ApartmentPriceSource
}

export function AppartementsGrid({
  apartments,
  initialCity,
  searchStatus = 'ready',
}: {
  apartments: Apartment[]
  initialCity?: string
  searchStatus?: 'ready' | 'fallback' | 'availability_error'
}) {
  const locale = useLocale()
  const copy = APARTMENTS_GRID_COPY[locale]
  const normalizedInitialCity = normalizeFilterValue(initialCity)
  const defaultCity = normalizedInitialCity || 'all'

  const activeCity = defaultCity
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(defaultCity !== 'all')
  const [view, setView] = useState<'list' | 'map'>('list')

  const neighborhoodFilters = useMemo(() => {
    const source =
      activeCity === 'all'
        ? apartments
        : apartments.filter((apartment) => getApartmentCityKey(apartment) === activeCity)

    const options = Array.from(
      new Set(source.map((apartment) => getNeighborhoodLabel(apartment)).filter(Boolean)),
    ) as string[]

    return [
      { id: 'all', label: copy.all },
      ...options.map((label) => ({
        id: normalizeFilterValue(label),
        label,
      })),
    ]
  }, [activeCity, apartments, copy.all])

  const filtered = useMemo(
    () =>
      apartments.filter((apartment) => {
        if (activeCity !== 'all' && !isApartmentInCity(apartment, activeCity)) return false
        if (
          activeNeighborhood &&
          normalizeFilterValue(getNeighborhoodLabel(apartment)) !== activeNeighborhood
        ) {
          return false
        }
        return true
      }),
    [activeCity, activeNeighborhood, apartments],
  )

  const hasActiveFilters = activeNeighborhood !== null

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <div className="bg-cream min-h-search-frame relative hidden w-full items-center gap-3 lg:flex">
          <span
            aria-hidden="true"
            className="bg-divider absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2"
          />
          <div className="min-w-0 flex-1">
            <SearchBar align="start" searchOnCityChange searchOnGuestsChange />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <FilterToolbarButton
              active={showFilters || hasActiveFilters}
              icon={<FilterIcon />}
              label={copy.filters}
              onClick={() => setShowFilters((open) => !open)}
            />
            <FilterToolbarButton
              active={view === 'list'}
              icon={<ListIcon />}
              label={copy.list}
              onClick={() => setView('list')}
            />
            <FilterToolbarButton
              active={view === 'map'}
              icon={<MapIcon />}
              label={copy.map}
              onClick={() => setView('map')}
              variant="map"
            />
          </div>
        </div>

        <div className="lg:hidden">
          <SearchBarMobile searchOnCityChange searchOnGuestsChange />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <FilterToolbarButton
            active={showFilters || hasActiveFilters}
            icon={<FilterIcon />}
            label={copy.filters}
            onClick={() => setShowFilters((open) => !open)}
          />
          <FilterToolbarButton
            active={view === 'list'}
            icon={<ListIcon />}
            label={copy.list}
            onClick={() => setView('list')}
          />
          <FilterToolbarButton
            active={view === 'map'}
            icon={<MapIcon />}
            label={copy.map}
            onClick={() => setView('map')}
            variant="map"
          />
        </div>

        {hasActiveFilters ? (
          <div className="flex justify-end">
            <button
              type="button"
              className="text-taupe text-xs font-bold tracking-[0.24px] uppercase transition-opacity hover:opacity-70"
              onClick={() => {
                setActiveNeighborhood(null)
              }}
            >
              {copy.reset}
            </button>
          </div>
        ) : null}

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-divider bg-sand/40 rounded-xl border p-4">
              <div className="flex flex-wrap gap-2">
                {neighborhoodFilters.map((filter) => (
                  <Chip
                    key={filter.id}
                    variant={
                      (filter.id === 'all' && activeNeighborhood === null) ||
                      activeNeighborhood === filter.id
                        ? 'active'
                        : 'default'
                    }
                    onPress={() => {
                      setActiveNeighborhood(filter.id === 'all' ? null : filter.id)
                    }}
                  >
                    {filter.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {searchStatus === 'availability_error' ? (
        <div className="border-divider/60 bg-cream/60 mt-12 rounded-xl border p-10 text-center">
          <p className="text-coffee text-sm font-semibold">{copy.availabilityErrorTitle}</p>
          <p className="text-taupe mt-2 text-xs">{copy.availabilityErrorBody}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border-divider/60 bg-cream/60 mt-12 rounded-xl border p-10 text-center">
          <p className="text-coffee text-sm font-semibold">{copy.emptyTitle}</p>
          <p className="text-taupe mt-2 text-xs">{copy.emptyBody}</p>
        </div>
      ) : view === 'map' ? (
        <div className="min-h-results-panel mt-8 flex flex-col gap-4 lg:flex-row">
          <div className="min-w-0 flex-1">
            <AppartementsMap apartments={filtered} />
          </div>
          <aside className="alto-results-list lg:h-results-panel flex flex-col gap-4 overscroll-contain lg:w-[390px] lg:overflow-y-auto lg:pr-2">
            {filtered.map((apt) => {
              const image = apt.images[0]

              return (
                <MapApartmentResult key={apt.id} apartment={apt} image={image} locale={locale} />
              )
            })}
          </aside>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((apt) => (
            <ApartmentCard
              key={apt.id}
              name={apt.name}
              price={apt.price}
              guests={apt.guests}
              surface={apt.surface}
              bedrooms={apt.bedrooms}
              slug={apt.slug}
              image={apt.images[0]}
              priceSource={apt.priceSource}
            />
          ))}
        </div>
      )}
    </>
  )
}

function normalizeFilterValue(value: string | null | undefined) {
  return normalizeCity(value)
}

function getNeighborhoodLabel(apartment: Apartment) {
  const mapped = apartment.neighborhoodLabel?.trim()
  if (mapped) return mapped

  const addressStart = apartment.address?.split(',')[0]?.trim()
  if (!addressStart || /^\d/.test(addressStart)) return ''
  return addressStart
}

function MapApartmentResult({
  apartment,
  image,
  locale,
}: {
  apartment: Apartment
  image?: string
  locale: InquiryLocale
}) {
  const copy = APARTMENTS_GRID_COPY[locale]
  const specs = [
    { icon: 'guests' as const, value: `${apartment.guests} p.` },
    ...(apartment.surface > 0
      ? [{ icon: 'surface' as const, value: `${apartment.surface} m`, sup: '2' }]
      : []),
    ...(apartment.bedrooms > 0
      ? [{ icon: 'bedrooms' as const, value: String(apartment.bedrooms) }]
      : []),
  ]

  return (
    <Link href={`/appartements/${apartment.slug}`} prefetch={false} className="group block">
      <article className="bg-taupe/10 rounded-result-card hover:bg-taupe/15 grid min-h-[154px] grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-3 overflow-hidden p-3 transition-colors">
        <div className="bg-sand rounded-result-card relative size-[90px] overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={apartment.name}
              fill
              sizes="90px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="text-coffee text-body-sm line-clamp-2 leading-[1.45] font-bold">
            {apartment.name}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            {specs.map((spec) => (
              <span
                key={`${spec.icon}-${spec.value}`}
                className="text-taupe text-overline flex items-center gap-2 font-bold"
              >
                <SpecIcon kind={spec.icon} />
                <span>
                  {spec.value}
                  {spec.sup ? (
                    <sup className="text-[7px] leading-none tracking-[0.24px]">{spec.sup}</sup>
                  ) : null}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="col-start-2 flex min-w-0 items-center justify-end gap-3">
          <span className="text-silver text-body whitespace-nowrap">
            {getPriceLabel(apartment, copy, locale)}
          </span>
        </div>
      </article>
    </Link>
  )
}

const APARTMENTS_GRID_COPY = {
  fr: {
    all: 'Tous',
    filters: 'Filtres',
    list: 'Liste',
    map: 'Carte',
    reset: 'Réinitialiser',
    emptyTitle: 'Aucun appartement disponible',
    emptyBody: 'Essayez d’élargir vos dates ou de changer de ville.',
    availabilityErrorTitle: 'Disponibilités temporairement indisponibles',
    availabilityErrorBody:
      'La recherche datée n’a pas pu être vérifiée. Merci de réessayer dans un instant.',
    from: 'Dès',
    perNight: '/nuit',
    total: 'au total',
    checkAvailability: 'Voir disponibilités',
  },
  en: {
    all: 'All',
    filters: 'Filters',
    list: 'List',
    map: 'Map',
    reset: 'Reset',
    emptyTitle: 'No apartments available',
    emptyBody: 'Try widening your dates or changing city.',
    availabilityErrorTitle: 'Availability temporarily unavailable',
    availabilityErrorBody: 'The dated search could not be verified. Please try again in a moment.',
    from: 'From',
    perNight: '/night',
    total: 'total',
    checkAvailability: 'Check availability',
  },
} as const

function getPriceLabel(
  apartment: Apartment,
  copy: (typeof APARTMENTS_GRID_COPY)[InquiryLocale],
  locale: InquiryLocale,
) {
  if (!isDisplayablePrice(apartment.price)) return copy.checkAvailability
  const price = formatCurrency(Math.round(apartment.price), locale)

  if (apartment.priceSource === 'total') return `${price} ${copy.total}`

  return `${copy.from} ${price}${copy.perNight}`
}

function formatCurrency(value: number, locale: InquiryLocale) {
  return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function isDisplayablePrice(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function SpecIcon({ kind }: { kind: 'guests' | 'surface' | 'bedrooms' }) {
  const common = 'text-silver size-5 shrink-0'

  if (kind === 'guests') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3.15 2.7-5.25 6-5.25S16 13.85 16 17" />
      </svg>
    )
  }

  if (kind === 'surface') {
    return (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={common}
        aria-hidden="true"
      >
        <rect x="3.5" y="3.5" width="13" height="13" rx="0.8" />
        <path d="M6 6v2.2M6 6h2.2M14 14v-2.2M14 14h-2.2" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={common}
      aria-hidden="true"
    >
      <path d="M3 13.5V7M17 13.5V10a2 2 0 0 0-2-2H7" />
      <path d="M3 11.5h14" />
      <circle cx="6" cy="9.2" r="1.2" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h10l-4 4.6V12l-2 1V8.6L3 4Z" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="18" height="15" viewBox="0 0 18 15" fill="currentColor" aria-hidden="true">
      <path d="M1.5 3A1.5 1.5 0 1 0 1.5 0a1.5 1.5 0 0 0 0 3ZM1.5 9A1.5 1.5 0 1 0 1.5 6a1.5 1.5 0 0 0 0 3ZM1.5 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM6 1h12v2H6V1ZM6 7h12v2H6V7ZM6 13h12v2H6v-2Z" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3.75 3 5.15v11l4-1.4 5 1.5 5-1.5v-11l-5 1.5-5-1.5Z" />
      <path d="M7 3.75v11M12 5.25v11" />
    </svg>
  )
}
