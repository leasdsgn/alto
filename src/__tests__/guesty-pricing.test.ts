import { describe, expect, it } from 'vitest'
import {
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
