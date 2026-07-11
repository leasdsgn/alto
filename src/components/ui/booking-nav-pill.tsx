'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/components/providers/locale-provider'
import { buildApartmentSearchParams } from '@/lib/apartment-search'
import { useSearchStore } from '@/lib/stores/search'

const CITIES = ['Paris', 'Lyon']

function formatShort(d: { day: number; month: number }): string {
  return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}`
}

export function BookingNavPill() {
  const router = useRouter()
  const locale = useLocale()
  const copy = BOOKING_NAV_COPY[locale]
  const { city, dates, hasSelectedDates, guests, setCity, setGuests } = useSearchStore()

  function handleSubmit() {
    const params = buildApartmentSearchParams({
      city,
      guests,
      dates: hasSelectedDates
        ? { checkIn: dates.start.toString(), checkOut: dates.end.toString() }
        : null,
    })
    router.push(`/appartements?${params}`)
  }

  return (
    <div
      className="bg-cream border-divider flex h-[35px] cursor-pointer items-center rounded-full border px-1"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('button')) return
        handleSubmit()
      }}
    >
      <CityPill value={city} onChange={setCity} />

      <FieldDivider />
      <FieldButton
        icon={<CalendarIcon />}
        label={copy.checkIn}
        value={hasSelectedDates ? formatShort(dates.start) : ''}
        onClick={handleSubmit}
      />

      <FieldDivider />
      <FieldButton
        icon={<CalendarIcon />}
        label={copy.checkOut}
        value={hasSelectedDates ? formatShort(dates.end) : ''}
        onClick={handleSubmit}
      />

      <FieldDivider />
      <GuestsField
        value={guests}
        onChange={setGuests}
        label={copy.guests}
        removeLabel={copy.removeGuest}
        addLabel={copy.addGuest}
      />

      <button
        type="button"
        onClick={handleSubmit}
        aria-label={copy.search}
        className="bg-coffee text-cream ml-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
      >
        <SearchIcon />
      </button>
    </div>
  )
}

const BOOKING_NAV_COPY = {
  fr: {
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    guests: 'Voyageurs',
    search: 'Rechercher',
    removeGuest: 'Retirer un voyageur',
    addGuest: 'Ajouter un voyageur',
  },
  en: {
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guests: 'Guests',
    search: 'Search',
    removeGuest: 'Remove one guest',
    addGuest: 'Add one guest',
  },
} as const

function CityPill({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const next = () => {
    const idx = CITIES.indexOf(value)
    onChange(CITIES[(idx + 1) % CITIES.length])
  }
  return (
    <button
      type="button"
      onClick={next}
      className="bg-coffee text-cream text-overline flex h-[27px] items-center rounded-full px-4 font-bold tracking-[0.02em]"
    >
      {value}
    </button>
  )
}

function FieldButton({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-taupe hover:bg-sand flex h-full items-center gap-1.5 rounded-full px-3 transition-colors"
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-overline font-bold tracking-[0.02em]">{label}</span>
      <span className="text-overline ml-1 font-bold">{value}</span>
    </button>
  )
}

function GuestsField({
  value,
  onChange,
  label,
  removeLabel,
  addLabel,
}: {
  value: number
  onChange: (v: number) => void
  label: string
  removeLabel: string
  addLabel: string
}) {
  return (
    <div className="text-taupe flex h-full items-center gap-1.5 px-3">
      <span className="text-overline font-bold tracking-[0.02em]">{label}</span>
      <button
        type="button"
        aria-label={removeLabel}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-3 items-center justify-center"
      >
        <CircleIcon kind="minus" />
      </button>
      <span className="text-overline w-3 text-center font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={addLabel}
        onClick={() => onChange(Math.min(10, value + 1))}
        className="flex size-3 items-center justify-center"
      >
        <CircleIcon kind="plus" />
      </button>
    </div>
  )
}

function FieldDivider() {
  return <div className="bg-silver/40 h-5 w-px shrink-0" />
}

function CalendarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <rect x="1" y="2" width="10" height="9" rx="1.5" />
      <path d="M4 1v2M8 1v2M1 5h10" />
    </svg>
  )
}

function CircleIcon({ kind }: { kind: 'plus' | 'minus' }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
    >
      <circle cx="5" cy="5" r="4.5" />
      <path d="M3 5h4" />
      {kind === 'plus' && <path d="M5 3v4" />}
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      stroke="#fffff8"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="6" cy="6" r="4" />
      <path d="M10 10l2.5 2.5" />
    </svg>
  )
}
