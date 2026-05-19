'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'

type StoryblokBridgeConstructor = new () => {
  on: (events: string[] | string, callback: () => void) => void
}

export function StoryblokBridge() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isEditor =
    pathname.startsWith('/preview') ||
    searchParams.has('_storyblok') ||
    searchParams.has('_storyblok_tk')

  if (!isEditor) return null

  return (
    <Script
      src="https://app.storyblok.com/f/storyblok-v2-latest.js"
      strategy="afterInteractive"
      onLoad={() => {
        const Bridge = window.StoryblokBridge as unknown as StoryblokBridgeConstructor | undefined
        if (!Bridge) return

        const storyblokBridge = new Bridge()
        storyblokBridge.on(['input', 'published', 'change'], () => {
          window.location.reload()
        })
      }}
    />
  )
}
