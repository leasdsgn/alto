'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocale } from '@/components/providers/locale-provider'

gsap.registerPlugin(ScrollTrigger)

interface ServicesSectionProps {
  services?: readonly ServiceItem[]
}

type ServiceItem = {
  title: string
  description: string
  icon: string
  editableAttributes?: EditableAttributes
}

type EditableAttributes = Record<string, string | undefined>

export function ServicesSection({ services: servicesOverride }: ServicesSectionProps = {}) {
  const locale = useLocale()
  const services = (servicesOverride ?? SERVICES_COPY[locale]) as readonly ServiceItem[]
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
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
        <div ref={cardsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {services.map(({ title, description, icon, editableAttributes }) => (
            <div
              key={title}
              {...editableAttributes}
              className="bg-ash/10 flex flex-col gap-6 rounded-lg p-8"
            >
              <div className="flex size-10 items-center justify-center">
                <Image src={icon} alt="" width={40} height={40} style={{ height: 'auto' }} />
              </div>
              <div>
                <h3 className="text-coffee text-body-xl font-semibold">{title}</h3>
                <p className="text-ash text-body-sm mt-2 leading-[1.6]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const SERVICES_COPY = {
  fr: [
    {
      title: 'Self check-in',
      description: 'Accès autonome à toute heure, sans attente ni comptoir.',
      icon: '/images/icons/checkin.svg',
    },
    {
      title: 'Ménage',
      description: 'Linge de maison inclus, ménage professionnel entre chaque séjour.',
      icon: '/images/icons/cleaning.svg',
    },
    {
      title: 'Assistance de 8 h à 20 h',
      description:
        'Notre équipe est disponible tous les jours de 8 h à 20 h pour vous accompagner.',
      icon: '/images/icons/support.svg',
    },
    {
      title: 'Pas de frais cachés',
      description: 'Prix nets, sans surprise. Ce que vous voyez est ce que vous payez.',
      icon: '/images/icons/wallet.svg',
    },
  ],
  en: [
    {
      title: 'Self check-in',
      description: 'Independent access at any time, with no waiting or front desk.',
      icon: '/images/icons/checkin.svg',
    },
    {
      title: 'Cleaning',
      description: 'House linen included, with professional cleaning between each stay.',
      icon: '/images/icons/cleaning.svg',
    },
    {
      title: 'Support from 8 am to 8 pm',
      description: 'Our team is available every day from 8 am to 8 pm if you need assistance.',
      icon: '/images/icons/support.svg',
    },
    {
      title: 'No hidden fees',
      description: 'Clear prices, no surprise. What you see is what you pay.',
      icon: '/images/icons/wallet.svg',
    },
  ],
} as const
