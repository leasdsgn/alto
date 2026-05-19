import { type ReactNode } from 'react'
import { getStoryblokApi } from '@/lib/storyblok'

interface StoryblokProviderProps {
  children: ReactNode
}

export function StoryblokProvider({ children }: StoryblokProviderProps) {
  getStoryblokApi()

  return <>{children}</>
}
