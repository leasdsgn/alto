'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LYON_APARTMENTS = [
  {
    id: 'bellecour',
    name: 'Bellecour',
    arrondissement: '2e arr.',
    price: 280,
    guests: 4,
    surface: 80,
    image: '/images/lyon/apt-bellecour.jpg',
    slug: 'constantine-i',
  },
  {
    id: 'vieux-lyon',
    name: 'Vieux Lyon',
    arrondissement: '5e arr.',
    price: 210,
    guests: 2,
    surface: 45,
    image: '/images/lyon/apt-vieux-lyon.jpg',
    slug: 'terreaux-i',
  },
  {
    id: 'terreaux',
    name: 'Terreaux',
    arrondissement: '1e arr.',
    price: 240,
    guests: 2,
    surface: 55,
    image: '/images/lyon/apt-terreaux.jpg',
    slug: 'terreaux-ii',
  },
]

export function LyonApartmentsSection() {
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
        {LYON_APARTMENTS.map((apt) => (
          <div key={apt.id} className="group">
            <div className="relative aspect-[304/331] overflow-hidden rounded-lg">
              <Image
                src={apt.image}
                alt={apt.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="mt-4 flex items-start justify-between">
              <div>
                <h3 className="text-coffee text-base font-bold">{apt.name}</h3>
                <p className="text-coffee text-xs font-medium">{apt.arrondissement}</p>
              </div>
              <p className="text-silver text-xs font-bold uppercase">{apt.price}€/nuit</p>
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
                {apt.surface}m²
              </span>
            </div>

            <Link
              href={`/appartements/${apt.slug}`}
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
