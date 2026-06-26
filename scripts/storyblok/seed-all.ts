/**
 * Orchestrateur seed Storyblok.
 *
 * IDEMPOTENT et SAFE :
 * - Push le schema de TOUS les composants (création si absent, update si présent)
 * - Crée les stories root (pages + globals) uniquement si elles n'existent pas
 * - Ne touche JAMAIS au contenu d'une story existante
 *
 * Usage :
 *   STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-all
 *   STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-all --schema-only
 */

import { ALL_COMPONENTS } from './schema'
import {
  createStoryIfAbsent,
  ensureFolder,
  listComponents,
  sleep,
  upsertComponent,
  type blok,
} from './seed-utils'

const SCHEMA_ONLY = process.argv.includes('--schema-only')

interface StorySeed {
  name: string
  fullSlug: string
  realPath: string
  parent: 'pages' | 'globals' | null
  defaultContent: Record<string, unknown>
}

const PAGE_STORIES: StorySeed[] = [
  {
    name: 'Accueil',
    fullSlug: 'pages/home',
    realPath: '/',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Lyon',
    fullSlug: 'pages/lyon',
    realPath: '/lyon',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Appartements',
    fullSlug: 'pages/appartements',
    realPath: '/appartements',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Notre histoire',
    fullSlug: 'pages/notre-histoire',
    realPath: '/notre-histoire',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Investir',
    fullSlug: 'pages/investir',
    realPath: '/investir',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Contact',
    fullSlug: 'pages/contact',
    realPath: '/contact',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Blog',
    fullSlug: 'pages/blog',
    realPath: '/blog',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'CGV',
    fullSlug: 'pages/cgv',
    realPath: '/cgv',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Confidentialité',
    fullSlug: 'pages/confidentialite',
    realPath: '/confidentialite',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Annulation',
    fullSlug: 'pages/annulation',
    realPath: '/annulation',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
]

const GLOBAL_STORIES: StorySeed[] = [
  {
    name: 'En-tête',
    fullSlug: 'globals/header',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'header_global' },
  },
  {
    name: 'Pied de page',
    fullSlug: 'globals/footer',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'footer_global' },
  },
  {
    name: 'CTA flottant',
    fullSlug: 'globals/sticky-cta',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'sticky_cta_global', enabled: true, threshold_vh: 80 },
  },
  {
    name: 'Assets partagés',
    fullSlug: 'globals/shared-assets',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'shared_assets_global' },
  },
  {
    name: 'Témoignages partagés',
    fullSlug: 'globals/shared-testimonials',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'shared_testimonials_global', items: [] },
  },
]

function pageContent(body: ReturnType<typeof blok>[]): Record<string, unknown> {
  return {
    component: 'page',
    body,
    seo: [],
  }
}

async function main() {
  console.log('— Storyblok seed-all —')

  console.log(`\n[1/3] Schema (${ALL_COMPONENTS.length} composants)`)
  const existing = await listComponents()
  for (const component of ALL_COMPONENTS) {
    await sleep(200)
    await upsertComponent(existing, component)
  }

  if (SCHEMA_ONLY) {
    console.log('\n--schema-only : skip stories.')
    return
  }

  console.log('\n[2/3] Dossiers parents')
  const pagesId = await ensureFolder('pages', 'Pages')
  const globalsId = await ensureFolder('globals', 'Globals')
  const parents = { pages: pagesId, globals: globalsId, none: 0 }

  console.log(`\n[3/3] Stories (${PAGE_STORIES.length + GLOBAL_STORIES.length})`)
  for (const story of [...PAGE_STORIES, ...GLOBAL_STORIES]) {
    await sleep(200)
    await createStoryIfAbsent({
      name: story.name,
      fullSlug: story.fullSlug,
      realPath: story.realPath,
      parentId: parents[story.parent ?? 'none'],
      defaultContent: story.defaultContent,
      publish: false,
    })
  }

  console.log('\n✓ Seed terminé')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export {}
