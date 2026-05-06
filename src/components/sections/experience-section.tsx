'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'

gsap.registerPlugin(ScrollTrigger)

interface ExperienceSectionProps {
  panelImages: {
    arrival: string
    checkin: string
    checkout: string
  }
}

export function ExperienceSection({ panelImages }: ExperienceSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const panels = [
    {
      title: 'Arrivée',
      description: 'Un quartier vivant, une adresse au cœur des plus beaux quartiers.',
      image: panelImages.arrival,
    },
    {
      title: 'Checkin',
      description: 'Accès autonome et gestionnaire joignable 24h/24 et 7j/7.',
      image: panelImages.checkin,
    },
    {
      title: 'Checkout',
      description: 'Départ flexible, sans formalités. Laissez les clés, on s’occupe du reste.',
      image: panelImages.checkout,
    },
  ]

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    const section = sectionRef.current
    const track = trackRef.current
    const wrapper = track?.parentElement
    if (!section || !track || !wrapper) return

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - wrapper.clientWidth)

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'center center',
          end: () => `+=${distance()}`,
          pin: true,
          pinType: 'transform',
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      ScrollTrigger.refresh()
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-section md:h-screen md:overflow-hidden md:py-0">
      <div className="mx-auto flex max-w-content items-stretch px-4 md:h-full md:items-center md:px-gutter-md">
        <div
          ref={trackRef}
          className="flex w-full flex-col gap-3 md:flex-row md:items-stretch md:gap-4 md:will-change-transform"
        >
          <div className="bg-taupe flex h-[420px] w-full shrink-0 flex-col justify-between rounded-xl px-5 py-4 md:h-[598px] md:w-[396px] md:px-6 md:py-5">
            <p className="text-silver text-overline font-bold uppercase tracking-[0.24px]">
              À PROPOS
            </p>
            <div className="flex flex-col gap-6 md:gap-8">
              <p className="text-cream text-body-xl leading-[1.5] font-semibold">
                Chaque espace Alto propose une expérience fluide&nbsp;: un séjour
                où le confort, la lumière, l&rsquo;autonomie et le soin silencieux
                se conjuguent naturellement.
              </p>
              <Button variant="primary" size="regular" href="/notre-histoire" iconRight={<ArrowOutward />} className="self-start">
                En savoir plus
              </Button>
            </div>
          </div>

          {panels.map((panel) => (
            <div
              key={panel.title}
              className="relative h-[420px] w-full shrink-0 overflow-hidden rounded-xl md:h-[598px] md:w-[396px]"
            >
              <Image
                src={panel.image}
                alt={panel.title}
                fill
                sizes="(max-width: 768px) 100vw, 396px"
                quality={85}
                className="object-cover"
              />
              <div className="bg-taupe/80 absolute inset-0 mix-blend-multiply" />
              <div className="absolute inset-0 flex flex-col justify-between px-5 py-4 md:px-6 md:py-5">
                <h3 className="text-[#fffff8] text-h4 font-medium tracking-[-0.24px]">
                  {panel.title}
                </h3>
                <p className="text-[#fffff8] text-body-xl font-semibold leading-[1.5]">
                  {panel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowOutward() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11 11 3M11 3H5M11 3v6" />
    </svg>
  )
}
