import { describe, expect, it } from 'vitest'
import {
  buildApartmentSearchHref,
  buildApartmentSearchParams,
  filterApartmentsByGuestCapacity,
} from '@/lib/apartment-search'

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

  it('conserve uniquement les appartements compatibles avec le nombre de voyageurs', () => {
    const apartments = [
      { id: 'studio', guests: 2 },
      { id: 'family', guests: 4 },
      { id: 'large', guests: 6 },
    ]

    expect(filterApartmentsByGuestCapacity(apartments, 4)).toEqual([
      { id: 'family', guests: 4 },
      { id: 'large', guests: 6 },
    ])
  })

  it('ignore un nombre de voyageurs absent ou invalide', () => {
    const apartments = [{ id: 'studio', guests: 2 }]

    expect(filterApartmentsByGuestCapacity(apartments)).toBe(apartments)
    expect(filterApartmentsByGuestCapacity(apartments, Number.NaN)).toBe(apartments)
  })
})
