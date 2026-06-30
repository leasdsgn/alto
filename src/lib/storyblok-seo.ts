import type { Metadata } from 'next'
import { assetUrl } from '@/lib/storyblok-asset'
import { getStoryBySlug } from '@/lib/storyblok-page'
import type { InquiryLocale } from '@/types/inquiry'

interface StoryblokBlogSeoContent {
  seo_title?: unknown
  seo_description?: unknown
  og_image?: unknown
  no_index?: unknown
}

export async function getStoryblokBlogMetadata(
  locale: InquiryLocale,
  fallback: Metadata,
): Promise<Metadata> {
  const story = await getStoryBySlug<StoryblokBlogSeoContent>('blog/index', locale)
  const content = story?.content
  if (!content) return fallback

  const title = stringOrNull(content.seo_title) ?? metadataTitleToString(fallback.title)
  const description = stringOrNull(content.seo_description) ?? fallback.description ?? undefined
  const ogImage = assetUrl(content.og_image)
  const noIndex = content.no_index === true

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
