'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  'Intérieurs sur mesure',
  'Check-in autonome',
  'Linge et ménage inclus',
  'Réservation sans frais',
]

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const itemsRef = useRef<HTMLLIElement[]>([])
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

    itemsRef.current.forEach((item, i) => {
      if (!item) return
      const check = item.querySelector('svg')
      if (!check) return

      gsap.fromTo(
        check,
        { strokeDashoffset: 20 },
        {
          strokeDashoffset: 0,
          duration: 0.6,
          delay: i * 0.15,
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          },
        },
      )
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section || itemsRef.current.includes(t.trigger as HTMLLIElement)) t.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-silver">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-6 px-gutter py-section md:px-gutter-md lg:grid-cols-[1fr_380px]">
        <div
          ref={imageRef}
          className="relative h-[280px] overflow-hidden rounded-lg bg-[url('/images/alto-salon.jpg')] bg-cover bg-center md:h-[441px]"
        >
          <div className="bg-coffee/10 absolute inset-0 rounded-lg" />
        </div>

        <div className="bg-coffee flex flex-col justify-center rounded-lg p-8 md:p-10">
          <p className="text-cream/40 text-xs font-bold tracking-[0.24px] uppercase">Nos services</p>

          <h2 className="text-cream mt-4 text-xl leading-[1.4] font-bold tracking-[-0.4px] md:text-h5 md:tracking-[-0.44px]">
            Chez soi, comme à l'hôtel.
          </h2>

          <ul className="mt-8 flex flex-col gap-4">
            {SERVICES.map((service, i) => (
              <li
                key={service}
                ref={(el) => { if (el) itemsRef.current[i] = el }}
                className="flex items-center gap-3"
              >
                <div className="border-cream/20 flex size-5 shrink-0 items-center justify-center rounded-full border">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="#fffff8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ strokeDasharray: 20, strokeDashoffset: 20 }}
                  >
                    <path d="M2 5.5L4 7.5L8 3" />
                  </svg>
                </div>
                <span className="text-cream text-sm leading-[1.5]">{service}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="mt-10 w-fit">
            En savoir plus
          </Button>
        </div>
      </div>
    </section>
  )
}
