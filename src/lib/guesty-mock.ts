import {
  type GuestyListing,
  type GuestyQuote,
  type GuestyReservation,
  type GuestyPaymentProvider,
  type GuestyCalendarDay,
} from '@/types/guesty'

function listing(
  id: string,
  title: string,
  city: string,
  price: number,
  nickname?: string,
): GuestyListing {
  return {
    _id: id,
    title,
    nickname: nickname ?? title,
    address: {
      full: `${title}, ${city}`,
      city,
      country: 'France',
      lat: city === 'Paris' ? 48.858 : 45.76,
      lng: city === 'Paris' ? 2.345 : 4.835,
    },
    pictures: [
      {
        original: '/images/alto-salon.jpg',
        thumbnail: '/images/alto-salon.jpg',
        caption: title,
      },
    ],
    accommodates: 2,
    bedrooms: 1,
    bathrooms: 1,
    propertyType: 'apartment',
    roomType: 'entire',
    amenities: ['wifi', 'kitchen', 'washer', 'air_conditioning'],
    description: `Mock description for ${title}`,
    publicDescription: {
      summary: `Un appartement à ${city}, ambiance ${title}`,
      space: '50 m² environ',
      access: 'Code d\'accès transmis par email',
      neighborhood: `Quartier emblématique de ${city}`,
      transit: 'Métro à 5 min',
      notes: 'Non-fumeur',
    },
    prices: { basePrice: price, currency: 'EUR' },
    minNights: 2,
    maxNights: 30,
  }
}

const MOCK_LISTINGS: GuestyListing[] = [
  listing('mock-faubourg', 'Le Faubourg', 'Paris', 280, 'le-faubourg'),
  listing('mock-opera', "L'Opéra", 'Paris', 210, 'l-opera'),
  listing('mock-saint-germain', 'Le Saint-Germain', 'Paris', 240, 'le-saint-germain'),
  listing('mock-marais', 'Le Marais', 'Paris', 260, 'le-marais'),
  listing('mock-bellecour', 'Bellecour', 'Lyon', 180, 'bellecour'),
  listing('mock-terreaux', 'Terreaux', 'Lyon', 160, 'terreaux'),
]

export const guestyMock = {
  getListings() {
    return Promise.resolve({ results: MOCK_LISTINGS })
  },

  getListing(listingId: string) {
    const item = MOCK_LISTINGS.find((l) => l._id === listingId)
    if (!item) return Promise.reject(new Error(`Mock listing ${listingId} introuvable`))
    return Promise.resolve(item)
  },

  getListingCalendar(_listingId: string, from: string, to: string) {
    const days: GuestyCalendarDay[] = []
    const start = new Date(from)
    const end = new Date(to)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: d.toISOString().slice(0, 10),
        status: 'available',
        price: 240,
        minNights: 2,
        currency: 'EUR',
      })
    }
    return Promise.resolve({ days })
  },

  getAvailableListings(_checkIn: string, _checkOut: string, _guests?: number) {
    return Promise.resolve({ results: MOCK_LISTINGS })
  },

  createQuote(
    listingId: string,
    checkIn: string,
    checkOut: string,
    guestsCount: number,
  ): Promise<GuestyQuote> {
    const match = MOCK_LISTINGS.find((l) => l._id === listingId)
    const nightly = match?.prices.basePrice ?? 240
    const nights = Math.max(
      1,
      Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000),
    )
    const subTotal = nightly * nights
    return Promise.resolve({
      _id: `quote-mock-${Date.now()}`,
      listingId,
      checkIn,
      checkOut,
      guestsCount,
      ratePlanId: 'rate-plan-mock',
      rates: {
        fareAccommodation: subTotal,
        fareCleaning: 50,
        fareAccommodationAdjusted: subTotal,
        totalFees: 50,
        totalTaxes: Math.round(subTotal * 0.1),
        subTotalPrice: subTotal,
        totalPrice: subTotal + 50 + Math.round(subTotal * 0.1),
        currency: 'EUR',
      },
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    })
  },

  getPaymentProvider(_listingId: string): Promise<GuestyPaymentProvider> {
    return Promise.resolve({
      _id: 'provider-mock',
      providerType: 'stripe',
      providerAccountId: process.env.STRIPE_MOCK_CONNECT_ACCOUNT ?? '',
      status: 'ACTIVE',
      paymentProcessorName: 'Stripe (mock)',
      accountName: 'Mock Stripe Account',
      paymentProcessorId: 'mock',
    })
  },

  createInstantReservation(body: {
    quoteId: string
    guest: { firstName: string; lastName: string; email: string; phone: string }
  }): Promise<GuestyReservation> {
    return Promise.resolve(buildReservation('confirmed', body))
  },

  createInquiry(body: {
    quoteId: string
    guest: { firstName: string; lastName: string; email: string; phone: string }
  }): Promise<GuestyReservation> {
    return Promise.resolve(buildReservation('reserved', body))
  },
}

function buildReservation(
  status: 'confirmed' | 'reserved',
  body: {
    quoteId: string
    guest: { firstName: string; lastName: string; email: string; phone: string }
  },
): GuestyReservation {
  return {
    _id: `res-mock-${Date.now()}`,
    confirmationCode: `MOCK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status,
    listingId: 'mock-faubourg',
    checkIn: new Date().toISOString(),
    checkOut: new Date(Date.now() + 3 * 86400000).toISOString(),
    guestsCount: 2,
    money: { totalPaid: 720, balanceDue: 0, currency: 'EUR' },
    guest: body.guest,
  }
}
