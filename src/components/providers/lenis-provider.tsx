'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.8,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
    })
    lenisRef.current = lenis

    const raf = (time: number) => {
      lenis.raf(time)
      frameRef.current = requestAnimationFrame(raf)
    }
    frameRef.current = requestAnimationFrame(raf)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      lenis.destroy()
      lenisRef.current = null
      frameRef.current = null
    }
  }, [])

  return <>{children}</>
}
