'use client'

import { useRef } from 'react'
import { ApartmentCard } from '@/components/ui/apartment-card'

interface Apartment {
  name: string
  price: number
  guests: number
  surface: number
  bedrooms: number
  slug: string
  image?: string
  city?: string
  neighborhoodLabel?: string
}

interface ApartmentsCarouselProps {
  apartments: Apartment[]
  title: string
}

export function ApartmentsCarousel({ apartments, title }: ApartmentsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return
    const cardWidth = track.querySelector('[data-card]')?.clientWidth ?? 300
    const gap = 12
    track.scrollBy({ left: direction === 'right' ? cardWidth + gap : -(cardWidth + gap), behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-coffee text-h4 font-medium tracking-[-0.24px]">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="bg-taupe text-cream hidden size-9 items-center justify-center rounded-full transition-opacity hover:opacity-80 md:flex"
            aria-label="Suivant"
          >
            <ArrowRight />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="bg-[#fffff8] text-[#301a0a] border-[#301a0a] flex size-9 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            aria-label="Précédent"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="bg-[#fffff8] text-[#301a0a] border-[#301a0a] flex size-9 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            aria-label="Suivant"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scrollbar-none"
        >
          {apartments.map((apt) => (
            <div
              key={apt.slug}
              data-card
              className="w-[294px] shrink-0 snap-start"
            >
              <ApartmentCard {...apt} neighborhood={apt.neighborhoodLabel} />
            </div>
          ))}
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
