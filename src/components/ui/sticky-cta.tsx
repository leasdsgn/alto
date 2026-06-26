'use client'

import { useEffect, useState } from 'react'
import { useStickyCtaGlobals } from '@/components/providers/storyblok-globals-provider'
import { SearchBar } from '@/components/ui/search-bar'
import { SearchBarMobile } from '@/components/ui/search-bar-mobile'

export function StickyCta() {
  const { enabled, thresholdVh } = useStickyCtaGlobals()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const ratio = Math.max(0, Math.min(100, thresholdVh)) / 100
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * ratio)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [enabled, thresholdVh])

  if (!enabled) return null

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-cream/95 backdrop-blur-md transition-transform duration-500 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto w-full max-w-[900px] px-4 py-3 md:px-gutter-md md:py-4">
        <div className="md:hidden">
          <SearchBarMobile calendarPlacement="top" />
        </div>
        <div className="hidden md:block">
          <SearchBar calendarPlacement="top start" />
        </div>
      </div>
    </div>
  )
}
