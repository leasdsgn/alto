/**
 * Remplit la story globale des témoignages sans écraser le contenu existant.
 *
 * Usage :
 *   bun run storyblok:apply-testimonials
 */

import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { SHARED_TESTIMONIALS_DEFAULTS } from '../../src/lib/storyblok-testimonials-defaults'

loadLocalEnv()

const {
  API,
  headers,
  blok,
  createStoryIfAbsent,
  ensureFolder,
  findStoryByFullSlug,
} = await import('./seed-utils')

const SHARED_TESTIMONIALS_SLUG = 'globals/shared-testimonials'

async function main() {
  const defaultContent = {
    component: 'shared_testimonials_global',
    items: buildSharedTestimonialsItems(),
  }

  const existing = await findStoryByFullSlug(SHARED_TESTIMONIALS_SLUG)

  if (!existing) {
    const parentId = await ensureFolder('globals', 'Globals')
    await createStoryIfAbsent({
      name: 'Témoignages partagés',
      fullSlug: SHARED_TESTIMONIALS_SLUG,
      realPath: '/',
      parentId,
      defaultContent,
    })
    console.log('Témoignages Storyblok créés.')
    return
  }

  if (Array.isArray(existing.content.items) && existing.content.items.length > 0) {
    console.log('globals/shared-testimonials contient déjà des témoignages, skip.')
    return
  }

  const response = await fetch(`${API}/stories/${existing.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      force_update: 1,
      publish: 1,
      story: {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
        parent_id: existing.parent_id ?? 0,
        path: existing.path,
        content: {
          ...existing.content,
          ...defaultContent,
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Impossible de mettre à jour ${SHARED_TESTIMONIALS_SLUG}: ${await response.text()}`,
    )
  }

  console.log('Témoignages Storyblok appliqués.')
}

function buildSharedTestimonialsItems() {
  return SHARED_TESTIMONIALS_DEFAULTS.map((testimonial) => blok('testimonial', { ...testimonial }))
}

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index === -1) continue

    const key = trimmed.slice(0, index).trim()
    const rawValue = trimmed.slice(index + 1).trim()
    if (process.env[key] !== undefined) continue
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
