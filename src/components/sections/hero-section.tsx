'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from '@/components/layout/header'
import { SearchBar } from '@/components/ui/search-bar'
import { SearchBarMobile } from '@/components/ui/search-bar-mobile'

gsap.registerPlugin(ScrollTrigger)

export function HeroSection() {
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
      <div
        ref={bgRef}
        className="absolute inset-0 -top-[10%] bottom-0 h-[120%]"
      >
        <Image
          src="/images/hero-home.jpg"
          alt=""
          fill
          sizes="100vw"
          quality={85}
          priority
          className="object-cover"
        />
      </div>
      <div className="bg-coffee/60 absolute inset-0 mix-blend-multiply" />

      <Header />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6">
        <div className="w-full max-w-[800px]">
          <h1 className="text-cream text-center text-3xl leading-[1.25] font-bold tracking-[-0.6px] md:text-[54px] md:tracking-[-1.08px]">
            Lifted Mindful Home
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
