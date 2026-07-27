/**
 * Utilitaires partagés par les scripts seed Storyblok.
 *
 * Toutes les opérations sont IDEMPOTENTES :
 * - Components : upsert (création OU mise à jour du schema, contenu inchangé)
 * - Stories : create-only-if-absent (zéro écrasement de contenu existant)
 */

const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '291441851126938'

if (!TOKEN) {
  console.error('STORYBLOK_PERSONAL_TOKEN requis')
  process.exit(1)
}

export const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`

export const headers = {
  Authorization: TOKEN,
  'Content-Type': 'application/json',
}

export interface StoryblokComponent {
  id: number
  name: string
}

interface ComponentListResponse {
  components?: StoryblokComponent[]
}

export interface StoryblokStory {
  id: number
  name: string
  slug: string
  full_slug: string
  parent_id?: number
  path?: string
  content: Record<string, unknown>
  is_folder?: boolean
}

interface StoryListResponse {
  stories?: StoryblokStory[]
}

interface StoryResponse {
  story?: StoryblokStory
}

export interface ComponentDefinition {
  name: string
  display_name: string
  is_root: boolean
  is_nestable: boolean
  schema: Record<string, unknown>
  component_group_uuid?: string
}

export async function storyblokFetch(url: string, init?: RequestInit): Promise<Response> {
  const maxAttempts = 5

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url, init)
    if (response.status !== 429 || attempt === maxAttempts) return response

    const retryAfter = Number(response.headers.get('retry-after'))
    const delayMs =
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 1100
    await sleep(delayMs)
  }

  throw new Error('Storyblok request retry exhausted')
}

export async function listComponents(): Promise<StoryblokComponent[]> {
  const res = await storyblokFetch(`${API}/components`, { headers })
  if (!res.ok) throw new Error(`listComponents: ${await res.text()}`)
  const data = (await res.json()) as ComponentListResponse
  return data.components ?? []
}

export async function upsertComponent(
  existing: StoryblokComponent[],
  component: ComponentDefinition,
): Promise<void> {
  const current = existing.find((item) => item.name === component.name)
  const payload = { component }

  if (!current) {
    const res = await storyblokFetch(`${API}/components`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`POST component ${component.name}: ${await res.text()}`)
    console.log(`  ✓ created ${component.name}`)
    return
  }

  const res = await storyblokFetch(`${API}/components/${current.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`PUT component ${component.name}: ${await res.text()}`)
  console.log(`  ↻ updated ${component.name}`)
}

export async function findStoryByFullSlug(fullSlug: string): Promise<StoryblokStory | null> {
  const params = new URLSearchParams({ by_slugs: fullSlug, per_page: '1' })
  const res = await storyblokFetch(`${API}/stories?${params}`, { headers })
  if (!res.ok) throw new Error(`findStoryByFullSlug ${fullSlug}: ${await res.text()}`)
  const data = (await res.json()) as StoryListResponse
  const story = data.stories?.find((entry) => entry.full_slug === fullSlug)
  if (!story) return null
  const detail = await storyblokFetch(`${API}/stories/${story.id}`, { headers })
  if (!detail.ok) throw new Error(`GET story ${story.id}: ${await detail.text()}`)
  const data2 = (await detail.json()) as StoryResponse
  return data2.story ?? story
}

export async function ensureFolder(slug: string, name: string): Promise<number> {
  const fullSlug = slug
  const existing = await findStoryByFullSlug(fullSlug)
  if (existing) return existing.id

  const res = await storyblokFetch(`${API}/stories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      story: {
        name,
        slug,
        is_folder: true,
        parent_id: 0,
      },
    }),
  })
  if (!res.ok) throw new Error(`createFolder ${slug}: ${await res.text()}`)
  const data = (await res.json()) as StoryResponse
  if (!data.story) throw new Error(`createFolder ${slug}: empty response`)
  console.log(`  ✓ folder ${slug}`)
  return data.story.id
}

export interface SeedStoryInput {
  name: string
  fullSlug: string
  realPath?: string
  parentId?: number
  defaultContent: Record<string, unknown>
  publish?: boolean
}

export async function createStoryIfAbsent(input: SeedStoryInput): Promise<'created' | 'exists'> {
  const existing = await findStoryByFullSlug(input.fullSlug)
  if (existing) {
    console.log(`  · story ${input.fullSlug} exists, skipping (no overwrite)`)
    return 'exists'
  }

  const segments = input.fullSlug.split('/')
  const slug = segments.pop() ?? input.fullSlug
  const res = await storyblokFetch(`${API}/stories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      story: {
        name: input.name,
        slug,
        parent_id: input.parentId ?? 0,
        path: input.realPath,
        content: input.defaultContent,
      },
      publish: input.publish === false ? 0 : 1,
    }),
  })
  if (!res.ok) throw new Error(`createStory ${input.fullSlug}: ${await res.text()}`)
  console.log(`  ✓ created story ${input.fullSlug}`)
  return 'created'
}

export async function updateStoryContent(
  storyId: number,
  content: Record<string, unknown>,
): Promise<void> {
  const response = await storyblokFetch(`${API}/stories/${storyId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      story: { content },
      publish: 1,
      force_update: 1,
    }),
  })

  if (!response.ok) throw new Error(`updateStoryContent ${storyId}: ${await response.text()}`)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function blok(component: string, fields: Record<string, unknown> = {}) {
  return {
    _uid: crypto.randomUUID(),
    component,
    ...fields,
  }
}
