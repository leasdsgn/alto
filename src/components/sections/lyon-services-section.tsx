'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  { icon: 'construction', label: 'Appartements restaurés' },
  { icon: 'key', label: 'Check-in autonome' },
  { icon: 'cleaning', label: 'Linge et ménage inclus' },
  { icon: 'calendar', label: 'Réservation sans frais' },
]

function ServiceIcon({ type }: { type: string }) {
  switch (type) {
    case 'construction':
      return (
        <svg width="12" height="11" viewBox="0 0 12 11" fill="none" className="text-cream">
          <path d="M1 10H11M2.5 10V6M5.5 10V6M6.5 10V6M9.5 10V6M1 6L6 1L11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    case 'key':
      return (
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-cream">
          <circle cx="3" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5.5 4H13M11 2V6M13 2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )
    case 'cleaning':
      return (
        <svg width="5" height="11" viewBox="0 0 5 11" fill="none" className="text-cream">
          <path d="M2.5 1V10M1 3.5H4M1 6.5H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )
    case 'calendar':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-cream">
          <rect x="1" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M1 5H11M4 1V3M8 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M4 7.5L5.5 9L8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    default:
      return null
  }
}

export function LyonServicesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLLIElement[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    const image = imageRef.current
    if (!section) return

    if (image) {
      gsap.fromTo(
        image,
        { clipPath: 'inset(10% 10% 10% 10% round 12px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 12px)',
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 30%',
            scrub: true,
          },
        },
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-silver">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-8 px-gutter py-section md:grid-cols-[1fr_1fr] md:px-gutter-md md:py-section-md lg:grid-cols-[304px_1fr]">
        {/* Image */}
        <div
          ref={imageRef}
          className="relative aspect-[304/412] overflow-hidden rounded-lg"
        >
          <Image
            src="/images/lyon/services-image.jpg"
            alt="Intérieur Alto"
            fill
            sizes="(max-width: 768px) 100vw, 304px"
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center">
          <p className="text-cream text-xs font-bold uppercase tracking-[0.24px]">Nos services</p>
          <h2 className="text-cream mt-1 text-base font-medium">Chez soi, comme à l'hôtel</h2>

          <ul className="mt-8 flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-x-12 md:gap-y-4">
            {SERVICES.map((service, i) => (
              <li
                key={service.label}
                ref={(el) => { if (el) itemsRef.current[i] = el }}
                className="flex items-center gap-3"
              >
                <ServiceIcon type={service.icon} />
                <span className="text-cream text-xs font-medium">{service.label}</span>
              </li>
            ))}
          </ul>

          <p className="text-cream/80 mt-8 text-xs leading-relaxed">
            Un parquet qui craque doucement.
            <br />
            Un linge soigné.
            <br />
            Un quartier qu'on apprend à connaître.
          </p>

          <Link
            href="#disponibilites"
            className="text-cream mt-8 inline-flex w-fit items-center gap-2 text-xs font-normal"
          >
            Réserver
            <span className="bg-cream/40 h-px w-12" />
          </Link>
        </div>
      </div>
    </section>
  )
}
