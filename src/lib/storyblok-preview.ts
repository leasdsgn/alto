import { draftMode } from 'next/headers'

export const STORYBLOK_PREVIEW_PARAM = '_storyblok'
export type StoryblokVersion = 'draft' | 'published'

export async function getStoryblokVersion(): Promise<StoryblokVersion> {
  if (process.env.NODE_ENV !== 'production') return 'draft'
  try {
    const draft = await draftMode()
    if (draft.isEnabled) return 'draft'
  } catch {
    return 'published'
  }

  return 'published'
}

export function getStoryblokToken(version: StoryblokVersion) {
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
