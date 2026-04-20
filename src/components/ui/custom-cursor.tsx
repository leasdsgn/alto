'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const cursor = cursorRef.current
    const follower = followerRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!cursor || !follower || !dot || !ring) return

    let lastElement: Element | null = null

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 })
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3 })

      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || el === lastElement) return
      lastElement = el

      const bg = getEffectiveBg(el as HTMLElement)
      const isDark = isDarkBg(bg)

      dot.style.background = isDark ? '#fffff8' : '#301a0a'
      ring.style.borderColor = isDark ? '#fffff8' : '#301a0a'
    }

    const onEnterInteractive = () => {
      gsap.to(cursor, { scale: 0, duration: 0.2 })
      gsap.to(follower, { scale: 2.5, opacity: 0.15, duration: 0.3 })
    }

    const onLeaveInteractive = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2 })
      gsap.to(follower, { scale: 1, opacity: 0.3, duration: 0.3 })
    }

    document.body.addEventListener('mouseenter', (e) => {
      const target = e.target as HTMLElement
      if (target.matches('a, button, [role="button"], input, select, [data-hover]')) {
        onEnterInteractive()
      }
    }, true)

    document.body.addEventListener('mouseleave', (e) => {
      const target = e.target as HTMLElement
      if (target.matches('a, button, [role="button"], input, select, [data-hover]')) {
        onLeaveInteractive()
      }
    }, true)

    window.addEventListener('mousemove', onMove)

    return () => {
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden md:block"
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        <div ref={dotRef} className="size-2 rounded-full" style={{ background: '#fffff8' }} />
      </div>
      <div
        ref={followerRef}
        className="pointer-events-none fixed top-0 left-0 z-[9997] hidden md:block"
        style={{ transform: 'translate(-50%, -50%)', opacity: 0.3 }}
      >
        <div ref={ringRef} className="size-8 rounded-full border" style={{ borderColor: '#fffff8' }} />
      </div>
    </>
  )
}

function getEffectiveBg(el: HTMLElement): string {
  let current: HTMLElement | null = el
  while (current) {
    const bg = getComputedStyle(current).backgroundColor
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg
    current = current.parentElement
  }
  return 'rgb(255, 255, 248)'
}

function isDarkBg(bg: string): boolean {
  const match = bg.match(/(\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return false
  const [, r, g, b] = match.map(Number)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.5
}
