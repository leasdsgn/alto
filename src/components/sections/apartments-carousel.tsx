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
  const showControls = apartments.length > 4

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return
    const scrollAmount = track.clientWidth
    track.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-coffee text-h4 font-medium tracking-[-0.24px]">{title}</h2>
        <div className={`hidden items-center gap-2 md:flex ${showControls ? '' : 'md:invisible'}`}>
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex size-9 items-center justify-center rounded-full border border-[#301a0a] bg-[#fffff8] text-[#301a0a] transition-opacity hover:opacity-70"
            aria-label="Précédent"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex size-9 items-center justify-center rounded-full border border-[#301a0a] bg-[#fffff8] text-[#301a0a] transition-opacity hover:opacity-70"
            aria-label="Suivant"
          >
            <ArrowRight />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:hidden">
        {apartments.map((apt) => (
          <ApartmentCard key={apt.slug} {...apt} neighborhood={apt.neighborhoodLabel} />
        ))}
      </div>

      <div className="relative hidden md:block">
        <div
          ref={trackRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden"
        >
          {apartments.map((apt) => (
            <div key={apt.slug} data-card className="w-[294px] shrink-0 snap-start">
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
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}
