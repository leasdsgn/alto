import type { GuestyQuote, GuestyQuoteMoney } from '@/types/guesty'

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
