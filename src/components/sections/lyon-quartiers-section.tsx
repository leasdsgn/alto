'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LYON_QUARTIERS = [
  {
    id: 'bellecour',
    name: 'Bellecour',
    arrondissement: '2e arr.',
    image: '/images/lyon/apt-bellecour.jpg',
  },
  {
    id: 'vieux-lyon',
    name: 'Vieux Lyon',
    arrondissement: '5e arr.',
    image: '/images/lyon/apt-vieux-lyon.jpg',
  },
  {
    id: 'terreaux',
    name: 'Terreaux',
    arrondissement: '1e arr.',
    image: '/images/lyon/apt-terreaux.jpg',
  },
]

const TESTIMONIAL = {
  quote: '"Le Terreaux est vibrant et raffiné à la fois. Tout se fait à pied, entre culture, gastronomie et lumière dorée en fin de journée."',
  author: 'Camille & Arthur - Bruxelles',
}

export function LyonQuartiersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeIndex, setActiveIndex] = useState(1)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    if (!section) return

    gsap.fromTo(
      section.querySelectorAll('.quartier-card'),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
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

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? LYON_QUARTIERS.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setActiveIndex((prev) => (prev === LYON_QUARTIERS.length - 1 ? 0 : prev + 1))
  }

  return (
    <section ref={sectionRef} className="mx-auto max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
      <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Les quartiers</p>
      <h2 className="text-coffee mt-1 text-base font-medium">Choisir son quartier</h2>

      {/* Desktop: 3 cards */}
      <div className="mt-10 hidden gap-4 md:flex">
        {LYON_QUARTIERS.map((quartier, index) => (
          <Link
            key={quartier.id}
            href={`/quartiers/${quartier.id}`}
            className={`quartier-card group relative overflow-hidden rounded-lg transition-all duration-500 ${
              index === 1 ? 'h-[429px] flex-[1.3]' : 'h-[331px] flex-1 self-center'
            }`}
          >
            <Image
              src={quartier.image}
              alt={quartier.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-coffee/80 to-transparent" />
            <div className="absolute bottom-4 left-4 text-cream">
              <h3 className="text-base font-bold">{quartier.name}</h3>
              <p className="text-xs font-medium">{quartier.arrondissement}</p>
            </div>
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              className="text-cream absolute bottom-5 right-4 rotate-90"
            >
              <path d="M1 7L7 1M7 1H2M7 1V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* Mobile: Carousel */}
      <div className="mt-10 md:hidden">
        <div className="relative aspect-[275/331] overflow-hidden rounded-lg">
          <Image
            src={LYON_QUARTIERS[activeIndex].image}
            alt={LYON_QUARTIERS[activeIndex].name}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-coffee/80 to-transparent" />
          <div className="text-cream absolute bottom-4 left-4">
            <h3 className="text-base font-bold">{LYON_QUARTIERS[activeIndex].name}</h3>
            <p className="text-xs font-medium">{LYON_QUARTIERS[activeIndex].arrondissement}</p>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrev}
            className="text-ash flex size-8 items-center justify-center rounded-full border border-current"
            aria-label="Quartier précédent"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {LYON_QUARTIERS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`size-2 rounded-full transition-colors ${
                  i === activeIndex ? 'bg-coffee' : 'bg-silver'
                }`}
                aria-label={`Aller au quartier ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goToNext}
            className="text-ash flex size-8 items-center justify-center rounded-full border border-current"
            aria-label="Quartier suivant"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-coffee mt-10 rounded-lg px-6 py-10 text-center md:mt-16 md:py-14">
        <p className="text-cream mx-auto max-w-[600px] text-base font-bold leading-relaxed">
          {TESTIMONIAL.quote}
        </p>
        <p className="text-cream/60 mt-4 text-xs">{TESTIMONIAL.author}</p>
      </div>
    </section>
  )
}
