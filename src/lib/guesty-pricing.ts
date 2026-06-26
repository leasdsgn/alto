import type { GuestyCalendarDay, GuestyQuote, GuestyQuoteMoney } from '@/types/guesty'

export interface CalendarStay {
  checkIn: string
  checkOut: string
  nights: number
}

export function getQuoteTotalCents(quote: GuestyQuote): number | null {
  const money = getQuoteMoney(quote)
  if (!money) return null

  return toPositiveCents(money.subTotalPrice)
}

export function getQuoteAccommodationCents(quote: GuestyQuote): number | null {
  const money = getQuoteMoney(quote)
  if (!money) return null

  return toPositiveCents(getAccommodationAmount(money))
}

export function getQuoteAverageNightlyPrice(quote: GuestyQuote, nights: number): number | null {
  if (nights <= 0) return null

  const accommodationCents = getQuoteAccommodationCents(quote)
  if (!accommodationCents) return null

  return Math.round(accommodationCents / 100 / nights)
}

export function getDisplayNightlyPrice(basePrice: number, quoteNightlyPrice: number): number {
  if (!Number.isFinite(basePrice) || basePrice <= 0) return quoteNightlyPrice
  if (!Number.isFinite(quoteNightlyPrice) || quoteNightlyPrice <= 0) return basePrice

  return Math.min(basePrice, quoteNightlyPrice)
}

export function getCalendarMinimumNightlyPrice(days: GuestyCalendarDay[]): number | null {
  const prices = days
    .filter((day) => day.status === 'available')
    .map((day) => day.price)
    .filter(
      (price): price is number => typeof price === 'number' && Number.isFinite(price) && price > 0,
    )

  if (prices.length === 0) return null

  return Math.round(Math.min(...prices))
}

export function findFirstAvailableCalendarStay(
  days: GuestyCalendarDay[],
  fallbackMinNights = 1,
): CalendarStay | null {
  const sortedDays = [...days].sort((left, right) => left.date.localeCompare(right.date))

  for (let index = 0; index < sortedDays.length; index += 1) {
    const startDay = sortedDays[index]
    if (startDay.status !== 'available') continue

    const nights = getStayNights(startDay.minNights, fallbackMinNights)
    if (!hasConsecutiveAvailableNights(sortedDays, index, nights)) continue

    const checkIn = startDay.date.slice(0, 10)
    return {
      checkIn,
      checkOut: addDays(checkIn, nights),
      nights,
    }
  }

  return null
}

function getQuoteMoney(quote: GuestyQuote): GuestyQuoteMoney | null {
  return quote.rates.ratePlans[0]?.ratePlan.money ?? null
}

function getAccommodationAmount(money: GuestyQuoteMoney): number {
  return money.fareAccommodationAdjusted || money.fareAccommodation
}

function toPositiveCents(value: number | undefined): number | null {
  if (!value || !Number.isFinite(value)) return null

  const cents = Math.round(value * 100)
  return cents > 0 ? cents : null
}

function getStayNights(dayMinNights: number | undefined, fallbackMinNights: number): number {
  const minNights = dayMinNights || fallbackMinNights || 1
  return Math.max(1, Math.round(minNights))
}

function hasConsecutiveAvailableNights(
  days: GuestyCalendarDay[],
  startIndex: number,
  nights: number,
): boolean {
  const startDate = days[startIndex]?.date.slice(0, 10)
  if (!startDate) return false

  for (let offset = 0; offset < nights; offset += 1) {
    const day = days[startIndex + offset]
    if (!day || day.status !== 'available') return false
    if (day.date.slice(0, 10) !== addDays(startDate, offset)) return false
  }

  return true
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
