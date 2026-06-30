import { getFallbackBlogArticles, inferBlogSection, type BlogArticle } from '@/lib/blog-data'
import { getStoryblokToken, getStoryblokVersion } from '@/lib/storyblok-preview'
import type { InquiryLocale } from '@/types/inquiry'

interface StoryblokStory {
  name: string
  slug: string
  full_slug: string
  first_published_at?: string
  content?: Record<string, unknown>
}

interface StoryblokStoriesResponse {
  stories?: StoryblokStory[]
}

const STORYBLOK_BASE_URL = 'https://api.storyblok.com/v2/cdn/stories'
const STORYBLOK_SOURCES = [
  { startsWith: 'blog/', contentType: 'blog_article' },
  { startsWith: 'blog/', contentType: 'article' },
  { startsWith: 'articles/', contentType: 'article' },
] as const
type StoryblokVersion = 'draft' | 'published'

export async function getBlogArticles(
  locale: InquiryLocale,
  versionOverride?: StoryblokVersion,
): Promise<BlogArticle[]> {
  const articles = await fetchStoryblokArticles(locale, versionOverride)
  return articles.length > 0 ? articles : getFallbackBlogArticles(locale)
}

export async function getBlogArticle(
  slug: string,
  locale: InquiryLocale,
): Promise<BlogArticle | null> {
  const articles = await getBlogArticles(locale)
  return articles.find((article) => article.slug === slug) ?? null
}

async function fetchStoryblokArticles(
  locale: InquiryLocale,
  versionOverride?: StoryblokVersion,
): Promise<BlogArticle[]> {
  const version = versionOverride ?? (await getStoryblokVersion())
  const token = getStoryblokToken(version)
  if (!token) return []

  const responses = await Promise.all(
    STORYBLOK_SOURCES.map(async ({ startsWith, contentType }) => {
      const params = new URLSearchParams({
        token,
        version,
        starts_with: startsWith,
        content_type: contentType,
        language: locale,
        fallback_lang: 'fr',
        per_page: '100',
      })

      const response = await fetch(`${STORYBLOK_BASE_URL}?${params}`, {
        next: { revalidate: 300 },
      }).catch(() => null)

      if (!response?.ok) return []
      const data = (await response.json()) as StoryblokStoriesResponse
      return data.stories ?? []
    }),
  )

  return responses
    .flat()
    .filter((story, index, allStories) => {
      const slug = story.slug || story.full_slug.split('/').at(-1)
      return allStories.findIndex((item) => item.slug === slug) === index
    })
    .map((story) => mapStoryblokArticle(story, locale))
    .filter(Boolean) as BlogArticle[]
}

function mapStoryblokArticle(story: StoryblokStory, locale: InquiryLocale): BlogArticle | null {
  const content = story.content ?? {}
  const title = asString(content.title) ?? story.name
  const slug = story.slug || story.full_slug.split('/').at(-1)
  if (!slug || !title) return null

  return {
    slug,
    title,
    subtitle: asString(content.excerpt) ?? asString(content.subtitle) ?? '',
    date: formatStoryblokDate(
      asString(content.published_at) ?? asString(content.date) ?? story.first_published_at ?? null,
      locale,
    ),
    category: categoryLabel(content.category) ?? 'Journal',
    image:
      assetUrl(content.cover_image) ??
      assetUrl(content.image) ??
      assetUrl(content.cover) ??
      assetUrl(content.heroImage) ??
      assetUrl(content.og_image) ??
      '/images/alto-salon.jpg',
    heroImage:
      assetUrl(content.hero_image) ??
      assetUrl(content.header_image) ??
      assetUrl(content.article_hero_image) ??
      undefined,
    seoTitle: asString(content.seo_title) ?? undefined,
    seoDescription: asString(content.seo_description) ?? undefined,
    ogImage: assetUrl(content.og_image) ?? undefined,
    noIndex: content.no_index === true,
    section: inferBlogSection({
      section: asString(content.section) ?? asString(content.group),
      city: asString(content.city),
      category: asString(content.category),
      slug,
      title,
      subtitle: asString(content.subtitle) ?? asString(content.excerpt),
    }),
    sections: mapSections(content),
  }
}

function mapSections(content: Record<string, unknown>): BlogArticle['sections'] {
  const sections = Array.isArray(content.body)
    ? content.body
    : Array.isArray(content.sections)
      ? content.sections
      : []
  const mapped = sections
    .map((section) => {
      if (!isRecord(section)) return null
      const heading = asString(section.heading) ?? asString(section.title)
      const body = asString(section.body) ?? asString(section.text) ?? asString(section.quote)
      if (!heading || !body) return null
      return {
        label: asString(section.label),
        heading,
        body,
      }
    })
    .filter(Boolean) as BlogArticle['sections']

  if (mapped.length > 0) return mapped

  const body = asString(content.body) ?? asString(content.text) ?? asString(content.content)
  return [
    {
      heading: asString(content.heading) ?? asString(content.title) ?? '',
      body: body ?? '',
    },
  ].filter((section) => section.heading || section.body)
}

function categoryLabel(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  if (!Array.isArray(value)) return null

  const firstCategory = value.find((item) => isRecord(item))
  if (!firstCategory) return null

  return (
    asString(firstCategory.name) ??
    asString(firstCategory.title) ??
    asString(firstCategory.slug) ??
    asString(firstCategory.full_slug)
  )
}

function assetUrl(value: unknown): string | null {
  if (typeof value === 'string') return normalizeAssetUrl(value)
  if (!isRecord(value)) return null
  return normalizeAssetUrl(asString(value.filename) ?? asString(value.url))
}

function normalizeAssetUrl(value: string | null): string | null {
  if (!value) return null
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('https://s3.amazonaws.com/a.storyblok.com/')) {
    return value.replace('https://s3.amazonaws.com/a.storyblok.com/', 'https://a.storyblok.com/')
  }
  return value
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function formatStoryblokDate(value: string | null, locale: InquiryLocale): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}
