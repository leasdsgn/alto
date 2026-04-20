export interface Apartment {
  id: string
  name: string
  price: number
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
  description: string
  space: string
  neighborhood: string
  transit: string
  amenities: string[]
  minNights: number
  maxNights: number
}
