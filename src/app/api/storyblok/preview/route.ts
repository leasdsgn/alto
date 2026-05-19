import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'
import { isValidStoryblokPreviewSecret } from '@/lib/storyblok-preview'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const slug = normalizeSlug(searchParams.get('slug') || searchParams.get('path'))

  if (!isValidStoryblokPreviewSecret(secret)) {
    return NextResponse.json({ error: 'invalid_preview_secret' }, { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(slug)
}

function normalizeSlug(value: string | null) {
  if (!value || value === 'home') return '/'
  if (value.startsWith('/')) return value
  return `/${value}`
}
