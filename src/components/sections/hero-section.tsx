'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from '@/components/layout/header'
import { SearchBar } from '@/components/ui/search-bar'
import { SearchBarMobile } from '@/components/ui/search-bar-mobile'

gsap.registerPlugin(ScrollTrigger)

interface HeroSectionProps {
  backgroundImage: string
  overlayImage: string
  titleParts?: readonly [string, string, string]
}

export function HeroSection({
  backgroundImage,
  overlayImage,
  titleParts = ['LIFTED', 'MINDFUL', 'HOME'],
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg) return

    gsap.set(bg, { scale: 1.04 })

    gsap.to(bg, {
      scale: 1,
      yPercent: 4,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative h-svh overflow-hidden">
      <div ref={bgRef} className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt=""
          fill
          sizes="100vw"
          quality={85}
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 opacity-60 mix-blend-multiply">
          <Image
            src={overlayImage}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            priority
            className="object-cover"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-black/25" />

      <Header />

      <div className="relative flex h-full w-full flex-col items-center justify-center px-6 pt-28 pb-28 md:pt-36 md:pb-36">
        <div className="max-w-content w-full md:-translate-y-6">
          <h1 className="sr-only">{titleParts.join(' • ')}</h1>
          <Image
            src="/images/brand/lst-brand-elements-tagline.svg"
            alt=""
            aria-hidden="true"
            width={1920}
            height={83}
            sizes="(max-width: 768px) calc(100vw - 3rem), 1220px"
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="absolute inset-x-6 bottom-8 z-50 mx-auto hidden max-w-[800px] md:bottom-12 md:block">
          <SearchBar calendarPlacement="top start" />
        </div>

        <div className="absolute inset-x-6 bottom-8 z-50 md:hidden">
          <SearchBarMobile />
        </div>
      </div>
    </section>
  )
}
