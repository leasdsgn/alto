import { draftMode } from 'next/headers'

export const STORYBLOK_PREVIEW_PARAM = '_storyblok'

export async function getStoryblokVersion() {
  const { isEnabled } = await draftMode()
  return isEnabled || process.env.NODE_ENV !== 'production' ? 'draft' : 'published'
}

export function getStoryblokToken(version: 'draft' | 'published') {
  if (version === 'draft') {
    return (
      process.env.STORYBLOK_PREVIEW_TOKEN ||
      process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN ||
      process.env.NEXT_PUBLIC_STORYBLOK_TOKEN ||
      ''
    )
  }

  return process.env.NEXT_PUBLIC_STORYBLOK_TOKEN || ''
}

export function isValidStoryblokPreviewSecret(secret: string | null) {
  const expectedSecret = process.env.STORYBLOK_PREVIEW_SECRET
  if (!expectedSecret) return process.env.NODE_ENV !== 'production'
  return secret === expectedSecret
}
