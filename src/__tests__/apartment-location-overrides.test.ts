import { describe, expect, it } from 'vitest'
import { getApartmentCoordinates } from '@/lib/apartment-location-overrides'

describe('getApartmentCoordinates', () => {
  it('uses the canonical Rue d’Algérie coordinates for Terreaux IV', () => {
    expect(getApartmentCoordinates('terreaux-iv', { lat: 45.767663, lng: 4.8323982 })).toEqual({
      lat: 45.7692822,
      lng: 4.8335897,
    })
  })

  it('keeps Guesty coordinates for other apartments', () => {
    expect(getApartmentCoordinates('constantine-i', { lat: 45.7671768, lng: 4.8321949 })).toEqual({
      lat: 45.7671768,
      lng: 4.8321949,
    })
  })
})
