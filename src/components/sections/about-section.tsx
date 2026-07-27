'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLocale } from '@/components/providers/locale-provider'
import { BrandKickerText } from '@/components/ui/brand-kicker-text'

gsap.registerPlugin(ScrollTrigger)

interface AboutSectionProps {
  locationAvatars: readonly string[]
  travelerAvatars: readonly string[]
  copy?: AboutSectionCopy
}

type AboutSectionCopy = {
  kicker: string
  quote: string
  locations: string
  travelers: string
}

export function AboutSection({
  locationAvatars,
  travelerAvatars,
  copy: copyOverride,
}: AboutSectionProps) {
  const locale = useLocale()
  const copy = copyOverride ?? ABOUT_COPY[locale]
  const sectionRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLParagraphElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const quote = quoteRef.current
    const stats = statsRef.current
    if (!quote || !stats) return

    gsap.fromTo(
      quote,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: quote, start: 'top 82%' },
      },
    )

    gsap.fromTo(
      stats.children,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: stats, start: 'top 85%' },
      },
    )

    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section
      ref={sectionRef}
      className="from-silver to-taupe py-section md:py-section-md bg-gradient-to-r"
    >
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
        <p className="text-cream text-body text-center leading-[1.5]">
          <BrandKickerText value={copy.kicker} />
        </p>

        <p
          ref={quoteRef}
          className="text-cream mt-8 text-center text-xl leading-[1.3] font-bold tracking-[-0.58px] md:text-[29px]"
        >
          {copy.quote}
        </p>

        <div
          ref={statsRef}
          className="mt-12 flex flex-col items-center gap-3 md:flex-row md:flex-wrap md:justify-center md:gap-4"
        >
          <StatCard>
            <ClusterAvatars>
              {locationAvatars.map((src, i) => (
                <AvatarImage key={i} src={src} alt="" />
              ))}
            </ClusterAvatars>
            <StatLabel>{copy.locations}</StatLabel>
          </StatCard>

          <StatCard>
            <ClusterAvatars>
              {travelerAvatars.map((src, i) => (
                <AvatarImage key={i} src={src} alt="" />
              ))}
            </ClusterAvatars>
            <StatLabel>{copy.travelers}</StatLabel>
          </StatCard>
        </div>
      </div>
    </section>
  )
}

const ABOUT_COPY = {
  fr: {
    kicker: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
    quote:
      'Nous transformons des espaces singuliers en lieux de vie élégants, bien pensés et confortables. Notre mission : permettre aux voyageurs de vivre des séjours sans frictions aux plus belles adresses.',
    locations: '13 locations',
    travelers: '4 500+ voyageurs',
  },
  en: {
    kicker: 'Alto is a new way to think about hospitality.',
    quote:
      'We turn distinctive spaces into elegant, considered, and comfortable places to live. Our mission: helping travelers enjoy clear, easy stays at carefully selected addresses.',
    locations: '13 locations',
    travelers: '4,500+ guests',
  },
} as const

function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-taupe flex h-[109px] w-[250px] shrink-0 flex-col items-center justify-center gap-3 rounded-xl">
      {children}
    </div>
  )
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-body-xl leading-none font-semibold text-[#fffff8]">{children}</span>
}

function ClusterAvatars({ children }: { children: React.ReactNode }) {
  return <div className="flex -space-x-[18px]">{children}</div>
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative size-[35px] overflow-hidden rounded-full">
      <Image src={src} alt={alt} fill sizes="35px" className="object-cover" />
    </div>
  )
}
