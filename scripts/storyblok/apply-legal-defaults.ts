/**
 * Applique les contenus légaux par défaut aux stories existantes.
 *
 * Usage :
 *   bun run storyblok:apply-legal-defaults
 */

import { buildLegalDefaultBody, type LegalPageKind } from './seed-all'
import { API, findStoryByFullSlug, headers, sleep } from './seed-utils'

const LEGAL_STORIES: Array<{
  kind: LegalPageKind
  fullSlug: string
  path: string
}> = [
  { kind: 'cgv', fullSlug: 'pages/cgv', path: '/cgv' },
  { kind: 'confidentialite', fullSlug: 'pages/confidentialite', path: '/confidentialite' },
]

async function main() {
  console.log('Application des contenus légaux par défaut')
  const fallbackHeroImage = await getFallbackHeroImage()

  for (const entry of LEGAL_STORIES) {
    await sleep(250)
    const story = await findStoryByFullSlug(entry.fullSlug)
    if (!story) {
      console.log(`  · story ${entry.fullSlug} introuvable, skip`)
      continue
    }

    const body = buildLegalDefaultBody(entry.kind)
    const currentHero = getHeroCompactSection(story.content.body)
    const heroBlok = body[0] as Record<string, unknown> | undefined
    if (currentHero?.background_image && heroBlok) {
      heroBlok.background_image = currentHero.background_image
    } else if (fallbackHeroImage && heroBlok) {
      heroBlok.background_image = fallbackHeroImage
    }

    const response = await fetch(`${API}/stories/${story.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        force_update: 1,
        publish: 1,
        story: {
          id: story.id,
          name: story.name,
          slug: story.slug,
          parent_id: story.parent_id,
          path: entry.path,
          content: {
            ...story.content,
            component: 'page',
            body,
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`update ${entry.fullSlug}: ${await response.text()}`)
    }

    console.log(`  ↻ story ${entry.fullSlug}`)
  }

  console.log('Contenus légaux appliqués')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

function getHeroCompactSection(value: unknown) {
  if (!Array.isArray(value)) return null
  return value.find((item): item is Record<string, unknown> =>
    Boolean(item && typeof item === 'object' && item.component === 'hero_compact_section'),
  )
}

async function getFallbackHeroImage() {
  const story = await findStoryByFullSlug('pages/investir')
  const hero = getHeroCompactSection(story?.content.body)
  return hero?.background_image ?? null
}
