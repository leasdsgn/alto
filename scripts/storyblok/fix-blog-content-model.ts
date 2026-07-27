/**
 * Corrige le modèle éditorial du blog sans écraser le contenu.
 *
 * Par défaut, le script effectue uniquement un audit.
 * Ajouter --apply pour mettre à jour les composants, le dossier et les articles.
 */

import { BLOG_COMPONENTS } from './schema'
import {
  API,
  headers,
  listComponents,
  sleep,
  storyblokFetch,
  type StoryblokStory,
  upsertComponent,
} from './seed-utils'

const APPLY = process.argv.includes('--apply')
const BLOG_FOLDER_SLUG = 'blog'
const BLOG_CONTENT_TYPE = 'blog_article'
const LEGACY_ARTICLE_SLUGS = new Set([
  'saint-germain-heritage-et-design',
  'paris-cote-architecture',
  'vivre-le-marais-autrement',
])

interface ManagedStory extends StoryblokStory {
  default_root?: string | null
  published?: boolean
  uuid?: string
}

interface StoryListResponse {
  stories?: ManagedStory[]
}

interface StoryResponse {
  story?: ManagedStory
}

async function main() {
  const stories = await listStories()
  const folderSummary = stories.find((story) => story.full_slug === BLOG_FOLDER_SLUG)
  if (!folderSummary) throw new Error('Dossier Storyblok "blog" introuvable')

  const blogSummaries = stories.filter(
    (story) => story.full_slug.startsWith(`${BLOG_FOLDER_SLUG}/`) && !story.is_folder,
  )
  const details = [await getStory(folderSummary.id)]
  for (const story of blogSummaries) {
    await sleep(200)
    details.push(await getStory(story.id))
  }
  const folder = details[0]
  const articles = details.slice(1)
  const legacyArticles = articles.filter(
    (story) => LEGACY_ARTICLE_SLUGS.has(story.slug) && story.content.component === 'article',
  )
  const missingLegacyArticles = [...LEGACY_ARTICLE_SLUGS].filter(
    (slug) => !articles.some((story) => story.slug === slug),
  )

  if (missingLegacyArticles.length > 0) {
    throw new Error(`Articles historiques introuvables : ${missingLegacyArticles.join(', ')}`)
  }

  const blogArticleUpdates = articles
    .filter((story) => story.content.component === BLOG_CONTENT_TYPE)
    .map((story) => ({
      story,
      content: migrateBlogArticleContent(story.content, articles),
    }))
    .filter(({ story, content }) => JSON.stringify(story.content) !== JSON.stringify(content))

  console.log(`Mode : ${APPLY ? 'application' : 'audit uniquement'}`)
  console.log(`Dossier blog : ${folder.default_root ?? 'aucun'} → ${BLOG_CONTENT_TYPE}`)
  console.log(`Articles historiques à migrer : ${legacyArticles.length}`)
  console.log(`Articles blog à normaliser : ${blogArticleUpdates.length}`)

  if (!APPLY) {
    console.log('Aucune modification effectuée. Relancer avec --apply pour appliquer la migration.')
    return
  }

  const components = await listComponents()
  for (const component of BLOG_COMPONENTS) {
    await upsertComponent(components, component)
    await sleep(250)
  }

  if (folder.default_root !== BLOG_CONTENT_TYPE) {
    await updateStory(folder, folder.content, {
      defaultRoot: BLOG_CONTENT_TYPE,
      publish: false,
    })
    console.log(`  ↻ dossier blog configuré sur ${BLOG_CONTENT_TYPE}`)
    await sleep(250)
  }

  for (const story of legacyArticles) {
    await updateStory(story, migrateLegacyArticleContent(story.content), {
      publish: true,
    })
    console.log(`  ↻ ${story.full_slug} migré vers ${BLOG_CONTENT_TYPE}`)
    await sleep(250)
  }

  for (const { story, content } of blogArticleUpdates) {
    await updateStory(story, content, { publish: true })
    console.log(`  ↻ ${story.full_slug} normalisé`)
    await sleep(250)
  }

  console.log('Migration du blog terminée')
}

async function listStories() {
  const response = await storyblokFetch(`${API}/stories?per_page=100`, { headers })
  if (!response.ok) throw new Error(`listStories: ${await response.text()}`)
  const data = (await response.json()) as StoryListResponse
  return data.stories ?? []
}

async function getStory(id: number) {
  const response = await storyblokFetch(`${API}/stories/${id}`, { headers })
  if (!response.ok) throw new Error(`getStory ${id}: ${await response.text()}`)
  const data = (await response.json()) as StoryResponse
  if (!data.story) throw new Error(`Story ${id} introuvable`)
  return data.story
}

async function updateStory(
  story: ManagedStory,
  content: Record<string, unknown>,
  options: { defaultRoot?: string; publish: boolean },
) {
  const response = await storyblokFetch(`${API}/stories/${story.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      story: {
        name: story.name,
        slug: story.slug,
        parent_id: story.parent_id ?? 0,
        path: story.path,
        is_folder: story.is_folder,
        default_root: options.defaultRoot ?? story.default_root,
        content,
      },
      force_update: 1,
      publish: options.publish,
    }),
  })

  if (!response.ok) throw new Error(`updateStory ${story.id}: ${await response.text()}`)
}

function migrateLegacyArticleContent(content: Record<string, unknown>) {
  const title = nonEmptyString(content.title) ?? ''
  const excerpt = nonEmptyString(content.subtitle) ?? ''
  const coverImage = content.image ?? ''
  const heroImage = content.hero_image ?? ''
  const sections = Array.isArray(content.sections) ? content.sections : []

  return {
    _uid: nonEmptyString(content._uid) ?? crypto.randomUUID(),
    component: BLOG_CONTENT_TYPE,
    title,
    excerpt,
    cover_image: coverImage,
    hero_image: heroImage,
    category: nonEmptyString(content.category) ?? 'Paris',
    section: normalizeSection(content.section),
    published_at: normalizeDate(content.date),
    is_featured: content.is_featured === true,
    body: sections
      .filter(isRecord)
      .map((section) => ({
        _uid: nonEmptyString(section._uid) ?? crypto.randomUUID(),
        component: 'article_rich_text',
        label: nonEmptyString(section.label) ?? '',
        heading: nonEmptyString(section.heading) ?? title,
        body: toRichText(section.body ?? section.text),
      }))
      .filter((section) => section.heading && hasRichTextContent(section.body)),
    related_articles: [],
    seo_title: nonEmptyString(content.seo_title) ?? title,
    seo_description: nonEmptyString(content.seo_description) ?? excerpt,
    og_image: content.og_image ?? heroImage ?? coverImage,
    no_index: content.no_index === true,
  }
}

function migrateBlogArticleContent(content: Record<string, unknown>, articles: ManagedStory[]) {
  const body = Array.isArray(content.body)
    ? content.body.map((blok) => {
        if (!isRecord(blok) || blok.component !== 'article_rich_text') return blok
        return {
          ...blok,
          body: toRichText(blok.body),
        }
      })
    : []

  return {
    ...content,
    body,
    related_articles: normalizeReferences(content.related_articles, articles),
  }
}

function normalizeReferences(value: unknown, articles: ManagedStory[]) {
  if (Array.isArray(value)) {
    return value
      .map((reference) => {
        if (typeof reference === 'string') return reference
        if (!isRecord(reference)) return null
        return nonEmptyString(reference.uuid)
      })
      .filter((reference): reference is string => Boolean(reference))
  }

  if (typeof value !== 'string' || !value.trim()) return []

  const requestedSlugs = value
    .split(/[,\n]/)
    .map((slug) => slug.trim().replace(/^blog\//, ''))
    .filter(Boolean)
  const bySlug = new Map(articles.map((article) => [article.slug, article.uuid]))

  return requestedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((uuid): uuid is string => Boolean(uuid))
}

function toRichText(value: unknown) {
  if (isRecord(value) && value.type === 'doc' && Array.isArray(value.content)) return value

  const paragraphs =
    typeof value === 'string'
      ? value
          .split(/\n+/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
      : []

  return {
    type: 'doc',
    content: paragraphs.map((paragraph) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: paragraph }],
    })),
  }
}

function hasRichTextContent(value: unknown) {
  return isRecord(value) && Array.isArray(value.content) && value.content.length > 0
}

function normalizeDate(value: unknown) {
  const date = nonEmptyString(value)
  if (!date) return new Date().toISOString().slice(0, 16).replace('T', ' ')
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date} 09:00`
  return date
}

function normalizeSection(value: unknown) {
  return value === 'lyon' || value === 'voyage' ? value : 'paris'
}

function nonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
