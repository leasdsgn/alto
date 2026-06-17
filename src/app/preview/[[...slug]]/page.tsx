import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { StoryblokStory } from '@storyblok/react/rsc'
import { getServerLocale } from '@/lib/i18n/server'
import { getStoryblokApi } from '@/lib/storyblok'

const STATIC_ROUTES = new Set([
  '/about',
  '/annulation',
  '/appartements',
  '/blog',
  '/cgv',
  '/confidentialite',
  '/contact',
  '/investir',
  '/lyon',
  '/notre-histoire',
])

interface PreviewPageProps {
  params: Promise<{
    slug?: string[]
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const query = await searchParams
  const draft = await draftMode()
  draft.enable()

  const { slug = [] } = await params
  const path = getPreviewPath(query, slug)

  if (path === '/') {
    const storyblokApi = getStoryblokApi()
    const locale = await getServerLocale()
    const { data } = await storyblokApi.get('cdn/stories/site-images', {
      version: 'draft',
      language: locale,
      fallback_lang: 'fr',
    })

    return <StoryblokStory story={data.story} />
  }

  const queryString = toQueryString(query)

  redirect(queryString ? `${path}?${queryString}` : path)
}

function getPreviewPath(query: Record<string, string | string[] | undefined>, slug: string[]) {
  const queryPath =
    firstQueryValue(query.path) ?? firstQueryValue(query.slug) ?? firstQueryValue(query.real_path)
  if (queryPath) return normalizePath(queryPath)
  if (slug.length > 0) return normalizePath(slug.join('/'))
  return '/'
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizePath(value: string) {
  const path = value.startsWith('/preview') ? value.replace(/^\/preview/, '') : value
  const normalized = normalizeLeadingSlash(path)

  if (
    !path ||
    normalized === '/home' ||
    normalized === '/site-images' ||
    normalized === '/globals/site-images'
  ) {
    return '/'
  }

  if (normalized === '/global-faq' || normalized === '/apartment-faq') {
    return '/appartements'
  }

  if (normalized === '/blog/index') {
    return '/blog'
  }

  if (normalized.startsWith('/_categories/') || normalized.startsWith('/_settings/')) {
    return '/'
  }

  if (normalized.startsWith('/articles/')) {
    return normalized.replace(/^\/articles\//, '/blog/')
  }

  if (normalized.startsWith('/blog/')) {
    return normalized
  }

  if (normalized.startsWith('/apartments/') || normalized.startsWith('/apartment-editorials/')) {
    return normalized.replace(/^\/(apartments|apartment-editorials)\//, '/appartements/')
  }

  if (normalized.startsWith('/appartements/')) {
    return normalized
  }

  if (STATIC_ROUTES.has(normalized)) {
    return normalized
  }

  return `/blog${normalized}`
}

function normalizeLeadingSlash(value: string) {
  if (!value) return '/'
  return value.startsWith('/') ? value : `/${value}`
}

function toQueryString(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (key === 'path' || key === 'slug' || key === 'real_path') continue
    if (typeof value === 'string') params.set(key, value)
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
  }

  return params.toString()
}
