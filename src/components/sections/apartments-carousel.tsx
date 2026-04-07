'use client'

import { useRef, useState } from 'react'
import { ApartmentCard } from '@/components/ui/apartment-card'
import { Chip } from '@/components/ui/chip'
import { Button } from '@/components/ui/button'

interface Apartment {
  name: string
  price: number
  guests: number
  surface: number
  bedrooms: number
  slug: string
  image?: string
}

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'marais', label: 'Le Marais' },
  { id: 'saint-germain', label: 'Saint-Germain' },
  { id: 'opera', label: 'Opera' },
]

const QUARTIER_MAP: Record<string, string> = {
  'le-faubourg': 'marais',
  'le-marais': 'marais',
  'l-opera': 'opera',
  'le-saint-germain': 'saint-germain',
}

export function ApartmentsCarousel({ apartments }: { apartments: Apartment[] }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const trackRef = useRef<HTMLDivElement>(null)

  const filtered = activeFilter === 'all'
    ? apartments
    : apartments.filter((apt) => QUARTIER_MAP[apt.slug] === activeFilter)

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return
    const cardWidth = track.querySelector('[data-card]')?.clientWidth ?? 300
    const gap = 12
    const distance = cardWidth + gap
    track.scrollBy({ left: direction === 'right' ? distance : -distance, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-coffee text-2xl leading-[1.3] font-bold tracking-[-0.48px] md:text-4xl md:tracking-[-0.72px]">
          Nos appartements
        </h2>

        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <Chip
              key={f.id}
              variant={activeFilter === f.id ? 'active' : 'default'}
              onPress={() => setActiveFilter(f.id)}
            >
              {f.label}
            </Chip>
          ))}
          <Button href="/appartements" className="hidden md:flex">
            Voir tout
          </Button>
        </div>
      </div>

      <div className="relative mt-10">
        <button
          type="button"
          onClick={() => scroll('left')}
          className="bg-cream/90 text-coffee absolute -left-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-opacity hover:opacity-80 md:flex"
          aria-label="Précédent"
        >
          <ArrowLeft />
        </button>

        <div
          ref={trackRef}
          className="-mx-gutter flex snap-x snap-mandatory gap-3 overflow-x-auto px-gutter scrollbar-none md:-mx-0 md:px-0"
        >
          {filtered.map((apt) => (
            <div
              key={apt.slug}
              data-card
              className="w-[280px] shrink-0 snap-start md:w-[calc(25%-9px)]"
            >
              <ApartmentCard {...apt} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll('right')}
          className="bg-cream/90 text-coffee absolute -right-4 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full shadow-md backdrop-blur-sm transition-opacity hover:opacity-80 md:flex"
          aria-label="Suivant"
        >
          <ArrowRight />
        </button>
      </div>
    </div>
  )
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}
