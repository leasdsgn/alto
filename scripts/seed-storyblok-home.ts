/**
 * Crée ou met à jour la homepage éditable dans Storyblok.
 *
 * Usage :
 * STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-home
 */

const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '291441851126938'

if (!TOKEN) {
  console.error('STORYBLOK_PERSONAL_TOKEN requis')
  process.exit(1)
}

const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`
const STORY_SLUG = 'site-images'

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
  content: Record<string, unknown>
}

interface StoryblokStoryResponse {
  story?: StoryblokStory
  stories?: StoryblokStory[]
}

const IMAGE_FIELDS = [
  ['footer_background', 'Global - Footer - Image de fond'],
  ['shared_location_avatar_1', 'Global - Avatars lieux - Image 1'],
  ['shared_location_avatar_2', 'Global - Avatars lieux - Image 2'],
  ['shared_location_avatar_3', 'Global - Avatars lieux - Image 3'],
  ['shared_traveler_avatar_1', 'Global - Avatars voyageurs - Image 1'],
  ['shared_traveler_avatar_2', 'Global - Avatars voyageurs - Image 2'],
  ['shared_traveler_avatar_3', 'Global - Avatars voyageurs - Image 3'],
  ['home_hero_background', 'Accueil - Hero - Image principale'],
  ['home_hero_overlay', 'Accueil - Hero - Image superposée'],
  ['home_experience_arrival', 'Accueil - À propos carousel - Carte espaces'],
  ['home_experience_checkin', 'Accueil - À propos carousel - Carte localisation'],
  ['home_experience_checkout', 'Accueil - À propos carousel - Carte confort'],
  ['about_concept_lounge', 'À propos - Hero - Grande photo gauche'],
  ['about_concept_corridor', 'À propos - Garanties - Photo latérale'],
  ['about_concept_chair', 'À propos - Bloc concept - Photo fauteuil'],
  ['about_founder_paul', 'À propos - Fondateurs - Paul'],
  ['about_founder_mayeul', 'À propos - Fondateurs - Mayeul'],
  ['about_founder_benjamin', 'À propos - Fondateurs - Benjamin'],
  ['blog_story_arrival', 'Blog - Article mis en avant - Image arrivée'],
  ['blog_story_checkin', 'Blog - Article mis en avant - Image check-in'],
  ['lyon_hero_background', 'Lyon - Hero - Image principale'],
  ['lyon_bellecour', 'Lyon - Quartiers - Bellecour'],
  ['lyon_vieux_lyon', 'Lyon - Quartiers - Vieux Lyon'],
  ['lyon_terreaux', 'Lyon - Quartiers - Terreaux'],
  ['lyon_services', 'Lyon - Services - Image section'],
  ['lyon_press_logo', 'Lyon - Presse - Logo presse'],
  ['lyon_monocle_logo', 'Lyon - Presse - Logo Monocle'],
  ['page_contact_hero', 'Contact - Hero - Image principale'],
  ['page_apartments_hero', 'Appartements - Hero - Image principale'],
  ['page_invest_hero', 'Investir - Hero - Image principale'],
  ['page_invest_model', 'Investir - Modèle - Image section'],
] as const

const HOME_COMPONENTS = [
  'home_hero_section',
  'home_about_section',
  'home_apartments_section',
  'home_experience_section',
  'home_testimonials_section',
  'home_services_section',
  'home_blog_section',
]

const COMPONENTS = [
  {
    name: 'home_experience_panel',
    display_name: 'Accueil - Carte expérience',
    is_root: false,
    is_nestable: true,
    schema: {
      label: textField('Label', 0),
      title: textareaField('Titre', 1),
      image: imageField('Image', 2),
    },
  },
  {
    name: 'home_testimonial_item',
    display_name: 'Accueil - Témoignage',
    is_root: false,
    is_nestable: true,
    schema: {
      quote: textareaField('Citation', 0),
      name: textField('Nom', 1),
      apartment: textField('Appartement', 2),
      stay: textField('Séjour', 3),
    },
  },
  {
    name: 'home_service_item',
    display_name: 'Accueil - Service',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textField('Titre', 0),
      description: textareaField('Description', 1),
      icon: imageField('Icône', 2),
    },
  },
  {
    name: 'home_hero_section',
    display_name: 'Accueil - Hero',
    is_root: false,
    is_nestable: true,
    schema: {
      title_part_1: textField('Titre - Mot 1', 0),
      title_part_2: textField('Titre - Mot 2', 1),
      title_part_3: textField('Titre - Mot 3', 2),
      background_image: imageField('Image principale', 3),
      overlay_image: imageField('Image superposée', 4),
    },
  },
  {
    name: 'home_about_section',
    display_name: 'Accueil - Introduction',
    is_root: false,
    is_nestable: true,
    schema: {
      kicker: textField('Phrase courte', 0),
      quote: textareaField('Texte principal', 1),
      locations_label: textField('Statistique lieux', 2),
      travelers_label: textField('Statistique voyageurs', 3),
      rating_label: textField('Statistique note', 4),
      location_avatar_1: imageField('Avatar lieux 1', 5),
      location_avatar_2: imageField('Avatar lieux 2', 6),
      location_avatar_3: imageField('Avatar lieux 3', 7),
      traveler_avatar_1: imageField('Avatar voyageurs 1', 8),
      traveler_avatar_2: imageField('Avatar voyageurs 2', 9),
      traveler_avatar_3: imageField('Avatar voyageurs 3', 10),
    },
  },
  {
    name: 'home_apartments_section',
    display_name: 'Accueil - Appartements',
    is_root: false,
    is_nestable: true,
    schema: {
      paris_title: textField('Titre Paris', 0),
      lyon_title: textField('Titre Lyon', 1),
    },
  },
  {
    name: 'home_experience_section',
    display_name: 'Accueil - À propos carousel',
    is_root: false,
    is_nestable: true,
    schema: {
      label: textField('Label', 0),
      button_label: textField('Bouton', 1),
      panels: bloksField('Cartes', 2, ['home_experience_panel']),
    },
  },
  {
    name: 'home_testimonials_section',
    display_name: 'Accueil - Témoignages',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textField('Titre', 0),
      items: bloksField('Témoignages', 1, ['home_testimonial_item']),
    },
  },
  {
    name: 'home_services_section',
    display_name: 'Accueil - Services',
    is_root: false,
    is_nestable: true,
    schema: {
      items: bloksField('Services', 0, ['home_service_item']),
    },
  },
  {
    name: 'home_blog_section',
    display_name: 'Accueil - Blog',
    is_root: false,
    is_nestable: true,
    schema: {
      description: textareaField('Description', 0),
      button_label: textField('Bouton', 1),
      fallback_subtitle: textField('Sous-titre par défaut', 2),
      reading_time: textField('Temps de lecture', 3),
      previous_label: textField('Label précédent', 4),
      next_label: textField('Label suivant', 5),
    },
  },
  {
    name: 'site_images',
    display_name: 'Site images',
    is_root: true,
    is_nestable: false,
    schema: {
      sections: bloksField('Accueil - Sections éditables', 0, HOME_COMPONENTS),
      ...Object.fromEntries(
        IMAGE_FIELDS.map(([key, displayName], index) => [key, imageField(displayName, index + 1)]),
      ),
    },
  },
] as const

async function getComponents() {
  const res = await fetch(`${API}/components`, { headers })
  if (!res.ok) throw new Error(await res.text())
  const data = (await res.json()) as ComponentListResponse
  return data.components ?? []
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

async function findStory() {
  const res = await fetch(`${API}/stories/?text_search=${encodeURIComponent(STORY_SLUG)}`, {
    headers,
  })
  if (!res.ok) throw new Error(await res.text())

  const data = (await res.json()) as StoryblokStoryResponse
  return data.stories?.find((story) => story.slug === STORY_SLUG) ?? null
}

async function upsertStory() {
  const story = await findStory()
  const currentContent = story?.content ?? {}
  const currentSections = Array.isArray(currentContent.sections) ? currentContent.sections : []
  const content = {
    ...Object.fromEntries(IMAGE_FIELDS.map(([key]) => [key, currentContent[key] ?? ''])),
    ...currentContent,
    component: 'site_images',
    sections: currentSections.length > 0 ? currentSections : defaultSections(currentContent),
  }

  if (!story) {
    const res = await fetch(`${API}/stories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        story: {
          name: 'Site images',
          slug: STORY_SLUG,
          parent_id: 0,
          content,
        },
        publish: 1,
      }),
    })
    if (!res.ok) throw new Error(await res.text())
    console.log('Story "site-images" créée')
    return
  }

  const res = await fetch(`${API}/stories/${story.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      story: {
        ...story,
        content,
      },
      force_update: 1,
      publish: 1,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  console.log('Story "site-images" mise à jour')
}

function textField(displayName: string, pos: number) {
  return { type: 'text', pos, display_name: displayName, translatable: true }
}

function textareaField(displayName: string, pos: number) {
  return { type: 'textarea', pos, display_name: displayName, translatable: true }
}

function imageField(displayName: string, pos: number) {
  return { type: 'image', pos, display_name: displayName }
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

function defaultSections(content: Record<string, unknown>) {
  return [
    blok('home_hero_section', {
      title_part_1: 'LIFTED',
      title_part_2: 'MINDFUL',
      title_part_3: 'HOME',
      background_image: content.home_hero_background ?? '',
      overlay_image: content.home_hero_overlay ?? '',
    }),
    blok('home_about_section', {
      kicker: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
      quote:
        'Nous transformons des espaces singuliers en lieux de vie élégants, bien pensés et confortables. Notre mission : permettre aux voyageurs de vivre des séjours sans frictions aux plus belles adresses.',
      locations_label: '13 locations',
      travelers_label: '4 500+ voyageurs',
      rating_label: '4,9 de note moyenne',
      location_avatar_1: content.shared_location_avatar_1 ?? '',
      location_avatar_2: content.shared_location_avatar_2 ?? '',
      location_avatar_3: content.shared_location_avatar_3 ?? '',
      traveler_avatar_1: content.shared_traveler_avatar_1 ?? '',
      traveler_avatar_2: content.shared_traveler_avatar_2 ?? '',
      traveler_avatar_3: content.shared_traveler_avatar_3 ?? '',
    }),
    blok('home_apartments_section', {
      paris_title: 'Nos appartements à Paris',
      lyon_title: 'Nos appartements à Lyon',
    }),
    blok('home_experience_section', {
      label: 'À PROPOS',
      button_label: 'En savoir plus',
      panels: [
        blok('home_experience_panel', {
          label: 'Espaces',
          title: 'Espaces de charme, singuliers, atypiques, et bien pensés.',
          image: content.home_experience_arrival ?? '',
        }),
        blok('home_experience_panel', {
          label: 'Localisation',
          title: 'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
          image: content.home_experience_checkin ?? '',
        }),
        blok('home_experience_panel', {
          label: 'Confort',
          title: 'Standards hôteliers. Soin des détails, équipements modernes.',
          image: content.home_experience_checkout ?? '',
        }),
      ],
    }),
    blok('home_testimonials_section', {
      title: 'Témoignages',
      items: [
        blok('home_testimonial_item', {
          quote:
            'On s’est sentis chez nous dès la première minute. L’appartement est exactement comme sur les photos, en mieux.',
          name: 'Marie & Thomas',
          apartment: 'Le Faubourg',
          stay: 'Avril 2026',
        }),
        blok('home_testimonial_item', {
          quote:
            'Le check-in autonome à minuit, sans stress. Et le quartier est parfait pour découvrir Paris à pied.',
          name: 'James W.',
          apartment: 'L’Opera',
          stay: 'Mars 2026',
        }),
        blok('home_testimonial_item', {
          quote:
            'Trois nuits, et on a déjà réservé pour l’été. Le Saint-Germain est devenu notre adresse parisienne.',
          name: 'Sofia & Leo',
          apartment: 'Le Saint-Germain',
          stay: 'Février 2026',
        }),
      ],
    }),
    blok('home_services_section', {
      items: [
        blok('home_service_item', {
          title: 'Self check-in',
          description: 'Accès autonome à toute heure, sans attente ni comptoir.',
          icon: '/images/icons/checkin.svg',
        }),
        blok('home_service_item', {
          title: 'Ménage',
          description: 'Linge de maison inclus, ménage professionnel entre chaque séjour.',
          icon: '/images/icons/cleaning.svg',
        }),
        blok('home_service_item', {
          title: 'Support 24/24',
          description: 'Un gestionnaire disponible à tout moment pour vous accompagner.',
          icon: '/images/icons/support.svg',
        }),
        blok('home_service_item', {
          title: 'Pas de frais cachés',
          description: 'Prix nets, sans surprise. Ce que vous voyez est ce que vous payez.',
          icon: '/images/icons/wallet.svg',
        }),
      ],
    }),
    blok('home_blog_section', {
      description:
        'Depuis 2017, nous accompagnons les voyageurs pour qu’ils vivent des expériences inoubliables aux plus belles adresses.',
      button_label: 'Tous nos conseils',
      fallback_subtitle: 'Un quartier vivant, une adresse au cœur des plus beaux quartiers.',
      reading_time: '5 min de lecture',
      previous_label: 'Précédent',
      next_label: 'Suivant',
    }),
  ]
}

async function main() {
  const existingComponents = await getComponents()

  for (const component of COMPONENTS) {
    await sleep(250)
    await upsertComponent(existingComponents, component)
  }

  await upsertStory()
  console.log('Setup Storyblok homepage terminé')
}

main()

export {}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
