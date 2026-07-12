'use client'

import { useEffect, useMemo, useState } from 'react'
import { DateRangePicker, DateField, RangeCalendar, Label } from '@heroui/react'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { RangeValue } from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/components/providers/locale-provider'
import { useFooterGlobals } from '@/components/providers/storyblok-globals-provider'
import { clampGuestsToCapacity, useSearchStore } from '@/lib/stores/search'
import { formatDateShort } from '@/lib/format-date'
import { formatCurrency } from '@/lib/formatters'
import { getQuoteAccommodationCents, getQuoteTotalCents } from '@/lib/guesty-pricing'
import { getEffectiveMinimumNights } from '@/lib/booking-minimum-stay'
import { WHATSAPP_LINK } from '@/lib/whatsapp'
import type { GuestyCalendarDay, GuestyQuote } from '@/types/guesty'

interface BookingProps {
  price: number | null
  slug: string
  listingId?: string
  capacity?: number
  minNights?: number
  maxNights?: number
  initialShouldVerifyQuote?: boolean
  variant?: 'card' | 'mobileSheet'
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
  initialShouldVerifyQuote = false,
  variant = 'card',
}: BookingProps) {
  const locale = useLocale()
  const contact = useFooterGlobals().ctaButton
  const { dates, guests, setDates, setGuests } = useSearchStore()
  const checkIn = dates.start.toString()
  const checkOut = dates.end.toString()
  const reserveHref = `/book/${slug}?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`
  const [dateOpen, setDateOpen] = useState(false)
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [minimumNightsByDate, setMinimumNightsByDate] = useState<Map<string, number>>(new Map())
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    listingId ? 'loading' : 'idle',
  )
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>('idle')
  const [quoteBreakdown, setQuoteBreakdown] = useState<QuoteBreakdown | null>(null)
  const [verifiedQuoteKey, setVerifiedQuoteKey] = useState<string | null>(null)
  const [shouldVerifyQuote, setShouldVerifyQuote] = useState(initialShouldVerifyQuote)
  const nights = dates.end.compare(dates.start)
  const effectiveMinNights = getEffectiveMinimumNights(
    minNights,
    dates.start.toString(),
    minimumNightsByDate,
  )
  const fallbackTotal = useMemo(() => {
    if (!isDisplayablePrice(price)) return null
    return price * Math.max(nights, 0)
  }, [nights, price])
  const minDate = useMemo(() => today(getLocalTimeZone()), [])
  const minDateKey = minDate.toString()
  const availabilityEnd = useMemo(() => minDate.add({ months: 18 }).toString(), [minDate])
  const quoteRequestKey = listingId
    ? [listingId, checkIn, checkOut, guests, locale].join(':')
    : null
  const hasKnownUnavailableSelection =
    availabilityStatus === 'ready' &&
    rangeHasUnavailableNight(dates.start, dates.end, unavailableDates)
  const isBelowMinNights = nights < effectiveMinNights
  const isAboveMaxNights = Boolean(maxNights && nights > maxNights)
  const isAboveCapacity = Boolean(capacity && guests > capacity)
  const hasVerifiedQuote =
    !listingId || (quoteStatus === 'ready' && verifiedQuoteKey === quoteRequestKey)
  const canReserve =
    shouldVerifyQuote &&
    hasVerifiedQuote &&
    nights > 0 &&
    !hasKnownUnavailableSelection &&
    !isBelowMinNights &&
    !isAboveMaxNights &&
    !isAboveCapacity
  const availabilityMessage = getAvailabilityMessage({
    status: availabilityStatus,
    hasUnavailableSelection: hasKnownUnavailableSelection,
    isBelowMinNights,
    isAboveMaxNights,
    isAboveCapacity,
    minNights: effectiveMinNights,
    maxNights,
    capacity,
    quoteStatus,
    shouldVerifyQuote,
    locale,
  })
  const priceLabel = getPriceLabel({
    fallbackPrice: price,
    fallbackTotal,
    quoteBreakdown,
    quoteStatus,
    locale,
    canShowFallbackPrice: canReserve || availabilityStatus !== 'ready',
    shouldVerifyQuote,
  })
  const nightlyLabel = getNightlyLabel({
    fallbackPrice: price,
    nights,
    quoteBreakdown,
    quoteStatus,
    locale,
    canShowFallbackPrice: canReserve || availabilityStatus !== 'ready',
    shouldVerifyQuote,
  })
  const isMobileSheet = variant === 'mobileSheet'
  const copy = BOOKING_COPY[locale]

  useEffect(() => {
    const nextGuests = clampGuestsToCapacity(guests, capacity)
    if (nextGuests !== guests) setGuests(nextGuests)
  }, [capacity, guests, setGuests])

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
        const minimumStays = new Map<string, number>()
        for (const day of days) {
          if (day.minNights > 0) minimumStays.set(day.date.slice(0, 10), day.minNights)
        }

        setUnavailableDates(unavailable)
        setMinimumNightsByDate(minimumStays)
        setAvailabilityStatus('ready')
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[apartment booking] availability failed', error)
          setUnavailableDates(new Set())
          setMinimumNightsByDate(new Map())
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
      nights: effectiveMinNights,
      maxNights,
    })

    if (nextRange) setDates(nextRange)
  }, [
    availabilityStatus,
    dates.start,
    dates.end,
    maxNights,
    minDate,
    effectiveMinNights,
    setDates,
    unavailableDates,
  ])

  function handleDateChange(value: RangeValue<DateValue> | null) {
    if (!value) return
    if (rangeHasUnavailableNight(value.start, value.end, unavailableDates)) return

    setShouldVerifyQuote(true)
    setDates({ start: value.start, end: value.end })
  }

  useEffect(() => {
    if (
      !listingId ||
      !shouldVerifyQuote ||
      nights <= 0 ||
      hasKnownUnavailableSelection ||
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
    shouldVerifyQuote,
    nights,
    hasKnownUnavailableSelection,
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
    <div className={isMobileSheet ? 'w-full max-w-[498px]' : 'w-full max-w-[498px] space-y-[33px]'}>
      <div
        className={
          isMobileSheet
            ? ''
            : 'rounded-[8px] bg-[#f9f9f2] px-6 pt-8 pb-[31px] shadow-[0_2px_2px_rgba(0,0,0,0.15)]'
        }
      >
        <div className={isMobileSheet ? 'px-1' : 'px-4'}>
          <h2 className="text-coffee text-h5 font-bold tracking-[-0.02em]">{copy.title}</h2>

          <div className="from-silver to-taupe mt-[13px] max-w-[378px] rounded-[8px] bg-gradient-to-r px-3 py-1.5 shadow-[0_2px_2px_rgba(0,0,0,0.15)]">
            <p className="text-cream text-body-sm leading-[1.35] sm:whitespace-nowrap">
              {copy.cancellation}
            </p>
          </div>
        </div>

        {isMobileSheet && <SwiklyNotice copy={copy} />}

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
          <Label className="sr-only">{copy.stayDates}</Label>

          <div className={`border-silver mx-[17px] border-t ${isMobileSheet ? 'mt-5' : 'mt-8'}`}>
            <button
              type="button"
              className="grid w-full grid-cols-[1fr_1px_1fr] text-left"
              onClick={() => setDateOpen(true)}
            >
              <div className="px-4 py-[15px] pr-5">
                <div className="text-taupe flex items-center gap-2">
                  <CalendarIcon />
                  <p className="text-body">{copy.checkIn}</p>
                </div>
                <p className="text-coffee text-body-xl mt-[13px] font-semibold">
                  {formatDateShort(dates.start, locale)}
                </p>
              </div>

              <div className="bg-silver h-full w-px" />

              <div className="px-4 py-[15px] pl-5">
                <div className="text-taupe flex items-center gap-2">
                  <CalendarIcon />
                  <p className="text-body">{copy.checkOut}</p>
                </div>
                <p className="text-coffee text-body-xl mt-[13px] font-semibold">
                  {formatDateShort(dates.end, locale)}
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
            isNonModal
            className="bg-cream border-divider rounded-lg border p-5 shadow-[0_8px_24px_rgba(48,26,10,0.1)]"
            placement="bottom start"
          >
            <RangeCalendar
              aria-label={copy.stayDates}
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
            <p className="text-body">{copy.guestsLabel}</p>
          </div>
          <div className="mt-[13px] flex items-center justify-between gap-4">
            <span className="text-coffee text-body-xl font-semibold">
              {guests} {guests > 1 ? copy.guests : copy.guest}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="text-taupe hover:bg-sand flex size-6 items-center justify-center rounded-full transition-colors disabled:opacity-30"
                disabled={guests <= 1}
                onClick={() => setGuests(Math.max(1, guests - 1))}
                aria-label={copy.removeGuest}
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
                aria-label={copy.addGuest}
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
                {nights} {nights > 1 ? copy.nights : copy.night}
              </p>
              {nightlyLabel && <p className="text-taupe text-body-sm mt-1">{nightlyLabel}</p>}
            </div>

            <Button href={reserveHref} isDisabled={!canReserve} className="min-w-[122px]">
              {copy.reserve}
            </Button>
          </div>
        </div>
      </div>

      {!isMobileSheet && (
        <div className="rounded-[8px] bg-[#f9f9f2] px-10 pt-[31px] pb-8">
          <p className="text-coffee text-body">{copy.helpTitle}</p>
          <p className="text-taupe text-body-sm mt-2">{copy.helpAvailability}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              href={contact?.href ?? WHATSAPP_LINK}
              target={contact?.opensInNewTab ? '_blank' : undefined}
              rel={contact?.opensInNewTab ? 'noopener noreferrer' : undefined}
              iconRight={<ArrowOutwardIcon />}
            >
              {copy.helpWhatsapp}
            </Button>
            <Button
              href="mailto:contact@alto-collection.com"
              variant="secondary"
              iconRight={<ArrowOutwardIcon />}
            >
              {copy.helpEmail}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const BOOKING_COPY = {
  fr: {
    title: 'Votre réservation',
    cancellation: 'Annulation gratuite 14 jours avant la réservation',
    swiklyTitle: 'Dépôt de garantie Swikly',
    swiklyBody:
      'Une caution sécurisée peut être demandée avant l’arrivée. Elle n’est pas débitée, sauf incident.',
    helpTitle: 'Besoin d’aide avec votre réservation ?',
    helpAvailability: 'Disponible tous les jours de 8 h à 20 h.',
    helpWhatsapp: 'WhatsApp',
    helpEmail: 'E-mail',
    stayDates: 'Dates du séjour',
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    guestsLabel: 'Voyageurs',
    guest: 'voyageur',
    guests: 'voyageurs',
    removeGuest: 'Retirer un voyageur',
    addGuest: 'Ajouter un voyageur',
    night: 'nuit',
    nights: 'nuits',
    reserve: 'Réserver',
  },
  en: {
    title: 'Your booking',
    cancellation: 'Free cancellation up to 14 days before the stay',
    swiklyTitle: 'Swikly security deposit',
    swiklyBody:
      'A secure deposit may be requested before arrival. It is not charged unless an incident occurs.',
    helpTitle: 'Need help with your booking?',
    helpAvailability: 'Available every day from 8 am to 8 pm.',
    helpWhatsapp: 'WhatsApp',
    helpEmail: 'Email',
    stayDates: 'Stay dates',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guestsLabel: 'Guests',
    guest: 'guest',
    guests: 'guests',
    removeGuest: 'Remove one guest',
    addGuest: 'Add one guest',
    night: 'night',
    nights: 'nights',
    reserve: 'Book',
  },
} as const

type BookingCopy = (typeof BOOKING_COPY)[keyof typeof BOOKING_COPY]

function SwiklyNotice({ copy }: { copy: BookingCopy }) {
  return (
    <div className="border-divider bg-sand/40 mx-1 mt-4 rounded-[8px] border px-4 py-3">
      <p className="text-coffee text-body-sm font-semibold">{copy.swiklyTitle}</p>
      <p className="text-taupe mt-1 text-xs leading-[1.45]">{copy.swiklyBody}</p>
    </div>
  )
}

function formatPrice(value: number) {
  return value.toLocaleString('fr-FR')
}

function getPriceLabel({
  fallbackPrice,
  fallbackTotal,
  quoteBreakdown,
  quoteStatus,
  locale,
  canShowFallbackPrice,
  shouldVerifyQuote,
}: {
  fallbackPrice: number | null
  fallbackTotal: number | null
  quoteBreakdown: QuoteBreakdown | null
  quoteStatus: QuoteStatus
  locale: 'fr' | 'en'
  canShowFallbackPrice: boolean
  shouldVerifyQuote: boolean
}) {
  if (quoteStatus === 'loading') {
    return locale === 'en' ? 'Calculating total...' : 'Calcul du total...'
  }

  if (!shouldVerifyQuote) {
    if (isDisplayablePrice(fallbackPrice)) {
      return locale === 'en'
        ? `From ${formatPrice(fallbackPrice)}€ / night`
        : `Dès ${formatPrice(fallbackPrice)}€ / nuit`
    }

    return locale === 'en' ? 'Check availability' : 'Voir disponibilités'
  }

  if (!canShowFallbackPrice) {
    return locale === 'en' ? 'Pick available dates' : 'Choisissez des dates disponibles'
  }

  if (quoteBreakdown) {
    const total = formatCurrency(quoteBreakdown.totalCents, quoteBreakdown.currency, locale)
    return locale === 'en' ? `${total} total` : `${total} au total`
  }

  if (fallbackTotal) {
    return locale === 'en'
      ? `${formatPrice(fallbackTotal)}€ total`
      : `${formatPrice(fallbackTotal)}€ au total`
  }

  return locale === 'en' ? 'Price after dates' : 'Prix après sélection'
}

function getNightlyLabel({
  fallbackPrice,
  nights,
  quoteBreakdown,
  quoteStatus,
  locale,
  canShowFallbackPrice,
  shouldVerifyQuote,
}: {
  fallbackPrice: number | null
  nights: number
  quoteBreakdown: QuoteBreakdown | null
  quoteStatus: QuoteStatus
  locale: 'fr' | 'en'
  canShowFallbackPrice: boolean
  shouldVerifyQuote: boolean
}) {
  if (!shouldVerifyQuote) return null
  if (!canShowFallbackPrice || nights <= 0 || quoteStatus === 'loading') return null

  if (quoteBreakdown) {
    const averageNightCents = Math.round(quoteBreakdown.accommodationCents / nights)
    const averageNight = formatCurrency(averageNightCents, quoteBreakdown.currency, locale)

    return locale === 'en' ? `${averageNight} / night` : `${averageNight} / nuit`
  }

  if (!isDisplayablePrice(fallbackPrice)) return null

  return locale === 'en'
    ? `${formatPrice(fallbackPrice)}€ / night`
    : `${formatPrice(fallbackPrice)}€ / nuit`
}

function isDisplayablePrice(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
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
  shouldVerifyQuote,
  locale,
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
  shouldVerifyQuote: boolean
  locale: 'fr' | 'en'
}) {
  const isEnglish = locale === 'en'

  if (!shouldVerifyQuote) {
    return isEnglish
      ? 'Choose your dates to check the exact price.'
      : 'Choisissez vos dates pour vérifier le tarif exact.'
  }
  if (quoteStatus === 'loading') {
    return isEnglish
      ? 'Checking the price and availability.'
      : 'Vérification du tarif et des disponibilités.'
  }
  if (quoteStatus === 'error') {
    return isEnglish
      ? 'These dates are not available for this apartment. Choose another period.'
      : 'Ces dates ne sont pas disponibles pour cet appartement. Choisissez une autre période.'
  }
  if (hasUnavailableSelection) {
    return isEnglish
      ? 'These dates are not available. Choose another period.'
      : 'Ces dates ne sont pas disponibles. Choisissez une autre période.'
  }
  if (isBelowMinNights && minNights) {
    return isEnglish
      ? `The minimum stay is ${minNights} night${minNights > 1 ? 's' : ''}.`
      : `Le séjour minimum est de ${minNights} nuit${minNights > 1 ? 's' : ''}.`
  }
  if (isAboveMaxNights && maxNights) {
    return isEnglish
      ? `The maximum stay is ${maxNights} night${maxNights > 1 ? 's' : ''}.`
      : `Le séjour maximum est de ${maxNights} nuit${maxNights > 1 ? 's' : ''}.`
  }
  if (isAboveCapacity && capacity) {
    return isEnglish
      ? `This apartment accommodates up to ${capacity} guest${capacity > 1 ? 's' : ''}.`
      : `Cet appartement accueille jusqu’à ${capacity} voyageur${capacity > 1 ? 's' : ''}.`
  }
  if (status === 'loading') {
    return isEnglish
      ? 'Loading the availability calendar.'
      : 'Chargement du calendrier de disponibilités.'
  }
  if (status === 'error') {
    return isEnglish
      ? 'The availability calendar cannot be checked right now.'
      : 'Le calendrier de disponibilités ne peut pas être vérifié pour le moment.'
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
