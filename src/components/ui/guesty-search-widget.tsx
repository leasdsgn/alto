'use client'

import { useEffect, useRef } from 'react'

interface GuestySearchWidgetProps {
  siteUrl?: string
  color?: string
}

export function GuestySearchWidget({
  siteUrl = 'mayeuldesombre.guestybookings.com',
  color = '#206CFF',
}: GuestySearchWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const loadWidget = () => {
      const config = { siteUrl, color }

      // Charger le CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href =
        'https://s3.amazonaws.com/guesty-frontend-production/search-bar-production.css'
      link.media = 'all'
      document.head.appendChild(link)

      // Charger le script
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src =
        'https://s3.amazonaws.com/guesty-frontend-production/search-bar-production.js'
      script.async = true
      script.onload = () => {
        try {
          const w = window as typeof window & {
            GuestySearchBarWidget?: {
              create: (config: typeof config) => Promise<void>
            }
          }
          if (w.GuestySearchBarWidget) {
            w.GuestySearchBarWidget.create(config).catch((err: Error) => {
              console.log('[Guesty Embedded Widget]:', err.message)
            })
          }
        } catch (err) {
          console.log('[Guesty Embedded Widget]:', (err as Error).message)
        }
      }
      document.body.appendChild(script)
    }

    loadWidget()
  }, [siteUrl, color])

  return (
    <div
      ref={containerRef}
      id="guesty-search-widget"
      className="w-full py-12"
    />
  )
}
