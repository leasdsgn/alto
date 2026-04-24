'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.18,
      duration: 0.8,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      smoothWheel: true,
      syncTouch: false,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)
    ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: false })

    gsap.ticker.lagSmoothing(0)
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
