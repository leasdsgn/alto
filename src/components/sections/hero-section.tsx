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
}

export function HeroSection({ backgroundImage, overlayImage }: HeroSectionProps) {
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
      <div
        ref={bgRef}
        className="absolute inset-0"
      >
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

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 pb-28 pt-28 md:pb-36 md:pt-36">
        <div className="w-full max-w-[1212px] md:-translate-y-6">
          <h1 className="text-cream flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center text-2xl leading-none font-medium tracking-[0.12em] uppercase md:gap-x-8 md:text-h1 md:tracking-[0.16em]">
            <span>LIFTED</span>
            <span aria-hidden="true" className="bg-cream size-2 rounded-full md:size-2.5" />
            <span>MINDFUL</span>
            <span aria-hidden="true" className="bg-cream size-2 rounded-full md:size-2.5" />
            <span>HOME</span>
          </h1>
        </div>

        <div className="absolute inset-x-6 bottom-8 mx-auto hidden max-w-[800px] md:block md:bottom-12">
          <SearchBar />
        </div>

        <div className="absolute inset-x-6 bottom-8 md:hidden">
          <SearchBarMobile />
        </div>
      </div>
    </section>
  )
}
