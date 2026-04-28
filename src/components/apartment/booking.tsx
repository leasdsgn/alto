'use client'

import { useState } from 'react'
import { DateRangePicker, DateField, RangeCalendar, Label } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { RangeValue } from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search'
import { formatDateShort } from '@/lib/format-date'

interface BookingProps {
  price: number
  slug: string
  listingId?: string
}

export function ApartmentBooking({ price, slug }: BookingProps) {
  const { dates, guests, setDates, setGuests } = useSearchStore()
  const checkIn = dates.start.toString()
  const checkOut = dates.end.toString()
  const reserveHref = `/book/${slug}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`
  const [dateOpen, setDateOpen] = useState(false)
  const nights = dates.end.compare(dates.start)
  const total = price * nights
  const minDate = today(getLocalTimeZone())

  function handleDateChange(value: RangeValue<DateValue> | null) {
    if (value) setDates({ start: value.start, end: value.end })
  }

  return (
    <div className="w-full max-w-[498px] space-y-[33px]">
      <div className="rounded-[8px] bg-[#f9f9f2] px-6 pt-8 pb-[31px] shadow-[0_2px_2px_rgba(0,0,0,0.15)]">
        <div className="px-4">
          <h2 className="text-coffee text-h5 font-bold tracking-[-0.02em]">Votre réservation</h2>

          <div className="from-silver to-taupe mt-[13px] max-w-[378px] rounded-[8px] bg-gradient-to-r px-3 py-1.5 shadow-[0_2px_2px_rgba(0,0,0,0.15)]">
            <p className="text-cream text-body-sm whitespace-nowrap">
              Annulation gratuite 14 jours avant la réservation
            </p>
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
          className="date-picker w-full"
          style={{ width: '100%' }}
        >
          <Label className="sr-only">Dates du séjour</Label>

          <div className="border-silver mx-[17px] mt-8 border-t">
            <button
              type="button"
              className="grid w-full grid-cols-[1fr_1px_1fr] text-left"
              onClick={() => setDateOpen(true)}
            >
              <div className="px-4 py-[15px] pr-5">
                <div className="text-taupe flex items-center gap-2">
                  <CalendarIcon />
                  <p className="text-body">Check-in</p>
                </div>
                <p className="text-coffee text-body-xl mt-[13px] font-semibold">
                  {formatDateShort(dates.start)}
                </p>
              </div>

              <div className="bg-silver h-full w-px" />

              <div className="px-4 py-[15px] pl-5">
                <div className="text-taupe flex items-center gap-2">
                  <CalendarIcon />
                  <p className="text-body">Check-out</p>
                </div>
                <p className="text-coffee text-body-xl mt-[13px] font-semibold">
                  {formatDateShort(dates.end)}
                </p>
              </div>
            </button>
          </div>

          <DateField.Group className="pointer-events-none absolute inset-0 opacity-0" fullWidth>
            <DateField.Input slot="start">
              {(s) => <DateField.Segment segment={s} />}
            </DateField.Input>
            <DateField.Input slot="end">{(s) => <DateField.Segment segment={s} />}</DateField.Input>
          </DateField.Group>

          <DateRangePicker.Popover
            className="bg-cream border-divider rounded-lg border p-5 shadow-[0_8px_24px_rgba(48,26,10,0.1)]"
            placement="bottom start"
          >
            <RangeCalendar aria-label="Dates du séjour" minValue={minDate}>
              <RangeCalendar.Header>
                <RangeCalendar.Heading className="text-coffee text-sm font-bold" />
                <RangeCalendar.NavButton
                  slot="previous"
                  className="text-coffee border-divider flex size-8 items-center justify-center rounded-full border"
                />
                <RangeCalendar.NavButton
                  slot="next"
                  className="text-coffee border-divider flex size-8 items-center justify-center rounded-full border"
                />
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
                      className="text-coffee hover:bg-sand data-[selected]:bg-coffee/10 data-[selection-start]:bg-coffee data-[selection-start]:text-cream data-[selection-end]:bg-coffee data-[selection-end]:text-cream data-[unavailable]:text-silver flex size-8 items-center justify-center rounded-sm text-xs outline-none data-[unavailable]:line-through"
                    />
                  )}
                </RangeCalendar.GridBody>
              </RangeCalendar.Grid>
            </RangeCalendar>
          </DateRangePicker.Popover>
        </DateRangePicker>

        <div className="border-silver mx-[17px] border-t px-4 py-[15px]">
          <div className="text-taupe flex items-center gap-2">
            <GuestsIcon />
            <p className="text-body">Voyageurs</p>
          </div>
          <div className="mt-[13px] flex items-center justify-between gap-4">
            <span className="text-coffee text-body-xl font-semibold">
              {guests} voyageur{guests > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="text-taupe hover:bg-sand flex size-6 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                disabled={guests <= 1}
                onClick={() => setGuests(Math.max(1, guests - 1))}
                aria-label="Retirer un voyageur"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                  <path d="M4 6h4" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
              <button
                type="button"
                className="text-taupe hover:bg-sand flex size-6 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                disabled={guests >= 10}
                onClick={() => setGuests(Math.min(10, guests + 1))}
                aria-label="Ajouter un voyageur"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
                  <path d="M6 4v4M4 6h4" stroke="currentColor" strokeWidth="1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="border-silver mx-[17px] border-t px-4 pt-5">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-ash text-h4 decoration-ash font-normal underline decoration-1 underline-offset-4">
                {formatPrice(total)}&euro; au total
              </p>
              <p className="text-silver text-body mt-[7px]">
                {nights} nuit{nights > 1 ? 's' : ''}
              </p>
            </div>

            <Button href={reserveHref} className="min-w-[122px]">
              Réserver
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[8px] bg-[#f9f9f2] px-10 pt-[31px] pb-8">
        <p className="text-coffee text-body">Besoin d’aide avec votre réservation ?</p>
        <Button href="/contact" className="mt-6 min-w-[208px]" iconRight={<ArrowOutwardIcon />}>
          Contacter l’équipe
        </Button>
      </div>
    </div>
  )
}

function formatPrice(value: number) {
  return value.toLocaleString('fr-FR')
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

function GuestsIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="4" r="2" />
      <path d="M2.5 10c0-2 1.6-3.5 3.5-3.5S9.5 8 9.5 10" />
    </svg>
  )
}

function ArrowOutwardIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10 10 4" />
      <path d="M5 4h5v5" />
    </svg>
  )
}
