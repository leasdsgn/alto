'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { ApartmentCard } from '@/components/ui/apartment-card'
import { Chip } from '@/components/ui/chip'

interface Apartment {
  name: string
  price: number
  guests: number
  surface: number
  bedrooms: number
  slug: string
  image?: string
  city?: string
}

const CITY_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'paris', label: 'Paris' },
  { id: 'lyon', label: 'Lyon' },
]

export function ApartmentsCarousel({ apartments }: { apartments: Apartment[] }) {
  const [activeCity, setActiveCity] = useState('all')
  const trackRef = useRef<HTMLDivElement>(null)

  const filtered = apartments.filter((apt) => {
    if (activeCity !== 'all' && apt.city?.toLowerCase() !== activeCity) return false
    return true
  })

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

        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex items-center gap-2">
            {CITY_FILTERS.map((f) => (
              <Chip
                key={f.id}
                variant={activeCity === f.id ? 'active' : 'default'}
                onPress={() => setActiveCity(f.id)}
              >
                {f.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-10">
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
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href="/appartements"
          className="text-coffee border-b border-coffee/40 text-xs font-bold uppercase tracking-[0.24px] transition-opacity hover:opacity-70"
        >
          Voir tout
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="text-coffee flex size-9 items-center justify-center rounded-full border border-coffee/20 transition-colors hover:bg-sand"
            aria-label="Précédent"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="text-coffee flex size-9 items-center justify-center rounded-full border border-coffee/20 transition-colors hover:bg-sand"
            aria-label="Suivant"
          >
            <ArrowRight />
          </button>
        </div>
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
