'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SearchBar } from '@/components/ui/search-bar'
import { SearchBarMobile } from '@/components/ui/search-bar-mobile'

gsap.registerPlugin(ScrollTrigger)

interface LyonHeroSectionProps {
  backgroundImage: string
}

export function LyonHeroSection({ backgroundImage }: LyonHeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg) return

    gsap.set(bg, { scale: 1.15 })

    gsap.to(bg, {
      scale: 1,
      yPercent: 10,
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
      <div ref={bgRef} className="absolute inset-0 -top-[10%] bottom-0 h-[120%]">
        <Image
          src={backgroundImage}
          alt="Vue de Lyon"
          fill
          sizes="100vw"
          quality={85}
          priority
          className="object-cover"
        />
      </div>
      <div className="from-coffee/70 via-coffee/30 absolute inset-0 bg-gradient-to-b to-transparent" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 pt-6 md:px-12">
        <nav className="flex items-center gap-6">
          <Link href="/appartements?city=paris" prefetch={false} className="text-cream text-xs font-bold">
            Paris
          </Link>
          <Link href="/lyon" prefetch={false} className="text-cream text-xs font-bold">
            Lyon
          </Link>
        </nav>

        <Link href="/" prefetch={false} className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/images/logo-alto-light.png"
            alt="Alto"
            width={140}
            height={37}
            priority
            style={{ width: 140, height: 'auto' }}
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/notre-histoire" prefetch={false} className="text-cream hidden text-xs font-bold md:block">
            Notre histoire
          </Link>
          <Link
            href="#disponibilites"
            className="bg-coffee text-cream rounded-sm px-5 py-2.5 text-xs font-bold"
          >
            Réserver
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="relative flex h-full w-full flex-col items-center justify-center px-6">
        <div className="w-full max-w-[500px] text-center">
          <p className="text-cream text-xs font-bold tracking-[0.24px] uppercase">Lyon</p>
          <h1 className="text-cream mt-2 text-lg font-bold md:text-xl">Vivre Lyon autrement.</h1>
          <p className="text-cream/80 mt-3 text-xs leading-relaxed md:text-sm">
            Des appartements soignés, dans les quartiers qui comptent.
          </p>
        </div>

        {/* Search bar desktop */}
        <div className="absolute inset-x-6 bottom-8 z-50 mx-auto hidden max-w-[500px] md:bottom-12 md:block">
          <SearchBar calendarPlacement="top start" />
        </div>

        {/* Search bar mobile */}
        <div className="absolute inset-x-6 bottom-8 z-50 md:hidden">
          <SearchBarMobile />
        </div>
      </div>
    </section>
  )
}
