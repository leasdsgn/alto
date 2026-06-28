import { redirect } from 'next/navigation'
import { StoryblokStory } from '@storyblok/react/rsc'
import { getServerLocale } from '@/lib/i18n/server'
import { getStoryBySlug } from '@/lib/storyblok-page'

interface PreviewPageProps {
  params: Promise<{
    slug?: string[]
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const query = await searchParams
  const { slug = [] } = await params
  const locale = await getServerLocale()
  const target = resolvePreviewTarget(query, slug)

  if (target.kind === 'story') {
    const story = await getStoryBySlug(target.slug, locale, 'draft')
    if (story) return <StoryblokStory story={story} />
    if (target.slug === 'pages/home') {
      const legacyHome = await getStoryBySlug('site-images', locale, 'draft')
      if (legacyHome) return <StoryblokStory story={legacyHome} />
    }
    if (target.fallbackPath) redirect(target.fallbackPath)
  }

  redirect(target.fallbackPath ?? '/')
}

interface PreviewTarget {
  kind: 'story' | 'redirect'
  slug: string
  fallbackPath?: string
}

const PAGE_SLUG_TO_PATH: Record<string, string> = {
  home: '/',
  lyon: '/lyon',
  appartements: '/appartements',
  'notre-histoire': '/notre-histoire',
  investir: '/investir',
  contact: '/contact',
  blog: '/blog',
  cgv: '/cgv',
  confidentialite: '/confidentialite',
  annulation: '/annulation',
}

function resolvePreviewTarget(
  query: Record<string, string | string[] | undefined>,
  slug: string[],
): PreviewTarget {
  const queryPath =
    firstQueryValue(query.path) ?? firstQueryValue(query.slug) ?? firstQueryValue(query.real_path)
  const raw = queryPath ?? slug.join('/')
  const normalized = stripLeading(normalize(raw))

  if (!normalized || normalized === 'home') {
    return { kind: 'story', slug: 'pages/home', fallbackPath: '/' }
  }

  if (normalized === 'about') {
    return { kind: 'story', slug: 'pages/notre-histoire', fallbackPath: '/notre-histoire' }
  }

  if (normalized.startsWith('pages/')) {
    const pageKey = normalized.slice('pages/'.length)
    return {
      kind: 'story',
      slug: normalized,
      fallbackPath: PAGE_SLUG_TO_PATH[pageKey] ?? `/${pageKey}`,
    }
  }

  if (normalized.startsWith('globals/')) {
    return { kind: 'story', slug: normalized, fallbackPath: '/' }
  }

  if (normalized.startsWith('articles/')) {
    return {
      kind: 'story',
      slug: normalized,
      fallbackPath: `/blog/${normalized.replace(/^articles\//, '')}`,
    }
  }

  if (normalized.startsWith('apartments/') || normalized.startsWith('apartment-editorials/')) {
    const slugPart = normalized.replace(/^(apartments|apartment-editorials)\//, '')
    return {
      kind: 'story',
      slug: normalized,
      fallbackPath: `/appartements/${slugPart}`,
    }
  }

  if (normalized.startsWith('blog/')) {
    return {
      kind: 'story',
      slug: normalized.replace(/^blog\//, 'articles/'),
      fallbackPath: `/${normalized}`,
    }
  }

  if (normalized === 'site-images' || normalized === 'globals/site-images') {
    return { kind: 'story', slug: 'site-images', fallbackPath: '/' }
  }

  if (PAGE_SLUG_TO_PATH[normalized]) {
    return {
      kind: 'story',
      slug: `pages/${normalized}`,
      fallbackPath: PAGE_SLUG_TO_PATH[normalized],
    }
  }

  return { kind: 'redirect', slug: '', fallbackPath: `/${normalized}` }
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalize(value: string) {
  if (!value) return '/'
  const cleaned = value.startsWith('/preview') ? value.replace(/^\/preview/, '') : value
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
}

function stripLeading(value: string) {
  return value.replace(/^\/+/, '').replace(/\/+$/, '')
}
