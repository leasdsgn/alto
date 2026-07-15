'use client'

import { createContext, useContext, type ReactNode } from 'react'
import {
  FOOTER_DEFAULTS,
  HEADER_DEFAULTS,
  SHARED_ASSETS_DEFAULTS,
  STICKY_CTA_DEFAULTS,
  type StoryblokGlobals,
} from '@/lib/storyblok-globals-defaults'
import { SHARED_TESTIMONIALS_DEFAULTS } from '@/lib/storyblok-testimonials-defaults'

const StoryblokGlobalsContext = createContext<StoryblokGlobals | null>(null)

interface ProviderProps {
  value: StoryblokGlobals
  children: ReactNode
}

export function StoryblokGlobalsProvider({ value, children }: ProviderProps) {
  return (
    <StoryblokGlobalsContext.Provider value={value}>{children}</StoryblokGlobalsContext.Provider>
  )
}

const FALLBACK_GLOBALS: StoryblokGlobals = {
  header: HEADER_DEFAULTS,
  footer: FOOTER_DEFAULTS,
  stickyCta: STICKY_CTA_DEFAULTS,
  sharedAssets: SHARED_ASSETS_DEFAULTS,
  sharedTestimonials: [...SHARED_TESTIMONIALS_DEFAULTS],
  apartmentFaq: { eyebrow: 'FAQ', title: 'Questions fréquentes', items: [] },
}

export function useStoryblokGlobals(): StoryblokGlobals {
  return useContext(StoryblokGlobalsContext) ?? FALLBACK_GLOBALS
}

export function useHeaderGlobals() {
  return useStoryblokGlobals().header
}

export function useFooterGlobals() {
  return useStoryblokGlobals().footer
}

export function useStickyCtaGlobals() {
  return useStoryblokGlobals().stickyCta
}

export function useSharedAssetsGlobals() {
  return useStoryblokGlobals().sharedAssets
}

export function useSharedTestimonialsGlobals() {
  return useStoryblokGlobals().sharedTestimonials
}

export function useApartmentFaqGlobals() {
  return useStoryblokGlobals().apartmentFaq
}
