'use client'

import { useRouter } from 'next/navigation'
import { useSearchStore } from '@/lib/stores/search'

const CITIES = ['Paris', 'Lyon']

function formatShort(d: { day: number; month: number }): string {
  return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}`
}

export function BookingNavPill() {
  const router = useRouter()
  const { city, dates, guests, setCity, setGuests } = useSearchStore()

  function handleSubmit() {
    const params = new URLSearchParams()
    params.set('city', city.toLowerCase())
    params.set('checkIn', dates.start.toString())
    params.set('checkOut', dates.end.toString())
    params.set('guests', String(guests))
    router.push(`/appartements?${params}`)
  }

  return (
    <div className="bg-cream flex h-[35px] items-center rounded-full border border-divider px-1">
      <CityPill value={city} onChange={setCity} />

      <FieldDivider />
      <FieldButton icon={<CalendarIcon />} label="Check-in" value={formatShort(dates.start)} />

      <FieldDivider />
      <FieldButton icon={<CalendarIcon />} label="Check-out" value={formatShort(dates.end)} />

      <FieldDivider />
      <GuestsField value={guests} onChange={setGuests} />

      <button
        type="button"
        onClick={handleSubmit}
        aria-label="Rechercher"
        className="bg-coffee text-cream ml-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
      >
        <SearchIcon />
      </button>
    </div>
  )
}

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

function FieldButton({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-taupe flex h-full items-center gap-1.5 px-3">
      <span className="shrink-0">{icon}</span>
      <span className="text-overline font-bold tracking-[0.02em]">{label}</span>
      <span className="text-overline ml-1 font-bold">{value}</span>
    </div>
  )
}

function GuestsField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="text-taupe flex h-full items-center gap-1.5 px-3">
      <span className="text-overline font-bold tracking-[0.02em]">Voyageurs</span>
      <button
        type="button"
        aria-label="Retirer un voyageur"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex size-3 items-center justify-center"
      >
        <CircleIcon kind="minus" />
      </button>
      <span className="text-overline w-3 text-center font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Ajouter un voyageur"
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
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <rect x="1" y="2" width="10" height="9" rx="1.5" />
      <path d="M4 1v2M8 1v2M1 5h10" />
    </svg>
  )
}

function CircleIcon({ kind }: { kind: 'plus' | 'minus' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="0.8">
      <circle cx="5" cy="5" r="4.5" />
      <path d="M3 5h4" />
      {kind === 'plus' && <path d="M5 3v4" />}
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#fffff8" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="4" />
      <path d="M10 10l2.5 2.5" />
    </svg>
  )
}
