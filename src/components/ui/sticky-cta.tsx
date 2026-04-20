'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

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
      className={`bg-cream/90 fixed inset-x-0 bottom-0 z-40 border-t border-divider backdrop-blur-md transition-transform duration-500 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-gutter py-3 md:px-gutter-md">
        <div>
          <p className="text-coffee text-sm font-bold">Réservez votre séjour</p>
          <p className="text-taupe text-xs">A partir de 210€/nuit</p>
        </div>
        <Button href="/reserver">Réserver</Button>
      </div>
    </div>
  )
}
