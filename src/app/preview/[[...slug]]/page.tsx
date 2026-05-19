import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import HomePage from '@/app/page'

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
    return <HomePage />
  }

  const queryString = toQueryString(query)

  redirect(queryString ? `${path}?${queryString}` : path)
}

function getPreviewPath(query: Record<string, string | string[] | undefined>, slug: string[]) {
  const queryPath = firstQueryValue(query.path) ?? firstQueryValue(query.slug) ?? firstQueryValue(query.real_path)
  if (queryPath) return normalizePath(queryPath)
  if (slug.length > 0) return normalizePath(slug.join('/'))
  return '/'
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizePath(value: string) {
  if (!value || value === 'home') return '/'
  if (value.startsWith('/preview')) return value.replace(/^\/preview/, '') || '/'
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
