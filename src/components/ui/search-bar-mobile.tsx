'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DateRangePicker,
  DateField,
  RangeCalendar,
  Label,
  Select as HeroUISelect,
} from '@heroui/react'
import { ListBox, ListBoxItem } from 'react-aria-components'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { RangeValue } from 'react-aria-components'
import { useLocale } from '@/components/providers/locale-provider'
import { useSearchStore } from '@/lib/stores/search'
import { useSearchDateAvailability } from '@/lib/use-search-date-availability'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const CITIES = ['Paris', 'Lyon']
const MOBILE_SEARCH_COPY = {
  fr: {
    city: 'Ville',
    stayDates: 'Dates du séjour',
    search: 'Rechercher',
    availabilityLoading: 'Vérification des dates',
    guest: 'voyageur',
    guests: 'voyageurs',
    removeGuest: 'Retirer un voyageur',
    addGuest: 'Ajouter un voyageur',
  },
  en: {
    city: 'City',
    stayDates: 'Stay dates',
    search: 'Search',
    availabilityLoading: 'Checking dates',
    guest: 'guest',
    guests: 'guests',
    removeGuest: 'Remove one guest',
    addGuest: 'Add one guest',
  },
} as const

export function SearchBarMobile() {
  const router = useRouter()
  const locale = useLocale()
  const copy = MOBILE_SEARCH_COPY[locale]
  const { city, dates, guests, setCity, setDates, setGuests } = useSearchStore()
  const [dateOpen, setDateOpen] = useState(false)
  const searchAvailability = useSearchDateAvailability({
    city,
    guests,
    dates,
    viewYear: dates.start.year,
    viewMonth: dates.start.month,
    enabled: dateOpen,
  })

  const minDate = today(getLocalTimeZone())

  function handleDateChange(value: RangeValue<DateValue> | null) {
    if (value) setDates({ start: value.start, end: value.end })
  }

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
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="bg-cream flex flex-col rounded-xl">
        <div className="border-divider flex items-center justify-between border-b px-4 py-3">
          <HeroUISelect
            aria-label={copy.city}
            selectedKey={city}
            onSelectionChange={(key) => setCity(key as string)}
            className="w-auto"
          >
            <Label className="sr-only">{copy.city}</Label>
            <HeroUISelect.Trigger className="bg-ash text-cream flex h-[44px] items-center gap-1.5 rounded-md px-5 text-xs font-bold tracking-[0.24px]">
              <HeroUISelect.Value>{({ selectedText }) => selectedText}</HeroUISelect.Value>
              <HeroUISelect.Indicator>
                <ChevronIcon />
              </HeroUISelect.Indicator>
            </HeroUISelect.Trigger>
            <HeroUISelect.Popover className="bg-cream border-divider overflow-hidden rounded-sm border shadow-none">
              <ListBox>
                {CITIES.map((c) => (
                  <ListBoxItem
                    key={c}
                    id={c}
                    className="text-coffee hover:bg-sand data-[selected]:bg-sand cursor-pointer px-5 py-2 text-xs font-bold tracking-[0.24px] outline-none"
                  >
                    {c}
                  </ListBoxItem>
                ))}
              </ListBox>
            </HeroUISelect.Popover>
          </HeroUISelect>

          <div className="flex items-center gap-2">
            <span className="text-taupe text-xs font-bold">
              {guests} {guests > 1 ? copy.guests : copy.guest}
            </span>
            <button
              type="button"
              className="text-taupe flex size-10 items-center justify-center disabled:opacity-30"
              disabled={guests <= 1}
              onClick={() => setGuests(Math.max(1, guests - 1))}
              aria-label={copy.removeGuest}
            >
              <MinusIcon />
            </button>
            <button
              type="button"
              className="text-taupe flex size-10 items-center justify-center disabled:opacity-30"
              disabled={guests >= 10}
              onClick={() => setGuests(Math.min(10, guests + 1))}
              aria-label={copy.addGuest}
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        <DateRangePicker
          value={dates}
          onChange={handleDateChange}
          minValue={minDate}
          startName="checkIn"
          endName="checkOut"
          isOpen={dateOpen}
          onOpenChange={setDateOpen}
          className="date-picker"
          isDateUnavailable={searchAvailability.isDateUnavailable}
        >
          <Label className="sr-only">{copy.stayDates}</Label>
          <div className="cursor-pointer px-4 py-4" onClick={() => setDateOpen(true)}>
            <DateField.Group
              className="pointer-events-none flex items-center justify-between"
              fullWidth
            >
              <div className="flex items-center gap-0.5">
                <DateField.Input slot="start" className="flex items-center gap-0.5">
                  {(segment) => (
                    <DateField.Segment
                      segment={segment}
                      className="text-taupe text-xs font-bold tracking-[0.24px] outline-none"
                    />
                  )}
                </DateField.Input>
                <span className="text-silver text-xs">—</span>
                <DateField.Input slot="end" className="flex items-center gap-0.5">
                  {(segment) => (
                    <DateField.Segment
                      segment={segment}
                      className="text-taupe text-xs font-bold tracking-[0.24px] outline-none"
                    />
                  )}
                </DateField.Input>
              </div>
              <span className="text-coffee">
                <CalendarIcon />
              </span>
            </DateField.Group>
          </div>
          <DateRangePicker.Popover
            className="bg-cream border-divider rounded-lg border p-5 shadow-none"
            placement="bottom start"
          >
            <div className="relative" aria-busy={searchAvailability.isLoading}>
              <RangeCalendar
                aria-label={copy.stayDates}
                minValue={minDate}
                isDateUnavailable={searchAvailability.isDateUnavailable}
              >
                <RangeCalendar.Header>
                  <RangeCalendar.Heading className="text-coffee text-sm font-bold" />
                  <RangeCalendar.NavButton slot="previous" />
                  <RangeCalendar.NavButton slot="next" />
                </RangeCalendar.Header>
                <RangeCalendar.Grid className="w-full">
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell className="text-taupe text-xs font-bold">
                        {day}
                      </RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => (
                      <RangeCalendar.Cell
                        date={date}
                        className="text-coffee hover:bg-sand data-[selected]:bg-coffee/10 data-[selection-start]:bg-coffee data-[selection-start]:text-cream data-[selection-end]:bg-coffee data-[selection-end]:text-cream data-[unavailable]:text-silver flex size-9 items-center justify-center rounded-sm text-xs outline-none data-[unavailable]:line-through"
                      />
                    )}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </div>
            {searchAvailability.isLoading && (
              <div className="mt-3">
                <LoadingSpinner label={copy.availabilityLoading} />
              </div>
            )}
          </DateRangePicker.Popover>
        </DateRangePicker>
      </div>

      <Button type="submit" className="h-[50px] w-full rounded-xl">
        {copy.search}
      </Button>
    </form>
  )
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-coffee">
      <g clipPath="url(#cal-clip-m)">
        <path d="M3.6 3V0.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.4 3V0.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M10.2 1.8H1.8C1.482 1.8 1.176 1.926 0.951 2.151C0.726 2.377 0.6 2.682 0.6 3V10.2C0.6 10.518 0.726 10.824 0.951 11.049C1.176 11.274 1.482 11.4 1.8 11.4H10.2C10.518 11.4 10.824 11.274 11.049 11.049C11.274 10.824 11.4 10.518 11.4 10.2V3C11.4 2.682 11.274 2.377 11.049 2.151C10.824 1.926 10.518 1.8 10.2 1.8Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="cal-clip-m">
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M2.5 3.5L5 6.5L7.5 3.5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8h6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
