export interface Apartment {
  id: string
  name: string
  price: number | null
  currency: string
  guests: number
  surface: number
  bedrooms: number
  bathrooms: number
  slug: string
  images: string[]
  image?: string
  lat?: number
  lng?: number
  address?: string
  city?: string
  neighborhoodLabel?: string
  description: string
  space: string
  neighborhood: string
  transit: string
  amenities: string[]
  minNights: number
  maxNights: number
  priceSource?: ApartmentPriceSource
}

export type ApartmentPriceSource = 'starting' | 'total'

export interface ApartmentCardData {
  id: string
  name: string
  price: number | null
  currency: string
  guests: number
  surface: number
  bedrooms: number
  bathrooms: number
  slug: string
  images: string[]
  image?: string
  lat?: number
  lng?: number
  address?: string
  city?: string
  neighborhoodLabel?: string
  minNights?: number
  maxNights?: number
  priceSource?: ApartmentPriceSource
}
