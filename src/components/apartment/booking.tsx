'use client'

import { useEffect, useMemo, useState } from 'react'
import { DateRangePicker, DateField, RangeCalendar, Label } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { RangeValue } from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/components/providers/locale-provider'
import { useSearchStore } from '@/lib/stores/search'
import { formatDateShort } from '@/lib/format-date'
import { formatCurrency } from '@/lib/formatters'
import { getQuoteAccommodationCents, getQuoteTotalCents } from '@/lib/guesty-pricing'
import type { GuestyCalendarDay, GuestyQuote } from '@/types/guesty'

interface BookingProps {
  price: number
  slug: string
  listingId?: string
  capacity?: number
  minNights?: number
  maxNights?: number
}

type AvailabilityStatus = 'idle' | 'loading' | 'ready' | 'error'
type QuoteStatus = 'idle' | 'loading' | 'ready' | 'error'

interface QuoteBreakdown {
  totalCents: number
  accommodationCents: number
  currency: string
}

export function ApartmentBooking({
  price,
  slug,
  listingId,
  capacity,
  minNights,
  maxNights,
}: BookingProps) {
  const locale = useLocale()
  const { dates, guests, setDates, setGuests } = useSearchStore()
  const checkIn = dates.start.toString()
  const checkOut = dates.end.toString()
  const reserveHref = `/book/${slug}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`
  const [dateOpen, setDateOpen] = useState(false)
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    listingId ? 'loading' : 'idle',
  )
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>('idle')
  const [quoteBreakdown, setQuoteBreakdown] = useState<QuoteBreakdown | null>(null)
  const [verifiedQuoteKey, setVerifiedQuoteKey] = useState<string | null>(null)
  const nights = dates.end.compare(dates.start)
  const fallbackTotal = useMemo(() => price * Math.max(nights, 0), [nights, price])
  const minDate = today(getLocalTimeZone())
  const minDateKey = minDate.toString()
  const availabilityEnd = getAvailabilityEnd(minDate, dates.end)
  const quoteRequestKey = listingId
    ? [listingId, checkIn, checkOut, guests, locale].join(':')
    : null
  const hasUnavailableSelection = rangeHasUnavailableNight(dates.start, dates.end, unavailableDates)
  const isBelowMinNights = Boolean(minNights && nights < minNights)
  const isAboveMaxNights = Boolean(maxNights && nights > maxNights)
  const isAboveCapacity = Boolean(capacity && guests > capacity)
  const hasVerifiedQuote =
    !listingId || (quoteStatus === 'ready' && verifiedQuoteKey === quoteRequestKey)
  const canReserve =
    (!listingId || availabilityStatus === 'ready') &&
    hasVerifiedQuote &&
    nights > 0 &&
    !hasUnavailableSelection &&
    !isBelowMinNights &&
    !isAboveMaxNights &&
    !isAboveCapacity
  const availabilityMessage = getAvailabilityMessage({
    status: availabilityStatus,
    hasUnavailableSelection,
    isBelowMinNights,
    isAboveMaxNights,
    isAboveCapacity,
    minNights,
    maxNights,
    capacity,
    quoteStatus,
  })
  const priceLabel = getPriceLabel({
    fallbackTotal,
    quoteBreakdown,
    quoteStatus,
    locale,
    canShowFallbackPrice: canReserve || availabilityStatus !== 'ready',
  })
  const nightlyLabel = getNightlyLabel({
    fallbackPrice: price,
    nights,
    quoteBreakdown,
    quoteStatus,
    locale,
    canShowFallbackPrice: canReserve || availabilityStatus !== 'ready',
  })

  useEffect(() => {
    if (!listingId) {
      setAvailabilityStatus('idle')
      return
    }

    const controller = new AbortController()
    const params = new URLSearchParams({
      listingId,
      checkIn: minDateKey,
      checkOut: availabilityEnd,
    })

    async function loadAvailability() {
      setAvailabilityStatus('loading')

      try {
        const response = await fetch(`/api/guesty/availability?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('availability_failed')

        const data = (await response.json()) as GuestyCalendarDay[] | { days?: GuestyCalendarDay[] }
        const days = Array.isArray(data) ? data : (data.days ?? [])
        const unavailable = new Set(
          days.filter((day) => day.status !== 'available').map((day) => day.date.slice(0, 10)),
        )

        setUnavailableDates(unavailable)
        setAvailabilityStatus('ready')
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[apartment booking] availability failed', error)
          setUnavailableDates(new Set())
          setAvailabilityStatus('error')
        }
      }
    }

    loadAvailability()

    return () => controller.abort()
  }, [listingId, minDateKey, availabilityEnd])

  useEffect(() => {
    if (availabilityStatus !== 'ready') return
    if (!rangeHasUnavailableNight(dates.start, dates.end, unavailableDates)) return

    const nextRange = findNextAvailableRange({
      minDate,
      unavailableDates,
      nights: Math.max(minNights ?? 1, 1),
      maxNights,
    })

    if (nextRange) setDates(nextRange)
  }, [
    availabilityStatus,
    dates.start,
    dates.end,
    maxNights,
    minDate,
    minNights,
    setDates,
    unavailableDates,
  ])

  function handleDateChange(value: RangeValue<DateValue> | null) {
    if (!value) return
    if (rangeHasUnavailableNight(value.start, value.end, unavailableDates)) return

    setDates({ start: value.start, end: value.end })
  }

  useEffect(() => {
    if (
      !listingId ||
      availabilityStatus !== 'ready' ||
      nights <= 0 ||
      hasUnavailableSelection ||
      isBelowMinNights ||
      isAboveMaxNights ||
      isAboveCapacity
    ) {
      setQuoteStatus('idle')
      setQuoteBreakdown(null)
      setVerifiedQuoteKey(null)
      return
    }

    const controller = new AbortController()
    const currentQuoteKey = quoteRequestKey

    async function loadQuote() {
      setQuoteStatus('loading')
      setVerifiedQuoteKey(null)

      try {
        const response = await fetch('/api/guesty/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            listingId,
            checkIn,
            checkOut,
            guestsCount: guests,
            preferredLanguage: locale,
          }),
        })

        if (!response.ok) throw new Error('quote_failed')

        const quote = (await response.json()) as GuestyQuote
        const breakdown = getQuoteBreakdown(quote)
        if (!breakdown) throw new Error('quote_missing_total')

        setQuoteBreakdown(breakdown)
        setVerifiedQuoteKey(currentQuoteKey)
        setQuoteStatus('ready')
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[apartment booking] quote failed', error)
          setQuoteBreakdown(null)
          setVerifiedQuoteKey(null)
          setQuoteStatus('error')
        }
      }
    }

    loadQuote()

    return () => controller.abort()
  }, [
    listingId,
    availabilityStatus,
    nights,
    hasUnavailableSelection,
    isBelowMinNights,
    isAboveMaxNights,
    isAboveCapacity,
    checkIn,
    checkOut,
    guests,
    locale,
    quoteRequestKey,
  ])

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
          isDateUnavailable={(date) => unavailableDates.has(date.toString())}
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
            <RangeCalendar
              aria-label="Dates du séjour"
              minValue={minDate}
              isDateUnavailable={(date) => unavailableDates.has(date.toString())}
            >
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
                disabled={guests >= (capacity ?? 10)}
                onClick={() => setGuests(Math.min(capacity ?? 10, guests + 1))}
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
          {availabilityMessage && (
            <p className="text-taupe text-body-sm mb-4 leading-[1.5]">{availabilityMessage}</p>
          )}

          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-ash text-h4 decoration-ash font-normal underline decoration-1 underline-offset-4">
                {priceLabel}
              </p>
              <p className="text-silver text-body mt-[7px]">
                {nights} nuit{nights > 1 ? 's' : ''}
              </p>
              {nightlyLabel && <p className="text-taupe text-body-sm mt-1">{nightlyLabel}</p>}
            </div>

            <Button href={reserveHref} isDisabled={!canReserve} className="min-w-[122px]">
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

function getPriceLabel({
  fallbackTotal,
  quoteBreakdown,
  quoteStatus,
  locale,
  canShowFallbackPrice,
}: {
  fallbackTotal: number
  quoteBreakdown: QuoteBreakdown | null
  quoteStatus: QuoteStatus
  locale: 'fr' | 'en'
  canShowFallbackPrice: boolean
}) {
  if (quoteStatus === 'loading') {
    return locale === 'en' ? 'Calculating total...' : 'Calcul du total...'
  }

  if (!canShowFallbackPrice) {
    return locale === 'en' ? 'Pick available dates' : 'Choisissez des dates disponibles'
  }

  if (quoteBreakdown) {
    const total = formatCurrency(quoteBreakdown.totalCents, quoteBreakdown.currency, locale)
    return locale === 'en' ? `${total} total` : `${total} au total`
  }

  return locale === 'en'
    ? `${formatPrice(fallbackTotal)}€ total`
    : `${formatPrice(fallbackTotal)}€ au total`
}

function getNightlyLabel({
  fallbackPrice,
  nights,
  quoteBreakdown,
  quoteStatus,
  locale,
  canShowFallbackPrice,
}: {
  fallbackPrice: number
  nights: number
  quoteBreakdown: QuoteBreakdown | null
  quoteStatus: QuoteStatus
  locale: 'fr' | 'en'
  canShowFallbackPrice: boolean
}) {
  if (!canShowFallbackPrice || nights <= 0 || quoteStatus === 'loading') return null

  if (quoteBreakdown) {
    const averageNightCents = Math.round(quoteBreakdown.accommodationCents / nights)
    const averageNight = formatCurrency(averageNightCents, quoteBreakdown.currency, locale)

    return locale === 'en' ? `${averageNight} / night` : `${averageNight} / nuit`
  }

  return locale === 'en'
    ? `${formatPrice(fallbackPrice)}€ / night`
    : `${formatPrice(fallbackPrice)}€ / nuit`
}

function getQuoteBreakdown(quote: GuestyQuote): QuoteBreakdown | null {
  const totalCents = getQuoteTotalCents(quote)
  const accommodationCents = getQuoteAccommodationCents(quote)

  if (!totalCents || !accommodationCents) return null

  return {
    totalCents,
    accommodationCents,
    currency: quote.rates.ratePlans[0]?.ratePlan.money.currency?.toLowerCase() ?? 'eur',
  }
}

function getAvailabilityEnd(minDate: DateValue, selectedEnd: DateValue) {
  const minEnd = addMonths(minDate, 18)
  const selectedBufferEnd = addMonths(selectedEnd, 1)

  return selectedBufferEnd.compare(minEnd) > 0 ? selectedBufferEnd.toString() : minEnd.toString()
}

function addMonths(date: DateValue, months: number) {
  return date.add({ months })
}

function rangeHasUnavailableNight(start: DateValue, end: DateValue, unavailableDates: Set<string>) {
  let current = start

  while (current.compare(end) < 0) {
    if (unavailableDates.has(current.toString())) return true
    current = current.add({ days: 1 })
  }

  return false
}

function findNextAvailableRange({
  minDate,
  unavailableDates,
  nights,
  maxNights,
}: {
  minDate: DateValue
  unavailableDates: Set<string>
  nights: number
  maxNights?: number
}): RangeValue<DateValue> | null {
  const rangeNights = Math.max(1, Math.min(nights, maxNights ?? nights))
  let start = minDate
  const latestStart = minDate.add({ months: 18 })

  while (start.compare(latestStart) <= 0) {
    const end = start.add({ days: rangeNights })
    if (!rangeHasUnavailableNight(start, end, unavailableDates)) return { start, end }
    start = start.add({ days: 1 })
  }

  return null
}

function getAvailabilityMessage({
  status,
  hasUnavailableSelection,
  isBelowMinNights,
  isAboveMaxNights,
  isAboveCapacity,
  minNights,
  maxNights,
  capacity,
  quoteStatus,
}: {
  status: AvailabilityStatus
  hasUnavailableSelection: boolean
  isBelowMinNights: boolean
  isAboveMaxNights: boolean
  isAboveCapacity: boolean
  minNights?: number
  maxNights?: number
  capacity?: number
  quoteStatus: QuoteStatus
}) {
  if (status === 'loading') return 'Vérification des disponibilités en cours.'
  if (status === 'error') return 'Les disponibilités ne peuvent pas être vérifiées pour le moment.'
  if (hasUnavailableSelection)
    return 'Ces dates ne sont pas disponibles. Choisissez une autre période.'
  if (isBelowMinNights && minNights) {
    return `Le séjour minimum est de ${minNights} nuit${minNights > 1 ? 's' : ''}.`
  }
  if (isAboveMaxNights && maxNights) {
    return `Le séjour maximum est de ${maxNights} nuit${maxNights > 1 ? 's' : ''}.`
  }
  if (isAboveCapacity && capacity) {
    return `Cet appartement accueille jusqu’à ${capacity} voyageur${capacity > 1 ? 's' : ''}.`
  }
  if (quoteStatus === 'loading') return 'Vérification du tarif et des disponibilités.'
  if (quoteStatus === 'error') {
    return 'Ces dates ne sont pas disponibles pour cet appartement. Choisissez une autre période.'
  }

  return null
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
