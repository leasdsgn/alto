'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SERVICES = [
  {
    title: 'Self checkin',
    description: 'Accès autonome à toute heure, sans attente ni comptoir.',
    icon: '/images/icons/checkin.svg',
  },
  {
    title: 'Ménage',
    description: 'Linge de maison inclus, ménage professionnel entre chaque séjour.',
    icon: '/images/icons/cleaning.svg',
  },
  {
    title: 'Support 24/24',
    description: 'Un gestionnaire disponible à tout moment pour vous accompagner.',
    icon: '/images/icons/support.svg',
  },
  {
    title: 'Pas de frais cachés',
    description: 'Prix nets, sans surprise. Ce que vous voyez est ce que vous payez.',
    icon: '/images/icons/wallet.svg',
  },
]

export function ServicesSection() {
  const cardsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = cardsRef.current
    if (!cards) return

    gsap.fromTo(
      cards.children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: cards, start: 'top 82%' },
      },
    )

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section className="py-section md:py-section-md">
      <div className="mx-auto max-w-content px-gutter md:px-gutter-md">
        <div
          ref={cardsRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
        >
          {SERVICES.map(({ title, description, icon }) => (
            <div
              key={title}
              className="bg-ash/10 rounded-lg p-8 flex flex-col gap-6"
            >
              <div className="size-10 flex items-center justify-center">
                <Image src={icon} alt="" width={40} height={40} />
              </div>
              <div>
                <h3 className="text-coffee text-body-xl font-semibold">{title}</h3>
                <p className="text-ash mt-2 text-body-sm leading-[1.6]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
