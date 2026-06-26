import { describe, expect, it } from 'vitest'
import {
  findFirstAvailableCalendarStay,
  getCalendarMinimumNightlyPrice,
  getDisplayNightlyPrice,
  getQuoteAccommodationCents,
  getQuoteAverageNightlyPrice,
  getQuoteTotalCents,
} from '@/lib/guesty-pricing'
import type { GuestyQuote, GuestyQuoteMoney } from '@/types/guesty'

describe('guesty-pricing', () => {
  it('sépare le total séjour du prix logement moyen par nuit', () => {
    const quote = buildQuote({
      fareAccommodation: 420,
      fareAccommodationAdjusted: 400,
      fareCleaning: 80,
      totalFees: 80,
      subTotalPrice: 480,
    })

    expect(getQuoteTotalCents(quote)).toBe(48000)
    expect(getQuoteAccommodationCents(quote)).toBe(40000)
    expect(getQuoteAverageNightlyPrice(quote, 2)).toBe(200)
  })

  it('utilise le montant logement non ajusté si le montant ajusté est absent', () => {
    const quote = buildQuote({
      fareAccommodation: 390,
      fareAccommodationAdjusted: 0,
      fareCleaning: 70,
      totalFees: 70,
      subTotalPrice: 460,
    })

    expect(getQuoteAverageNightlyPrice(quote, 3)).toBe(130)
  })

  it('corrige les prix de base Guesty trop élevés sans augmenter un prix dès', () => {
    expect(getDisplayNightlyPrice(1000, 134)).toBe(134)
    expect(getDisplayNightlyPrice(250, 605)).toBe(250)
  })

  it('lit le prix minimum des nuits disponibles du calendrier', () => {
    expect(
      getCalendarMinimumNightlyPrice([
        { date: '2027-01-13', status: 'booked', price: 120, minNights: 1, currency: 'EUR' },
        { date: '2027-01-14', status: 'available', price: 177, minNights: 1, currency: 'EUR' },
        { date: '2027-01-15', status: 'available', price: 190, minNights: 1, currency: 'EUR' },
        { date: '2027-01-16', status: 'blocked', price: 80, minNights: 1, currency: 'EUR' },
      ]),
    ).toBe(177)
  })

  it('trouve la première période disponible réservable dans le calendrier', () => {
    expect(
      findFirstAvailableCalendarStay(
        [
          { date: '2027-01-13', status: 'booked', minNights: 1, currency: 'EUR' },
          { date: '2027-01-14', status: 'available', minNights: 2, currency: 'EUR' },
          { date: '2027-01-15', status: 'available', minNights: 1, currency: 'EUR' },
          { date: '2027-01-16', status: 'booked', minNights: 1, currency: 'EUR' },
        ],
        1,
      ),
    ).toEqual({
      checkIn: '2027-01-14',
      checkOut: '2027-01-16',
      nights: 2,
    })
  })
})

function buildQuote(money: Omit<GuestyQuoteMoney, 'currency' | 'hostPayout' | 'totalTaxes'>) {
  return {
    _id: 'quote-1',
    createdAt: '2026-06-26T00:00:00.000Z',
    expiresAt: '2026-06-26T00:30:00.000Z',
    accountId: 'account-1',
    guestsCount: 2,
    unitTypeId: 'listing-1',
    checkInDateLocalized: '2027-01-13',
    checkOutDateLocalized: '2027-01-15',
    rates: {
      ratePlans: [
        {
          inquiryId: 'inquiry-1',
          ratePlan: {
            _id: 'rate-1',
            name: 'Default',
            type: 'default',
            money: {
              ...money,
              currency: 'EUR',
              hostPayout: money.subTotalPrice,
              totalTaxes: 0,
            },
          },
        },
      ],
    },
    status: 'valid',
  } satisfies GuestyQuote
}
