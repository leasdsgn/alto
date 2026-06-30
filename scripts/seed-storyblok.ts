/**
 * Crée ou met à jour la structure Storyblok éditoriale d'Alto.
 *
 * Usage :
 * STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-blog
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

interface StoryblokComponent {
  id: number
  name: string
}

interface ComponentListResponse {
  components?: StoryblokComponent[]
}

interface StoryblokStory {
  id: number
  name: string
  slug: string
  full_slug: string
  parent_id: number
  is_folder?: boolean
  path?: string | null
  content?: Record<string, unknown>
}

interface StoryblokStoriesResponse {
  stories?: StoryblokStory[]
}

type StoryInput = {
  name: string
  slug: string
  parentId: number
  path?: string | null
  isFolder?: boolean
  content?: Record<string, unknown>
}

const FOLDERS = [
  { name: 'Blog', slug: 'blog' },
  { name: 'Catégories', slug: '_categories' },
  { name: 'Réglages', slug: '_settings' },
] as const

const BLOG_CATEGORIES = [
  { name: 'Paris', slug: 'paris', description: 'Guides et adresses à Paris.' },
  { name: 'Lyon', slug: 'lyon', description: 'Guides et adresses à Lyon.' },
  { name: 'Voyages', slug: 'voyages', description: 'Conseils pour préparer un séjour.' },
  { name: 'Architecture', slug: 'architecture', description: 'Lieux, patrimoine et design.' },
] as const

const ARTICLES = [
  {
    name: 'Le Marais à hauteur de regard',
    slug: 'le-marais-a-hauteur-de-regard',
    excerpt: 'Adresses confidentielles et façades d’époque.',
    category: 'Paris',
    section: 'paris',
    publishedAt: '2026-03-12 09:00',
    body: [
      {
        component: 'article_rich_text',
        heading: 'Le Marais ne se traverse pas, il s’observe.',
        body: 'Derrière ses façades patinées, ses portes cochères et ses pavés irréguliers, le quartier dévoile un dialogue subtil entre patrimoine et création contemporaine.\nIci, chaque détail mérite qu’on ralentisse le pas.',
      },
      {
        component: 'article_rich_text',
        label: 'Un musée à ciel ouvert',
        heading:
          'Entre hôtels particuliers, cours silencieuses et vitrines plus pointues, le quartier garde une élégance très parisienne.',
        body: 'Les adresses les plus intéressantes se découvrent souvent à quelques mètres de l’artère principale. Il faut accepter de sortir du flux, regarder les seuils, observer la lumière qui entre dans les passages.',
      },
    ],
  },
  {
    name: 'Un week-end à Saint-Germain',
    slug: 'un-week-end-a-saint-germain',
    excerpt: 'Librairies, terrasses et adresses choisies.',
    category: 'Paris',
    section: 'paris',
    publishedAt: '2026-03-12 09:00',
    body: [
      {
        component: 'article_rich_text',
        heading: 'Saint-Germain demande un rythme plus lent.',
        body: 'Le quartier se révèle dans les habitudes. Un café tôt le matin, une librairie avant l’affluence, une rue calme à la fin du jour. Ce n’est pas un décor, c’est une cadence.',
      },
    ],
  },
  {
    name: 'Autour de l’Opéra',
    slug: 'autour-de-l-opera',
    excerpt: 'Grandeur haussmannienne et nouvelles tables parisiennes.',
    category: 'Architecture',
    section: 'paris',
    publishedAt: '2026-03-12 09:00',
    body: [
      {
        component: 'article_rich_text',
        heading: 'Autour de l’Opéra, Paris devient plus ample.',
        body: 'Les grands boulevards, les façades de pierre blonde et les halls monumentaux composent une expérience plus théâtrale. Le quartier mélange institutions, hôtels historiques et nouvelles adresses bien installées.',
      },
    ],
  },
  {
    name: 'Lyon entre terrasses et traboules',
    slug: 'lyon-entre-terrasses-et-traboules',
    excerpt: 'Une ville à parcourir à pied, quartier par quartier.',
    category: 'Lyon',
    section: 'lyon',
    publishedAt: '2026-03-19 09:00',
    body: [
      {
        component: 'article_rich_text',
        heading: 'Lyon se découvre en séquences très différentes.',
        body: 'La Presqu’île déroule ses façades ordonnancées, le Vieux Lyon joue sur les passages et les cours intérieures, les pentes installent une relation plus directe avec la ville. Chaque morceau impose un rythme propre.',
      },
    ],
  },
  {
    name: 'Préparer un séjour sans frictions',
    slug: 'preparer-un-sejour-sans-frictions',
    excerpt: 'Les quelques choix qui changent vraiment l’expérience.',
    category: 'Voyages',
    section: 'voyage',
    publishedAt: '2026-03-26 09:00',
    body: [
      {
        component: 'article_rich_text',
        heading: 'Le confort d’un séjour commence avant l’arrivée.',
        body: 'Choisir un quartier cohérent avec ses déplacements, anticiper l’heure d’arrivée et limiter les changements de plan inutiles simplifie tout. Une bonne expérience repose souvent sur une logistique discrète mais bien pensée.',
      },
    ],
  },
] as const

const COMPONENTS = [
  {
    name: 'article_rich_text',
    display_name: 'Article - Texte',
    is_root: false,
    is_nestable: true,
    schema: {
      label: textField('Label', 0),
      heading: textField('Titre', 1, true),
      body: textareaField('Texte', 2, true),
    },
  },
  {
    name: 'article_image',
    display_name: 'Article - Image',
    is_root: false,
    is_nestable: true,
    schema: {
      image: imageField('Image', 0, true),
      caption: textField('Légende', 1),
      alt: textField('Texte alternatif', 2, true),
    },
  },
  {
    name: 'article_quote',
    display_name: 'Article - Citation',
    is_root: false,
    is_nestable: true,
    schema: {
      quote: textareaField('Citation', 0, true),
      author: textField('Auteur', 1),
    },
  },
  {
    name: 'article_gallery',
    display_name: 'Article - Galerie',
    is_root: false,
    is_nestable: true,
    schema: {
      images: multiassetField('Images', 0),
    },
  },
  {
    name: 'cta_button',
    display_name: 'Élément - Bouton',
    is_root: false,
    is_nestable: true,
    schema: {
      label: textField('Libellé', 0, true),
      link: linkField('Lien', 1, true),
    },
  },
  {
    name: 'navigation_link',
    display_name: 'Navigation - Lien',
    is_root: false,
    is_nestable: true,
    schema: {
      label: textField('Libellé', 0, true),
      link: linkField('Lien', 1, true),
    },
  },
  {
    name: 'footer_column',
    display_name: 'Footer - Colonne',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textField('Titre', 0, true),
      links: bloksField('Liens', 1, ['navigation_link']),
    },
  },
  {
    name: 'blog_category',
    display_name: 'Catégorie blog',
    is_root: true,
    is_nestable: false,
    schema: {
      name: textField('Nom', 0, true),
      description: textareaField('Description', 1),
    },
  },
  {
    name: 'blog_page',
    display_name: 'Page blog',
    is_root: true,
    is_nestable: false,
    schema: {
      title: textField('Titre', 0, true),
      description: textareaField('Description', 1, true),
      seo_title: textField('SEO - Titre', 2, true),
      seo_description: textareaField('SEO - Description', 3, true),
      og_image: imageField('SEO - Image de partage', 4),
      no_index: booleanField('SEO - Ne pas indexer', 5),
    },
  },
  {
    name: 'blog_article',
    display_name: 'Article blog',
    is_root: true,
    is_nestable: false,
    schema: {
      title: textField('Titre', 0, true),
      excerpt: textareaField('Résumé', 1, true),
      cover_image: imageField('Image de couverture', 2),
      hero_image: imageField('Image du header article', 13),
      category: textField('Catégorie', 3, true),
      section: optionField('Section éditoriale', 4, ['paris', 'lyon', 'voyage']),
      published_at: datetimeField('Date de publication', 5, true),
      is_featured: booleanField('Mis en avant', 6),
      body: bloksField('Contenu', 7, [
        'article_rich_text',
        'article_image',
        'article_quote',
        'article_gallery',
        'section_cta',
      ]),
      related_articles: textField('Articles liés', 8),
      seo_title: textField('SEO - Titre', 9, true),
      seo_description: textareaField('SEO - Description', 10, true),
      og_image: imageField('SEO - Image de partage', 11),
      no_index: booleanField('SEO - Ne pas indexer', 12),
    },
  },
  {
    name: 'site_settings',
    display_name: 'Réglages - Paramètres globaux',
    is_root: true,
    is_nestable: false,
    schema: {
      site_name: textField('Nom du site', 0, true),
      booking_cta_label: textField('CTA réservation - Libellé', 1, true),
      booking_cta_link: linkField('CTA réservation - Lien', 2, true),
      contact_email: textField('Email de contact', 3),
    },
  },
  {
    name: 'navigation_settings',
    display_name: 'Réglages - Navigation',
    is_root: true,
    is_nestable: false,
    schema: {
      main_links: bloksField('Liens principaux', 0, ['navigation_link']),
      cta: bloksField('CTA header', 1, ['cta_button']),
    },
  },
  {
    name: 'footer_settings',
    display_name: 'Réglages - Footer',
    is_root: true,
    is_nestable: false,
    schema: {
      columns: bloksField('Colonnes', 0, ['footer_column']),
      legal_links: bloksField('Liens légaux', 1, ['navigation_link']),
      social_links: bloksField('Réseaux sociaux', 2, ['navigation_link']),
      newsletter_text: textareaField('Texte newsletter', 3),
    },
  },
] as const

async function getComponents() {
  const res = await fetch(`${API}/components`, { headers })
  if (!res.ok) throw new Error(await res.text())
  const data = (await res.json()) as ComponentListResponse
  return data.components ?? []
}

async function getStories() {
  const response = await fetch(`${API}/stories?per_page=100`, { headers })
  if (!response.ok) throw new Error(await response.text())
  const data = (await response.json()) as StoryblokStoriesResponse
  return data.stories ?? []
}

async function upsertComponent(
  existing: StoryblokComponent[],
  component: (typeof COMPONENTS)[number],
) {
  const current = existing.find((item) => item.name === component.name)
  const payload = { component }

  if (!current) {
    const res = await fetch(`${API}/components`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(await res.text())
    console.log(`Component "${component.name}" créé`)
    return
  }

  const res = await fetch(`${API}/components/${current.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
  console.log(`Component "${component.name}" mis à jour`)
}

async function upsertStory(stories: StoryblokStory[], input: StoryInput) {
  const fullSlug = input.parentId
    ? `${stories.find((story) => story.id === input.parentId)?.full_slug}/${input.slug}`
    : input.slug
  const current = stories.find((story) => story.full_slug === fullSlug)
  const storyPayload = {
    name: input.name,
    slug: input.slug,
    parent_id: input.parentId,
    path: input.path ?? null,
    is_folder: input.isFolder ?? false,
    content: input.content ?? {},
  }

  if (!current) {
    const response = await fetch(`${API}/stories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ story: storyPayload, publish: input.isFolder ? 0 : 1 }),
    })
    if (!response.ok) throw new Error(await response.text())

    const nextStories = await getStories()
    const created = nextStories.find((story) => story.full_slug === fullSlug)
    if (created) stories.push(created)

    console.log(`Story "${fullSlug}" créée`)
    return created ?? null
  }

  const content = input.isFolder ? current.content : { ...current.content, ...input.content }
  const response = await fetch(`${API}/stories/${current.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      story: {
        ...current,
        ...storyPayload,
        content,
      },
      force_update: 1,
      publish: input.isFolder ? 0 : 1,
    }),
  })
  if (!response.ok) throw new Error(await response.text())

  console.log(`Story "${fullSlug}" mise à jour`)
  return current
}

function textField(displayName: string, pos: number, required = false) {
  return { type: 'text', pos, display_name: displayName, required, translatable: true }
}

function textareaField(displayName: string, pos: number, required = false) {
  return { type: 'textarea', pos, display_name: displayName, required, translatable: true }
}

function imageField(displayName: string, pos: number, required = false) {
  return { type: 'image', pos, display_name: displayName, required }
}

function multiassetField(displayName: string, pos: number) {
  return { type: 'multiasset', pos, display_name: displayName }
}

function booleanField(displayName: string, pos: number) {
  return { type: 'boolean', pos, display_name: displayName }
}

function datetimeField(displayName: string, pos: number, required = false) {
  return { type: 'datetime', pos, display_name: displayName, required }
}

function optionField(displayName: string, pos: number, options: readonly string[]) {
  return {
    type: 'option',
    pos,
    display_name: displayName,
    options: options.map((value) => ({ name: value, value })),
  }
}

function linkField(displayName: string, pos: number, required = false) {
  return { type: 'multilink', pos, display_name: displayName, required }
}

function bloksField(displayName: string, pos: number, componentWhitelist: readonly string[]) {
  return {
    type: 'bloks',
    pos,
    display_name: displayName,
    restrict_components: true,
    component_whitelist: componentWhitelist,
  }
}

function blok(component: string, fields: Record<string, unknown>) {
  return {
    _uid: crypto.randomUUID(),
    component,
    ...fields,
  }
}

function seoDescription(excerpt: string) {
  return excerpt.length > 155 ? `${excerpt.slice(0, 152).trim()}...` : excerpt
}

async function main() {
  console.log('Mise à jour des composants Storyblok...')
  const existingComponents = await getComponents()

  for (const component of COMPONENTS) {
    await upsertComponent(existingComponents, component)
    await sleep(200)
  }

  console.log('\nCréation de la structure Content...')
  const stories = await getStories()

  for (const folder of FOLDERS) {
    await upsertStory(stories, {
      name: folder.name,
      slug: folder.slug,
      parentId: 0,
      isFolder: true,
    })
    await sleep(200)
  }

  const blogFolder = stories.find((story) => story.full_slug === 'blog')
  const categoriesFolder = stories.find((story) => story.full_slug === '_categories')
  const settingsFolder = stories.find((story) => story.full_slug === '_settings')

  if (!blogFolder || !categoriesFolder || !settingsFolder) {
    throw new Error('Dossiers Storyblok introuvables après création')
  }

  await upsertStory(stories, {
    name: 'Page blog',
    slug: 'index',
    parentId: blogFolder.id,
    path: '/blog',
    content: {
      component: 'blog_page',
      title: 'Journal',
      description: 'Adresses, quartiers et conseils pour préparer un séjour Alto.',
      seo_title: 'Journal Alto',
      seo_description: 'Adresses, quartiers et conseils pour préparer un séjour Alto.',
      og_image: '',
      no_index: false,
    },
  })

  for (const category of BLOG_CATEGORIES) {
    await upsertStory(stories, {
      name: category.name,
      slug: category.slug,
      parentId: categoriesFolder.id,
      content: {
        component: 'blog_category',
        name: category.name,
        description: category.description,
      },
    })
    await sleep(200)
  }

  for (const article of ARTICLES) {
    await upsertStory(stories, {
      name: article.name,
      slug: article.slug,
      parentId: blogFolder.id,
      path: `/blog/${article.slug}`,
      content: {
        component: 'blog_article',
        title: article.name,
        excerpt: article.excerpt,
        cover_image: '',
        hero_image: '',
        category: article.category,
        section: article.section,
        published_at: article.publishedAt,
        is_featured: article.slug === 'le-marais-a-hauteur-de-regard',
        body: article.body.map((section) => blok(section.component, section)),
        related_articles: '',
        seo_title: article.name,
        seo_description: seoDescription(article.excerpt),
        og_image: '',
        no_index: false,
      },
    })
    await sleep(200)
  }

  await upsertStory(stories, {
    name: 'Paramètres globaux',
    slug: 'site',
    parentId: settingsFolder.id,
    content: {
      component: 'site_settings',
      site_name: 'Alto',
      booking_cta_label: 'Réserver',
      booking_cta_link: { linktype: 'story', cached_url: '/appartements' },
      contact_email: '',
    },
  })

  await upsertStory(stories, {
    name: 'Navigation',
    slug: 'navigation',
    parentId: settingsFolder.id,
    content: {
      component: 'navigation_settings',
      main_links: [
        blok('navigation_link', {
          label: 'Appartements',
          link: { linktype: 'url', url: '/appartements' },
        }),
        blok('navigation_link', { label: 'Journal', link: { linktype: 'url', url: '/blog' } }),
        blok('navigation_link', {
          label: 'Notre histoire',
          link: { linktype: 'url', url: '/notre-histoire' },
        }),
      ],
      cta: [
        blok('cta_button', {
          label: 'Réserver',
          link: { linktype: 'url', url: '/appartements' },
        }),
      ],
    },
  })

  await upsertStory(stories, {
    name: 'Footer',
    slug: 'footer',
    parentId: settingsFolder.id,
    content: {
      component: 'footer_settings',
      columns: [
        blok('footer_column', {
          title: 'Alto',
          links: [
            blok('navigation_link', {
              label: 'Appartements',
              link: { linktype: 'url', url: '/appartements' },
            }),
            blok('navigation_link', { label: 'Journal', link: { linktype: 'url', url: '/blog' } }),
            blok('navigation_link', {
              label: 'Notre histoire',
              link: { linktype: 'url', url: '/notre-histoire' },
            }),
          ],
        }),
      ],
      legal_links: [
        blok('navigation_link', { label: 'CGV', link: { linktype: 'url', url: '/cgv' } }),
        blok('navigation_link', {
          label: 'Confidentialité',
          link: { linktype: 'url', url: '/confidentialite' },
        }),
      ],
      social_links: [],
      newsletter_text: '',
    },
  })

  console.log('\nSetup Storyblok éditorial terminé.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

export {}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
