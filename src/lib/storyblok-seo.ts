import type { Metadata } from 'next'
import { assetUrl } from '@/lib/storyblok-asset'
import { getStoryBySlug, type StoryblokStory } from '@/lib/storyblok-page'
import type { InquiryLocale } from '@/types/inquiry'

interface StoryblokSeoContent {
  seo?: unknown
}

interface StoryblokSeoBlok {
  title?: unknown
  description?: unknown
  og_image?: unknown
  no_index?: unknown
}

export async function getStoryblokPageMetadata(
  slug: string,
  locale: InquiryLocale,
  fallback: Metadata,
): Promise<Metadata> {
  const story = await getStoryBySlug<StoryblokSeoContent>(slug, locale)
  return storyblokSeoToMetadata(story, fallback)
}

export function storyblokSeoToMetadata(
  story: StoryblokStory<StoryblokSeoContent> | null,
  fallback: Metadata,
): Metadata {
  const seo = firstSeoBlok(story?.content?.seo)
  if (!seo) return fallback

  const title = stringOrNull(seo.title) ?? metadataTitleToString(fallback.title)
  const description = stringOrNull(seo.description) ?? fallback.description ?? undefined
  const ogImage = assetUrl(seo.og_image)
  const noIndex = seo.no_index === true

  return {
    ...fallback,
    title,
    description,
    openGraph: {
      ...fallback.openGraph,
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : fallback.openGraph?.images,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : fallback.robots,
  }
}

function firstSeoBlok(value: unknown): StoryblokSeoBlok | null {
  if (!Array.isArray(value)) return null
  const seo = value.find(isRecord)
  return seo ?? null
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function metadataTitleToString(value: Metadata['title']): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if ('default' in value && value.default) return value.default
  if ('absolute' in value && value.absolute) return value.absolute
  return undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
