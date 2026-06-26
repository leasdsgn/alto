export interface StoryblokAssetField {
  filename?: string | null
  url?: string | null
  alt?: string | null
  title?: string | null
}

export interface StoryblokLinkField {
  id?: string
  url?: string
  cached_url?: string
  linktype?: 'story' | 'url' | 'email' | 'asset'
  story?: { full_slug?: string; slug?: string; url?: string }
  email?: string
  target?: '_blank' | '_self'
}

export function assetUrl(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return normalizeUrl(value) ?? fallback
  if (!isRecord(value)) return fallback
  const candidate = (value as StoryblokAssetField).filename ?? (value as StoryblokAssetField).url
  return normalizeUrl(candidate) ?? fallback
}

export function assetAlt(value: unknown, fallback = ''): string {
  if (!isRecord(value)) return fallback
  const alt = (value as StoryblokAssetField).alt
  return typeof alt === 'string' && alt.trim() ? alt : fallback
}

export function linkHref(value: unknown, fallback = '#'): string {
  if (typeof value === 'string') return value.trim() || fallback
  if (!isRecord(value)) return fallback
  const link = value as StoryblokLinkField
  if (link.linktype === 'email' && link.email) return `mailto:${link.email}`
  if (link.linktype === 'url' && link.url) return link.url
  if (link.linktype === 'story') {
    const slug = link.story?.url ?? link.story?.full_slug ?? link.cached_url
    if (slug) return slug.startsWith('/') ? slug : `/${slug}`
  }
  const cached = link.cached_url ?? link.url
  if (cached) return cached.startsWith('/') || cached.startsWith('http') ? cached : `/${cached}`
  return fallback
}

export function linkTarget(value: unknown): '_blank' | '_self' | undefined {
  if (!isRecord(value)) return undefined
  return (value as StoryblokLinkField).target
}

export function textOr<T extends string>(value: unknown, fallback: T): string {
  return typeof value === 'string' && value.trim() ? value : fallback
}

export function bloksOf<T extends Record<string, unknown>>(value: unknown): T[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is T => isRecord(item))
}

export function boolOr(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function numberOr(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  if (trimmed.startsWith('https://s3.amazonaws.com/a.storyblok.com/')) {
    return trimmed.replace('https://s3.amazonaws.com/a.storyblok.com/', 'https://a.storyblok.com/')
  }
  return trimmed
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
