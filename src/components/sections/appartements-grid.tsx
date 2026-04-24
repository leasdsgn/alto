'use client'

import { useState } from 'react'
import { ApartmentCard } from '@/components/ui/apartment-card'
import { Chip } from '@/components/ui/chip'

interface Apartment {
  id: string
  name: string
  price: number
  guests: number
  surface: number
  bedrooms: number
  slug: string
  images: string[]
  city?: string
}

const CITY_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'paris', label: 'Paris' },
  { id: 'lyon', label: 'Lyon' },
]

const NEIGHBORHOOD_FILTERS: Record<string, { id: string; label: string }[]> = {
  paris: [
    { id: 'marais', label: 'Le Marais' },
    { id: 'saint-germain', label: 'Saint-Germain' },
    { id: 'opera', label: 'Opéra' },
  ],
  lyon: [
    { id: 'presquile', label: 'Presqu\'île' },
    { id: 'confluence', label: 'Confluence' },
    { id: 'croix-rousse', label: 'Croix-Rousse' },
  ],
}

const QUARTIER_MAP: Record<string, string> = {
  'le-faubourg': 'marais',
  'le-marais': 'marais',
  'l-opera': 'opera',
  'le-saint-germain': 'saint-germain',
}

export function AppartementsGrid({ apartments }: { apartments: Apartment[] }) {
  const [activeCity, setActiveCity] = useState('all')
  const [activeNeighborhood, setActiveNeighborhood] = useState<string | null>(null)

  const neighborhoods = activeCity !== 'all' ? (NEIGHBORHOOD_FILTERS[activeCity] ?? []) : []

  const filtered = apartments.filter((apt) => {
    if (activeCity !== 'all' && apt.city?.toLowerCase() !== activeCity) return false
    if (activeNeighborhood && QUARTIER_MAP[apt.slug] !== activeNeighborhood) return false
    return true
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">
          {filtered.length} appartement{filtered.length > 1 ? 's' : ''}
        </p>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {CITY_FILTERS.map((f) => (
              <Chip
                key={f.id}
                variant={activeCity === f.id ? 'active' : 'default'}
                onPress={() => { setActiveCity(f.id); setActiveNeighborhood(null) }}
              >
                {f.label}
              </Chip>
            ))}
          </div>
          <div className={`grid transition-all duration-300 ease-in-out ${neighborhoods.length > 0 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 pb-0.5">
                {neighborhoods.map((n) => (
                  <Chip
                    key={n.id}
                    variant={activeNeighborhood === n.id ? 'active' : 'default'}
                    onPress={() => setActiveNeighborhood(activeNeighborhood === n.id ? null : n.id)}
                  >
                    {n.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-xl border border-divider/60 bg-cream/60 p-10 text-center">
          <p className="text-coffee text-sm font-semibold">Aucun appartement disponible</p>
          <p className="text-taupe mt-2 text-xs">Essayez d'élargir vos dates ou de changer de ville.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((apt) => (
            <ApartmentCard
              key={apt.id}
              name={apt.name}
              price={apt.price}
              guests={apt.guests}
              surface={apt.surface}
              bedrooms={apt.bedrooms}
              slug={apt.slug}
              image={apt.images[0]}
            />
          ))}
        </div>
      )}
    </>
  )
}
