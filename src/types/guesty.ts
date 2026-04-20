export interface GuestyListing {
  _id: string
  title: string
  nickname: string
  address: {
    full: string
    city: string
    country: string
    lat: number
    lng: number
  }
  pictures: Array<{
    original: string
    thumbnail: string
    caption: string
  }>
  accommodates: number
  bedrooms: number
  bathrooms: number
  propertyType: string
  roomType: string
  amenities: string[]
  description: string
  publicDescription?: {
    summary: string
    space: string
    access: string
    neighborhood: string
    transit: string
    notes: string
  }
  prices: {
    basePrice: number
    currency: string
  }
  minNights: number
  maxNights: number
}

export interface GuestyAvailability {
  listingId: string
  status: 'available' | 'unavailable' | 'booked'
  date: string
  price: number
  currency: string
  minNights: number
}

export interface GuestyCalendarDay {
  date: string
  status: 'available' | 'booked' | 'blocked'
  price: number
  minNights: number
  currency: string
}

export interface GuestyQuote {
  _id: string
  listingId: string
  checkIn: string
  checkOut: string
  guestsCount: number
  ratePlanId: string
  rates: {
    fareAccommodation: number
    fareCleaning: number
    fareAccommodationAdjusted: number
    totalFees: number
    totalTaxes: number
    subTotalPrice: number
    totalPrice: number
    currency: string
  }
  expiresAt: string
}

export interface GuestyGuest {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface GuestyReservationRequest {
  quoteId: string
  ratePlanId: string
  guest: GuestyGuest
  ccToken: string
  policy: {
    privacy: boolean
    terms: boolean
  }
}

export interface GuestyReservation {
  _id: string
  confirmationCode: string
  status: 'confirmed' | 'reserved' | 'canceled'
  listingId: string
  checkIn: string
  checkOut: string
  guestsCount: number
  money: {
    totalPaid: number
    balanceDue: number
    currency: string
  }
  guest: GuestyGuest
}

export interface GuestyPaymentProvider {
  _id: string
  providerType: 'stripe'
  providerAccountId: string
  status: 'ACTIVE' | 'INACTIVE'
  paymentProcessorName: string
  accountName: string
  paymentProcessorId: string
}

export interface GuestyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}
