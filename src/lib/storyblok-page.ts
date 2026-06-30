import { cache } from 'react'
import { DEFAULT_LOCALE } from '@/lib/i18n/locale'
import {
  getStoryblokToken,
  getStoryblokVersion,
  type StoryblokVersion,
} from '@/lib/storyblok-preview'
import { type InquiryLocale } from '@/types/inquiry'

export interface StoryblokStory<T = Record<string, unknown>> {
  id: number
  name: string
  slug: string
  full_slug: string
  content: T
  uuid?: string
}

interface StoryblokStoryResponse<T = Record<string, unknown>> {
  story?: StoryblokStory<T>
}

const STORYBLOK_BASE_URL = 'https://api.storyblok.com/v2/cdn/stories'

export const getStoryBySlug = cache(
  async <T = Record<string, unknown>>(
    slug: string,
    locale: InquiryLocale = DEFAULT_LOCALE,
    versionOverride?: StoryblokVersion,
  ): Promise<StoryblokStory<T> | null> => {
    const version = versionOverride ?? (await getStoryblokVersion())
    const token = getStoryblokToken(version)
    if (!token) return null

    const params = new URLSearchParams({
      token,
      version,
      language: locale,
      fallback_lang: DEFAULT_LOCALE,
      resolve_links: 'url',
    })

    const url = `${STORYBLOK_BASE_URL}/${stripLeadingSlash(slug)}?${params}`
    const response = await fetch(url, {
      next: { revalidate: version === 'draft' ? 0 : 300, tags: [`storyblok:${slug}`] },
    }).catch(() => null)

    if (!response?.ok) return null

    const data = (await response.json()) as StoryblokStoryResponse<T>
    return data.story ?? null
  },
)

function stripLeadingSlash(value: string) {
  return value.startsWith('/') ? value.slice(1) : value
}
