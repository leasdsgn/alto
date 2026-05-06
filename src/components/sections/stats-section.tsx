'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface StatsSectionProps {
  pressLogo: string
  monocleLogo: string
}

export function StatsSection({ pressLogo, monocleLogo }: StatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    const text = textRef.current
    if (!section || !text) return

    gsap.fromTo(
      text.children,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        },
      },
    )

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-coffee py-16 md:py-24">
      <div ref={textRef} className="mx-auto max-w-content px-gutter text-center md:px-gutter-md">
        <p className="text-cream text-base font-bold leading-relaxed md:text-lg">
          12 appartements soigneusement pensés,
          <br />
          3 villes emblématiques, déjà 480 voyageurs conquis.
        </p>

        <p className="text-cream/60 mt-4 text-xs">
          Une collection intime d'adresses où l'on se sent chez soi, naturellement.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <p className="text-cream/60 text-xs">Vu sur :</p>
          <div className="border-cream/20 h-6 w-px border-l" />
          <Image
            src={pressLogo}
            alt="Presse"
            width={30}
            height={29}
            className="opacity-80"
          />
          <div className="border-cream/20 h-6 w-px border-l" />
          <Image
            src={monocleLogo}
            alt="Monocle"
            width={135}
            height={84}
            className="h-12 w-auto opacity-80"
          />
        </div>
      </div>
    </section>
  )
}
