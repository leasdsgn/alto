'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { getApartmentsForSearch } from '@/components/sections/apartments-section'

gsap.registerPlugin(ScrollTrigger)

type LyonApartment = Awaited<ReturnType<typeof getApartmentsForSearch>>[number]

interface LyonApartmentsSectionProps {
  apartments: LyonApartment[]
}

export function LyonApartmentsSection({ apartments }: LyonApartmentsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    const cards = cardsRef.current
    if (!section || !cards) return

    gsap.fromTo(
      cards.children,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
        },
      },
    )

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="mx-auto max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
      <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Les appartements</p>
      <h2 className="text-coffee mt-1 text-base font-medium">Nos appartements à Lyon</h2>

      <div ref={cardsRef} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {apartments.map((apt) => (
          <div key={apt.id} className="group">
            <div className="relative aspect-[304/331] overflow-hidden rounded-lg">
              <Image
                src={apt.images[0] || '/images/lyon/apt-bellecour.jpg'}
                alt={apt.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-coffee text-base font-bold">{apt.name}</h3>
                <p className="text-coffee text-xs font-medium">{getLocationLabel(apt)}</p>
              </div>
              <p className="text-silver text-xs font-bold uppercase">
                {isDisplayablePrice(apt.price) ? `Dès ${apt.price}€/nuit` : 'Voir disponibilités'}
              </p>
            </div>

            <div className="text-ash mt-2 flex items-center gap-4 text-xs font-extrabold">
              <span className="flex items-center gap-1">
                <svg width="18" height="13" viewBox="0 0 18 13" fill="none" className="text-ash">
                  <path d="M1 6.5C1 6.5 4 1 9 1C14 1 17 6.5 17 6.5C17 6.5 14 12 9 12C4 12 1 6.5 1 6.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                {apt.guests}p.
              </span>
              <span className="flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-ash">
                  <rect x="1" y="1" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M1 5H12M5 1V12" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                {getSecondaryMetric(apt)}
              </span>
            </div>

            <Link
              href={`/appartements/${apt.slug}`}
              prefetch={false}
              className="bg-coffee text-cream mt-4 inline-flex w-full items-center justify-center rounded-sm px-6 py-2.5 text-xs font-normal md:w-auto"
            >
              Voir
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

function getLocationLabel(apartment: LyonApartment) {
  const neighborhood = apartment.neighborhoodLabel
  if (neighborhood) return neighborhood

  const addressStart = apartment.address?.split(',')[0]?.trim()
  if (addressStart) return addressStart

  return apartment.city || 'Lyon'
}

function getSecondaryMetric(apartment: LyonApartment) {
  if (apartment.surface > 0) return `${apartment.surface}m²`
  if (apartment.bedrooms > 0) return `${apartment.bedrooms} ch.`
  if (apartment.bathrooms > 0) return `${apartment.bathrooms} sdb`
  return 'Alto'
}

function isDisplayablePrice(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
