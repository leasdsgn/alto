'use client'

import { type ReactNode } from 'react'
import { storyblokInit, apiPlugin } from '@storyblok/react'

storyblokInit({
  accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  apiOptions: {
    region: 'eu',
  },
})

interface StoryblokProviderProps {
  children: ReactNode
}

export function StoryblokProvider({ children }: StoryblokProviderProps) {
  return <>{children}</>
}
