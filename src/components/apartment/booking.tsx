'use client'

import { useState } from 'react'
import {
  DateRangePicker,
  DateField,
  RangeCalendar,
  Label,
} from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { RangeValue } from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/lib/stores/search'
import { formatDateShort } from '@/lib/format-date'

interface BookingProps {
  price: number
}

export function ApartmentBooking({ price }: BookingProps) {
  const { dates, guests, setDates, setGuests } = useSearchStore()
  const [dateOpen, setDateOpen] = useState(false)
  const nights = dates.end.compare(dates.start)
  const total = price * nights
  const minDate = today(getLocalTimeZone())

  function handleDateChange(value: RangeValue<DateValue> | null) {
    if (value) setDates({ start: value.start, end: value.end })
  }

  return (
    <div className="bg-cream sticky top-8 rounded-lg border border-divider p-5">
      <div className="flex items-baseline gap-1">
        <span className="text-coffee text-2xl font-bold tabular-nums">{price}€</span>
        <span className="text-coffee text-xs font-medium">pour une nuit</span>
      </div>
      <p className="text-silver mt-0.5 text-xs font-medium tabular-nums">
        {total}€ pour {nights} nuit{nights > 1 ? 's' : ''}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <DateRangePicker
          value={dates}
          onChange={handleDateChange}
          minValue={minDate}
          startName="checkIn"
          endName="checkOut"
          isOpen={dateOpen}
          onOpenChange={setDateOpen}
          className="date-picker"
        >
          <Label className="sr-only">Dates du séjour</Label>
          <button
            type="button"
            className="w-full cursor-pointer rounded-lg border border-divider text-left transition-colors hover:border-silver"
            onClick={() => setDateOpen(true)}
          >
            <div className="flex">
              <div className="flex-1 border-r border-divider px-3 py-2.5">
                <p className="text-coffee text-caption font-bold uppercase tracking-[0.5px]">Arrivée</p>
                <p className="text-coffee mt-0.5 text-xs font-medium">{formatDateShort(dates.start)}</p>
              </div>
              <div className="flex-1 px-3 py-2.5">
                <p className="text-coffee text-caption font-bold uppercase tracking-[0.5px]">Départ</p>
                <p className="text-coffee mt-0.5 text-xs font-medium">{formatDateShort(dates.end)}</p>
              </div>
            </div>
          </button>
          <DateField.Group className="hidden" fullWidth>
            <DateField.Input slot="start">{(s) => <DateField.Segment segment={s} />}</DateField.Input>
            <DateField.Input slot="end">{(s) => <DateField.Segment segment={s} />}</DateField.Input>
          </DateField.Group>
          <DateRangePicker.Popover className="bg-cream rounded-lg border border-divider p-5 shadow-none" placement="bottom start">
            <RangeCalendar aria-label="Dates du séjour" minValue={minDate}>
              <RangeCalendar.Header>
                <RangeCalendar.Heading className="text-coffee text-sm font-bold" />
                <RangeCalendar.NavButton slot="previous" />
                <RangeCalendar.NavButton slot="next" />
              </RangeCalendar.Header>
              <RangeCalendar.Grid className="w-full">
                <RangeCalendar.GridHeader>
                  {(day) => (
                    <RangeCalendar.HeaderCell className="text-taupe text-xs font-bold">{day}</RangeCalendar.HeaderCell>
                  )}
                </RangeCalendar.GridHeader>
                <RangeCalendar.GridBody>
                  {(date) => (
                    <RangeCalendar.Cell
                      date={date}
                      className="text-coffee flex size-8 items-center justify-center rounded-sm text-xs outline-none hover:bg-sand data-[selected]:bg-coffee/10 data-[selection-start]:bg-coffee data-[selection-start]:text-cream data-[selection-end]:bg-coffee data-[selection-end]:text-cream data-[unavailable]:text-silver data-[unavailable]:line-through"
                    />
                  )}
                </RangeCalendar.GridBody>
              </RangeCalendar.Grid>
            </RangeCalendar>
          </DateRangePicker.Popover>
        </DateRangePicker>

        <div className="rounded-lg border border-divider px-3 py-2.5">
          <p className="text-coffee text-caption font-bold uppercase tracking-[0.5px]">Voyageurs</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-coffee text-xs font-medium">{guests} voyageur{guests > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="text-taupe flex size-6 items-center justify-center rounded-full transition-colors hover:bg-sand disabled:opacity-30"
                disabled={guests <= 1}
                onClick={() => setGuests(Math.max(1, guests - 1))}
                aria-label="Retirer un voyageur"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" /><path d="M4 6h4" stroke="currentColor" strokeWidth="1" /></svg>
              </button>
              <button
                type="button"
                className="text-taupe flex size-6 items-center justify-center rounded-full transition-colors hover:bg-sand disabled:opacity-30"
                disabled={guests >= 10}
                onClick={() => setGuests(Math.min(10, guests + 1))}
                aria-label="Ajouter un voyageur"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" /><path d="M6 4v4M4 6h4" stroke="currentColor" strokeWidth="1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Button href="/reserver" className="mt-5 h-[40px] w-full">
        Réserver
      </Button>

      <p className="text-silver mt-3 text-center text-caption">Pas de frais Airbnb</p>
    </div>
  )
}
