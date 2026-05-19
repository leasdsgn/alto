import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

interface PreviewPageProps {
  params: Promise<{
    slug?: string[]
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const query = await searchParams

  if (!hasStoryblokEditorParams(query)) {
    redirect('/')
  }

  const draft = await draftMode()
  draft.enable()

  const { slug = [] } = await params
  const path = slug.length > 0 ? `/${slug.join('/')}` : '/'
  const queryString = toQueryString(query)

  redirect(queryString ? `${path}?${queryString}` : path)
}

function hasStoryblokEditorParams(query: Record<string, string | string[] | undefined>) {
  return Object.keys(query).some((key) => key === '_storyblok' || key.startsWith('_storyblok_tk'))
}

function toQueryString(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') params.set(key, value)
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
  }

  return params.toString()
}
