import { describe, expect, it } from 'vitest'
import {
  calculateNights,
  validateReservationInput,
} from '@/lib/reservation-validation'
import type { GuestyListing, GuestyQuote } from '@/types/guesty'

const listing: GuestyListing = {
  _id: 'listing-1',
  title: 'Appartement test',
  nickname: 'Appartement test',
  address: {
    full: 'Paris',
    city: 'Paris',
    country: 'France',
    lat: 48.86,
    lng: 2.35,
  },
  pictures: [],
  accommodates: 2,
  bedrooms: 1,
  bathrooms: 1,
  propertyType: 'apartment',
  roomType: 'entire',
  amenities: [],
  description: '',
  prices: { basePrice: 200, currency: 'EUR' },
  minNights: 2,
  maxNights: 14,
}

const quote: GuestyQuote = {
  _id: 'quote-1',
  createdAt: '2026-05-18T00:00:00.000Z',
  expiresAt: '2026-05-19T00:00:00.000Z',
  accountId: 'account-1',
  guestsCount: 2,
  unitTypeId: 'listing-1',
  checkInDateLocalized: '2026-08-12',
  checkOutDateLocalized: '2026-08-15',
  rates: {
    ratePlans: [
      {
        inquiryId: 'inquiry-1',
        ratePlan: {
          _id: 'rate-1',
          name: 'Standard',
          type: 'default',
          money: {
            currency: 'EUR',
            fareAccommodation: 600,
            fareAccommodationAdjusted: 600,
            fareCleaning: 80,
            totalFees: 80,
            subTotalPrice: 680,
            hostPayout: 680,
            totalTaxes: 0,
          },
        },
      },
    ],
  },
  status: 'valid',
}

describe('reservation-validation', () => {
  it('calcule les nuits à partir de dates ISO', () => {
    expect(calculateNights('2026-08-12', '2026-08-15')).toBe(3)
  })

  it('rejette une date de départ avant la date d’arrivée', () => {
    expect(() => calculateNights('2026-08-15', '2026-08-12')).toThrow('VALIDATION_FAILED')
  })

  it('retourne le montant serveur depuis le quote Guesty', () => {
    const result = validateReservationInput({
      listing,
      quote,
      requestedRatePlanId: 'rate-1',
      checkIn: '2026-08-12',
      checkOut: '2026-08-15',
      guestsCount: 2,
    })

    expect(result.amountCents).toBe(68000)
    expect(result.currency).toBe('eur')
    expect(result.ratePlan.ratePlan._id).toBe('rate-1')
  })

  it('rejette une capacité voyageurs trop élevée', () => {
    expect(() =>
      validateReservationInput({
        listing,
        quote,
        checkIn: '2026-08-12',
        checkOut: '2026-08-15',
        guestsCount: 3,
      }),
    ).toThrow('GUESTS_EXCEED_CAPACITY')
  })

  it('rejette une durée inférieure au minimum du logement', () => {
    expect(() =>
      validateReservationInput({
        listing,
        quote,
        checkIn: '2026-08-12',
        checkOut: '2026-08-13',
        guestsCount: 2,
      }),
    ).toThrow('MIN_NIGHTS_NOT_MET')
  })
})
