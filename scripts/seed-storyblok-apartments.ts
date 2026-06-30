/**
 * Script pour créer les composants Storyblok de la couche éditoriale appartement.
 *
 * Usage :
 * STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-apartments
 */

const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '291441851126938'
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`

if (!TOKEN) {
  console.error('STORYBLOK_PERSONAL_TOKEN requis')
  process.exit(1)
}

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

interface StoryListResponse {
  stories?: Array<{
    id: number
    slug: string
    full_slug: string
  }>
}

const COMPONENTS = [
  {
    name: 'apartment_faq_item',
    display_name: 'Appartement - Question FAQ',
    is_root: false,
    is_nestable: true,
    schema: {
      question: {
        type: 'text',
        display_name: 'Question',
        pos: 0,
        required: true,
        translatable: true,
      },
      answer: {
        type: 'textarea',
        display_name: 'Réponse',
        pos: 1,
        required: true,
        translatable: true,
      },
    },
  },
  {
    name: 'apartment_feature_item',
    display_name: 'Appartement - Point fort',
    is_root: false,
    is_nestable: true,
    schema: {
      title: {
        type: 'text',
        display_name: 'Titre',
        pos: 0,
        required: true,
        translatable: true,
      },
      description: {
        type: 'textarea',
        display_name: 'Description',
        pos: 1,
        required: true,
        translatable: true,
      },
    },
  },
  {
    name: 'apartment_global_faq',
    display_name: 'FAQ globale appartements',
    is_root: true,
    is_nestable: false,
    schema: {
      items: {
        type: 'bloks',
        display_name: 'Questions globales',
        restrict_components: true,
        component_whitelist: ['apartment_faq_item'],
        pos: 0,
      },
    },
  },
  {
    name: 'apartment_editorial',
    display_name: 'Appartement éditorial',
    is_root: true,
    is_nestable: false,
    schema: {
      guesty_id: {
        type: 'text',
        display_name: 'Guesty ID',
        pos: 0,
        required: true,
      },
      slug: {
        type: 'text',
        display_name: 'Slug front',
        pos: 1,
      },
      visible: {
        type: 'boolean',
        display_name: 'Visible sur le site',
        default_value: true,
        pos: 2,
      },
      title: {
        type: 'text',
        display_name: 'Titre éditorial optionnel',
        pos: 3,
        translatable: true,
      },
      intro: {
        type: 'textarea',
        display_name: 'Introduction éditoriale',
        pos: 4,
        translatable: true,
      },
      description: {
        type: 'textarea',
        display_name: 'Description longue',
        pos: 5,
        translatable: true,
      },
      space: {
        type: 'textarea',
        display_name: 'Détails de l’espace',
        pos: 6,
        translatable: true,
      },
      neighborhood_name: {
        type: 'text',
        display_name: 'Nom du quartier',
        pos: 7,
        translatable: true,
      },
      neighborhood_description: {
        type: 'textarea',
        display_name: 'Description du quartier',
        pos: 8,
        translatable: true,
      },
      transit: {
        type: 'textarea',
        display_name: 'Accès et transports',
        pos: 9,
        translatable: true,
      },
      features: {
        type: 'bloks',
        display_name: 'Points forts éditoriaux',
        restrict_components: true,
        component_whitelist: ['apartment_feature_item'],
        pos: 10,
      },
      faq_extra: {
        type: 'bloks',
        display_name: 'Questions supplémentaires',
        restrict_components: true,
        component_whitelist: ['apartment_faq_item'],
        pos: 11,
      },
      review_quote: {
        type: 'textarea',
        display_name: 'Témoignage - citation',
        pos: 12,
        translatable: true,
      },
      review_name: {
        type: 'text',
        display_name: 'Témoignage - nom',
        pos: 13,
        translatable: true,
      },
      review_stay: {
        type: 'text',
        display_name: 'Témoignage - séjour',
        pos: 14,
        translatable: true,
      },
      order: {
        type: 'number',
        display_name: 'Ordre d’affichage',
        pos: 15,
      },
    },
  },
] as const

const GLOBAL_FAQ_ITEMS = [
  {
    component: 'apartment_faq_item',
    question: 'Comment fonctionne le check-in ?',
    answer:
      'L’arrivée se fait en autonomie avec des instructions envoyées avant le séjour. L’équipe reste disponible si vous avez besoin d’aide.',
  },
  {
    component: 'apartment_faq_item',
    question: 'Le ménage est-il inclus ?',
    answer:
      'Le ménage de départ est prévu et l’appartement est préparé avant votre arrivée pour un séjour sans logistique supplémentaire.',
  },
  {
    component: 'apartment_faq_item',
    question: 'Puis-je réserver en direct ?',
    answer:
      'Oui. La réservation peut se faire directement sur Alto avec le même niveau d’information, un contact plus direct et un suivi plus simple.',
  },
  {
    component: 'apartment_faq_item',
    question: 'Que comprend le prix affiché ?',
    answer:
      'Le tarif couvre le logement, le linge de maison, le Wi-Fi et l’accompagnement de l’équipe. Les conditions exactes restent précisées au moment de la réservation.',
  },
]

async function getComponents() {
  const res = await fetch(`${API}/components`, { headers })
  if (!res.ok) throw new Error(await res.text())
  const data = (await res.json()) as ComponentListResponse
  return data.components ?? []
}

async function upsertComponent(existing: StoryblokComponent[], component: (typeof COMPONENTS)[number]) {
  const current = existing.find((item) => item.name === component.name)
  const payload = {
    component,
  }

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

async function upsertGlobalFaqStory() {
  const existing = await findStory('global-faq')
  const story = {
    name: 'FAQ globale appartements',
    slug: 'global-faq',
    content: {
      component: 'apartment_global_faq',
      items: GLOBAL_FAQ_ITEMS,
    },
  }

  if (!existing) {
    const res = await fetch(`${API}/stories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ story, publish: 1 }),
    })
    if (!res.ok) throw new Error(await res.text())
    console.log('Story "global-faq" créée')
    return
  }

  const res = await fetch(`${API}/stories/${existing.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ story, force_update: 1, publish: 1 }),
  })
  if (!res.ok) throw new Error(await res.text())
  console.log('Story "global-faq" mise à jour')
}

async function findStory(slug: string) {
  const res = await fetch(`${API}/stories?with_slug=${slug}`, { headers })
  if (!res.ok) throw new Error(await res.text())
  const data = (await res.json()) as StoryListResponse
  return data.stories?.find((story) => story.full_slug === slug || story.slug === slug) ?? null
}

async function main() {
  const existingComponents = await getComponents()

  for (const component of COMPONENTS) {
    await upsertComponent(existingComponents, component)
  }

  await upsertGlobalFaqStory()
  console.log('Setup Storyblok appartements terminé')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

export {}
