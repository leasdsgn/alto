export type GuestyCustomFields =
  | Array<Record<string, unknown>>
  | Record<string, unknown>
  | null
  | undefined

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
  customFields?: GuestyCustomFields
  totalPrice?: number
  minNights: number
  maxNights: number
}

export interface GuestyCalendarDay {
  date: string
  status: 'available' | 'booked' | 'blocked'
  price?: number
  minNights: number
  maxNights?: number
  currency?: string
  cta?: boolean
  ctd?: boolean
}

export interface GuestyQuoteMoney {
  currency: string
  fareAccommodation: number
  fareAccommodationAdjusted: number
  fareCleaning: number
  totalFees: number
  subTotalPrice: number
  hostPayout: number
  totalTaxes: number
}

export interface GuestyQuoteRatePlan {
  ratePlan: {
    _id: string
    name: string
    type: string
    money: GuestyQuoteMoney
  }
  inquiryId: string
}

export interface GuestyQuote {
  _id: string
  createdAt: string
  expiresAt: string
  accountId: string
  guestsCount: number
  unitTypeId: string
  checkInDateLocalized: string
  checkOutDateLocalized: string
  rates: {
    ratePlans: GuestyQuoteRatePlan[]
  }
  status: string
}

export interface GuestyGuest {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface GuestyPolicyConsent {
  isAccepted: boolean
  dateOfAcceptance: string
  version?: number
}

interface GuestyReservationBaseRequest {
  quoteId: string
  ratePlanId: string
  guest: GuestyGuest
  policy: {
    privacy: GuestyPolicyConsent
    termsAndConditions: GuestyPolicyConsent
  }
}

export interface GuestyInstantReservationRequest extends GuestyReservationBaseRequest {
  confirmationToken: string
  reuse?: boolean
}

export interface GuestyVerifyPaymentRequest {
  reservationId: string
  paymentId: string
  threeDSResult?: {
    provider?: string
    clientSideChallengeResultToken?: string
  }
}

export interface GuestyThreeDSChallenge {
  clientSecret?: string
  client_secret?: string
  paymentIntentClientSecret?: string
  [key: string]: unknown
}

export interface GuestyInstantChargeReservation {
  reservation: {
    _id: string
    status: string
    confirmationCode?: string
    checkInDateLocalized?: string
    checkOutDateLocalized?: string
    guestsCount?: number
  }
  payment: {
    _id: string
    status: string
    amount: number
    currency: string
    reservationId: string
    paymentMethodId?: string
    paidAt?: string
    error?: string
    processorError?: {
      code?: string
      message?: string
    }
  }
  threeDSChallenge?: GuestyThreeDSChallenge | string | null
  attempts?: unknown[]
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
