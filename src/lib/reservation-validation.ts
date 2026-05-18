import { type GuestyListing, type GuestyQuote, type GuestyQuoteRatePlan } from '@/types/guesty'

export interface ValidatedReservationInput {
  listing: GuestyListing
  quote: GuestyQuote
  ratePlan: GuestyQuoteRatePlan
  nights: number
  amountCents: number
  currency: string
}

export interface ValidateReservationInputArgs {
  listing: GuestyListing
  quote: GuestyQuote
  requestedRatePlanId?: string
  checkIn: string
  checkOut: string
  guestsCount: number
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MS_PER_DAY = 24 * 60 * 60 * 1000

export function validateReservationInput({
  listing,
  quote,
  requestedRatePlanId,
  checkIn,
  checkOut,
  guestsCount,
}: ValidateReservationInputArgs): ValidatedReservationInput {
  const nights = calculateNights(checkIn, checkOut)

  if (guestsCount > listing.accommodates) {
    throw validationError('GUESTS_EXCEED_CAPACITY')
  }

  if (listing.minNights && nights < listing.minNights) {
    throw validationError('MIN_NIGHTS_NOT_MET')
  }

  if (listing.maxNights && nights > listing.maxNights) {
    throw validationError('MAX_NIGHTS_EXCEEDED')
  }

  const ratePlan =
    quote.rates.ratePlans.find((item) => item.ratePlan._id === requestedRatePlanId)
    ?? quote.rates.ratePlans[0]

  if (!ratePlan) {
    throw validationError('RATE_PLAN_NOT_APPLICABLE')
  }

  const amountCents = Math.round(ratePlan.ratePlan.money.subTotalPrice * 100)
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw validationError('RATE_PLAN_NOT_APPLICABLE')
  }

  return {
    listing,
    quote,
    ratePlan,
    nights,
    amountCents,
    currency: ratePlan.ratePlan.money.currency.toLowerCase(),
  }
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!ISO_DATE_PATTERN.test(checkIn) || !ISO_DATE_PATTERN.test(checkOut)) {
    throw validationError('VALIDATION_FAILED')
  }

  const start = parseUtcDate(checkIn)
  const end = parseUtcDate(checkOut)
  const nights = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)

  if (!Number.isFinite(nights) || nights <= 0) {
    throw validationError('VALIDATION_FAILED')
  }

  return nights
}

function parseUtcDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw validationError('VALIDATION_FAILED')
  }

  return date
}

function validationError(code: string) {
  return new Error(JSON.stringify({ error: { code } }))
}
