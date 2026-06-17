/**
 * Organise les stories Storyblok utilisées par Alto.
 *
 * Usage :
 * STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:organize
 */

const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '291441851126938'

if (!TOKEN) {
  console.error('STORYBLOK_PERSONAL_TOKEN requis')
  process.exit(1)
}

const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`

const headers = {
  Authorization: TOKEN,
  'Content-Type': 'application/json',
}

interface StoryblokStory {
  id: number
  name: string
  slug: string
  full_slug: string
  parent_id: number
  path?: string | null
  content?: Record<string, unknown>
}

interface StoryblokStoriesResponse {
  stories?: StoryblokStory[]
}

interface StoryblokStoryResponse {
  story?: StoryblokStory
}

async function getStories() {
  const response = await fetch(`${API}/stories?per_page=100`, { headers })
  if (!response.ok) throw new Error(await response.text())
  const data = (await response.json()) as StoryblokStoriesResponse
  return data.stories ?? []
}

async function getStory(id: number) {
  const response = await fetch(`${API}/stories/${id}`, { headers })
  if (!response.ok) throw new Error(await response.text())
  const data = (await response.json()) as StoryblokStoryResponse
  if (!data.story) throw new Error(`Story ${id} introuvable`)
  return data.story
}

async function updateStory(id: number, patch: Partial<StoryblokStory>) {
  const story = await getStory(id)
  const response = await fetch(`${API}/stories/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      story: {
        ...story,
        ...patch,
      },
      force_update: 1,
      publish: 1,
    }),
  })

  if (!response.ok) throw new Error(await response.text())
}

async function deleteStory(id: number) {
  const response = await fetch(`${API}/stories/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) throw new Error(await response.text())
}

function pathForStory(story: StoryblokStory) {
  if (story.full_slug === 'site-images') return '/'
  if (story.full_slug === 'blog/index') return '/blog'
  if (story.full_slug === 'blog') return '/blog'
  if (story.full_slug.startsWith('blog/')) return `/${story.full_slug}`
  if (story.full_slug.startsWith('_categories/')) return null
  if (story.full_slug.startsWith('_settings/')) return null
  if (story.full_slug === 'global-faq') return '/appartements'
  if (story.full_slug.startsWith('appartements/')) return `/${story.full_slug}`
  if (story.full_slug.startsWith('apartments/')) {
    return story.full_slug.replace(/^apartments\//, '/appartements/')
  }
  if (story.full_slug.startsWith('apartment-editorials/')) {
    return story.full_slug.replace(/^apartment-editorials\//, '/appartements/')
  }

  return story.path ?? null
}

async function main() {
  const stories = await getStories()
  const blogStories = new Map(
    stories
      .filter((story) => story.full_slug.startsWith('blog/'))
      .map((story) => [story.slug, story]),
  )
  const rootArticleDuplicates = stories.filter(
    (story) =>
      story.parent_id === 0 && blogStories.has(story.slug) && story.full_slug === story.slug,
  )

  for (const story of stories) {
    const path = pathForStory(story)
    const name = story.full_slug === 'site-images' ? 'Accueil' : story.name

    if (path !== story.path || name !== story.name) {
      await updateStory(story.id, { path, name })
      console.log(`Story "${story.full_slug}" mise à jour`)
      await sleep(250)
    }
  }

  for (const story of rootArticleDuplicates) {
    await deleteStory(story.id)
    console.log(`Doublon racine supprimé : "${story.full_slug}"`)
    await sleep(250)
  }

  console.log('Organisation Storyblok terminée')
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

main()

export {}
