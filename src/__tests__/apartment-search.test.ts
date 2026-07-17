import { describe, expect, it } from 'vitest'
import { buildApartmentSearchHref, buildApartmentSearchParams } from '@/lib/apartment-search'

describe('buildApartmentSearchParams', () => {
  it('permet une recherche par ville sans dates', () => {
    const params = buildApartmentSearchParams({ city: 'Lyon', guests: 2 })

    expect(params.toString()).toBe('city=lyon&guests=2')
    expect(params.has('checkIn')).toBe(false)
    expect(params.has('checkOut')).toBe(false)
  })

  it('ajoute les dates lorsqu’elles ont été choisies', () => {
    const params = buildApartmentSearchParams({
      city: 'Paris',
      guests: 3,
      dates: { checkIn: '2026-08-12', checkOut: '2026-08-15' },
    })

    expect(params.get('checkIn')).toBe('2026-08-12')
    expect(params.get('checkOut')).toBe('2026-08-15')
  })

  it('construit directement l’URL de recherche pour la ville sélectionnée', () => {
    const href = buildApartmentSearchHref({ city: 'Lyon', guests: 2 })

    expect(href).toBe('/appartements?city=lyon&guests=2')
  })
})
