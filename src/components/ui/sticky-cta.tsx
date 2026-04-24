'use client'

import { useEffect, useState } from 'react'
import { SearchBar } from '@/components/ui/search-bar'

export function StickyCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-divider bg-cream/95 backdrop-blur-md transition-transform duration-500 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto w-full max-w-[900px] px-gutter py-4 md:px-gutter-md">
        <SearchBar calendarPlacement="top start" />
      </div>
    </div>
  )
}
