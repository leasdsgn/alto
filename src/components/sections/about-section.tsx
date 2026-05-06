'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PLATFORM_LOGOS = [
  { name: 'Booking', bg: 'bg-[#003580]', label: 'B.' },
  { name: 'Tripadvisor', bg: 'bg-[#00af87]', label: 'TA' },
  { name: 'Airbnb', bg: 'bg-[#ff5a5f]', label: 'A' },
]

interface AboutSectionProps {
  locationAvatars: readonly string[]
  travelerAvatars: readonly string[]
}

export function AboutSection({ locationAvatars, travelerAvatars }: AboutSectionProps) {
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
      className="bg-gradient-to-r from-silver to-taupe py-section md:py-section-md"
    >
      <div className="mx-auto max-w-content px-gutter md:px-gutter-md">
        <p className="text-cream text-center text-body leading-[1.5]">
          Alto, c&rsquo;est une nouvelle manière de penser l&rsquo;hospitalité.
        </p>

        <p
          ref={quoteRef}
          className="text-cream mt-8 text-center text-xl leading-[1.3] font-bold tracking-[-0.58px] md:text-[29px]"
        >
          Nous transformons des espaces singuliers en lieux de vie élégants,
          bien pensés et confortables. Notre mission&nbsp;: permettre aux
          voyageurs de vivre des séjours sans frictions aux plus belles adresses.
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
            <StatLabel>13 locations</StatLabel>
          </StatCard>

          <StatCard>
            <ClusterAvatars>
              {travelerAvatars.map((src, i) => (
                <AvatarImage key={i} src={src} alt="" />
              ))}
            </ClusterAvatars>
            <StatLabel>4 500+ voyageurs</StatLabel>
          </StatCard>

          <StatCard>
            <ClusterAvatars>
              {PLATFORM_LOGOS.map((p) => (
                <AvatarCircle key={p.name} bg={p.bg} label={p.label} aria-label={p.name} />
              ))}
            </ClusterAvatars>
            <StatLabel>4,9 de note moyenne</StatLabel>
          </StatCard>
        </div>
      </div>
    </section>
  )
}

function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-taupe flex h-[109px] w-[250px] shrink-0 flex-col items-center justify-center gap-3 rounded-xl">
      {children}
    </div>
  )
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[#fffff8] text-body-xl font-semibold leading-none">
      {children}
    </span>
  )
}

function ClusterAvatars({ children }: { children: React.ReactNode }) {
  return <div className="flex -space-x-[18px]">{children}</div>
}

function AvatarCircle({ bg, label, ...rest }: { bg: string; label: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`${bg} text-cream flex size-[35px] items-center justify-center rounded-full text-[11px] font-bold uppercase`}
    >
      {label}
    </div>
  )
}

function AvatarImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative size-[35px] overflow-hidden rounded-full">
      <Image src={src} alt={alt} fill sizes="35px" className="object-cover" />
    </div>
  )
}
