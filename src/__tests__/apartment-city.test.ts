import { describe, expect, it } from 'vitest'
import { filterApartmentsByCity, getApartmentCityKey } from '@/lib/apartment-city'

const apartments = [
  { id: 'paris', city: 'Paris', address: 'Rue du Temple, Paris' },
  { id: 'lyon', city: 'Lyon', address: 'Rue d’Algérie, Lyon' },
  { id: 'lyon-address-only', address: '21 Rue d’Algérie, 69001 Lyon, France' },
]

describe('apartment city filtering', () => {
  it('exclut les appartements parisiens du filtre Lyon', () => {
    expect(filterApartmentsByCity(apartments, 'lyon').map((item) => item.id)).toEqual([
      'lyon',
      'lyon-address-only',
    ])
  })

  it('déduit la ville depuis l’adresse lorsque le champ city est absent', () => {
    expect(getApartmentCityKey(apartments[2]!)).toBe('lyon')
  })
})
