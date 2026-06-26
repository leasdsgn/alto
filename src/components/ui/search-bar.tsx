'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Label, Select as HeroUISelect } from '@heroui/react'
import { ListBox, ListBoxItem } from 'react-aria-components'
import { today, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { useLocale } from '@/components/providers/locale-provider'
import { useSearchStore } from '@/lib/stores/search'

const CITIES = ['Paris', 'Lyon']
const DATE_COPY = {
  fr: {
    city: 'Ville',
    guests: 'Voyageurs',
    search: 'Rechercher',
    removeGuest: 'Retirer un voyageur',
    addGuest: 'Ajouter un voyageur',
    months: [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ],
    days: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
  },
  en: {
    city: 'City',
    guests: 'Guests',
    search: 'Search',
    removeGuest: 'Remove one guest',
    addGuest: 'Add one guest',
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  },
} as const

function formatDate(date: DateValue): string {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function firstDayOfWeek(year: number, month: number): number {
  return (new Date(year, month - 1, 1).getDay() + 6) % 7
}

export function SearchBar({
  calendarPlacement = 'bottom start',
  align = 'center',
}: {
  calendarPlacement?: 'bottom start' | 'top start'
  align?: 'center' | 'start'
} = {}) {
  const router = useRouter()
  const locale = useLocale()
  const copy = DATE_COPY[locale]
  const { city, dates, guests, setCity, setDates, setGuests } = useSearchStore()
  const minDate = today(getLocalTimeZone())
  const [dateOpen, setDateOpen] = useState(false)
  const [cityOpen, setCityOpen] = useState(false)
  const [selectingEnd, setSelectingEnd] = useState(false)
  const [hoverDate, setHoverDate] = useState<CalendarDate | null>(null)
  const [viewYear, setViewYear] = useState(dates.start.year)
  const [viewMonth, setViewMonth] = useState(dates.start.month)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dateOpen) return
    function handleOutside(e: MouseEvent) {
      if (!calendarRef.current?.contains(e.target as Node)) {
        setDateOpen(false)
        setSelectingEnd(false)
        setHoverDate(null)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [dateOpen])

  function handleDayClick(date: CalendarDate) {
    if (date.compare(minDate) < 0) return
    if (!selectingEnd) {
      setDates({ start: date, end: date })
      setSelectingEnd(true)
    } else {
      if (date.compare(dates.start) < 0) {
        setDates({ start: date, end: date })
      } else {
        setDates({ start: dates.start, end: date })
        setSelectingEnd(false)
        setDateOpen(false)
        setHoverDate(null)
      }
    }
  }

  function prevMonth() {
    if (viewMonth === 1) {
      setViewMonth(12)
      setViewYear((y) => y - 1)
    } else setViewMonth((m) => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 12) {
      setViewMonth(1)
      setViewYear((y) => y + 1)
    } else setViewMonth((m) => m + 1)
  }

  const numDays = daysInMonth(viewYear, viewMonth)
  const firstDay = firstDayOfWeek(viewYear, viewMonth)
  const days = Array.from(
    { length: numDays },
    (_, i) => new CalendarDate(viewYear, viewMonth, i + 1),
  )
  const effectiveEnd = selectingEnd && hoverDate ? hoverDate : dates.end

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('city', city.toLowerCase())
    params.set('checkIn', dates.start.toString())
    params.set('checkOut', dates.end.toString())
    params.set('guests', String(guests))
    router.push(`/appartements?${params}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`bg-cream flex h-[50px] w-fit items-center rounded-full px-[7px] ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      >
        {/* City pill */}
        <HeroUISelect
          aria-label={copy.city}
          selectedKey={city}
          onSelectionChange={(key) => setCity(key as string)}
          isOpen={cityOpen}
          onOpenChange={setCityOpen}
          className="shrink-0"
        >
          <Label className="sr-only">{copy.city}</Label>
          <HeroUISelect.Trigger className="bg-coffee text-cream text-overline flex h-[35px] items-center gap-1.5 rounded-full px-5 font-bold tracking-[0.24px]">
            <HeroUISelect.Value>{({ selectedText }) => selectedText}</HeroUISelect.Value>
            <ChevronDownIcon open={cityOpen} />
          </HeroUISelect.Trigger>
          <HeroUISelect.Popover className="bg-cream border-divider overflow-hidden rounded-xl border shadow-none">
            <ListBox>
              {CITIES.map((c) => (
                <ListBoxItem
                  key={c}
                  id={c}
                  className="text-coffee hover:bg-sand data-[selected]:bg-sand cursor-pointer px-5 py-2.5 text-xs font-bold tracking-[0.24px] outline-none"
                >
                  {c}
                </ListBoxItem>
              ))}
            </ListBox>
          </HeroUISelect.Popover>
        </HeroUISelect>

        {/* Custom date range */}
        <div className="relative shrink-0" ref={calendarRef}>
          <div
            className="flex w-fit cursor-pointer items-center"
            onClick={() => setDateOpen((o) => !o)}
          >
            <div className="flex items-center gap-1.5 px-[15px]">
              <CalendarIcon />
              <span className="text-taupe text-[12px] leading-[1.55] font-bold tracking-[0.24px]">
                {formatDate(dates.start)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center gap-1.5 px-[15px]">
              <CalendarIcon />
              <span className="text-taupe text-[12px] leading-[1.55] font-bold tracking-[0.24px]">
                {formatDate(dates.end)}
              </span>
            </div>
          </div>

          {dateOpen && (
            <div
              className={`bg-cream border-divider absolute z-50 min-w-[280px] rounded-xl border p-5 ${calendarPlacement === 'top start' ? 'bottom-[calc(100%+8px)] left-0' : 'top-[calc(100%+8px)] left-0'}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="text-taupe hover:text-coffee p-1"
                >
                  <ChevronLeftIcon />
                </button>
                <span className="text-coffee text-sm font-bold">
                  {copy.months[viewMonth - 1]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="text-taupe hover:text-coffee p-1"
                >
                  <ChevronRightIcon />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7">
                {copy.days.map((d, i) => (
                  <div
                    key={i}
                    className="text-taupe flex size-8 items-center justify-center text-[10px] font-bold"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="relative grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e${i}`} className="size-8" />
                ))}
                {days.map((date) => {
                  const isStart = date.compare(dates.start) === 0
                  const isEnd = date.compare(effectiveEnd) === 0
                  const inRange = date.compare(dates.start) > 0 && date.compare(effectiveEnd) < 0
                  const disabled = date.compare(minDate) < 0
                  return (
                    <button
                      key={date.day}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDayClick(date)}
                      onMouseEnter={() => selectingEnd && setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                      className={[
                        'flex size-8 items-center justify-center rounded-sm text-xs outline-none',
                        disabled ? 'text-silver cursor-not-allowed' : 'cursor-pointer',
                        isStart || isEnd ? 'bg-coffee text-cream' : '',
                        inRange ? 'bg-coffee/10 text-coffee' : '',
                        !isStart && !isEnd && !inRange && !disabled
                          ? 'text-coffee hover:bg-sand'
                          : '',
                      ].join(' ')}
                    >
                      {date.day}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Voyageurs */}
        <Stepper
          value={guests}
          onChange={setGuests}
          min={1}
          max={10}
          label={copy.guests}
          removeLabel={copy.removeGuest}
          addLabel={copy.addGuest}
        />

        {/* Search button */}
        <button
          type="submit"
          aria-label={copy.search}
          className="bg-coffee ml-[7px] flex size-[35px] shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        >
          <SearchIcon />
        </button>
      </div>
    </form>
  )
}

function Stepper({
  value,
  onChange,
  min,
  max,
  label,
  removeLabel,
  addLabel,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  label: string
  removeLabel: string
  addLabel: string
}) {
  return (
    <div className="flex items-center gap-2 px-[15px]">
      <span className="text-taupe text-overline font-bold tracking-[0.24px]">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="text-taupe flex size-7 items-center justify-center transition-opacity outline-none hover:opacity-70 disabled:opacity-30"
          aria-label={removeLabel}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <MinusCircleIcon />
        </button>
        <span className="text-taupe text-overline w-4 text-center font-bold tracking-[0.24px] tabular-nums">
          {value}
        </span>
        <button
          type="button"
          className="text-taupe flex size-7 items-center justify-center transition-opacity outline-none hover:opacity-70 disabled:opacity-30"
          aria-label={addLabel}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <PlusCircleIcon />
        </button>
      </div>
    </div>
  )
}

function Separator() {
  return <div className="bg-silver/40 h-[30px] w-px shrink-0" />
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-taupe shrink-0">
      <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1" />
      <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function PlusCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8.4" stroke="currentColor" strokeWidth="1" />
      <path d="M9 5.5v7M5.5 9h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function MinusCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8.4" stroke="currentColor" strokeWidth="1" />
      <path d="M5.5 9h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
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

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="M2 3.5l3 3 3-3" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}
