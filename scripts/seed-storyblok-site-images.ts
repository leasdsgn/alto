/**
 * Script pour créer le composant Storyblok "site_images"
 * et l'entrée "site-images" utilisée par le front.
 *
 * Usage :
 * STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-images
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

async function createComponent() {
  const schema = Object.fromEntries(
    IMAGE_FIELDS.map(([key, displayName], index) => [
      key,
      {
        type: 'image',
        pos: index,
        display_name: displayName,
      },
    ]),
  )

  const res = await fetch(`${API}/components`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      component: {
        name: 'site_images',
        display_name: 'Site images',
        is_root: true,
        is_nestable: false,
        schema,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    if (text.includes('already exists')) {
      console.log('Component "site_images" existe déjà')
      return
    }
    console.error('Erreur création component site_images:', text)
    return
  }

  console.log('Component "site_images" créé')
}

async function createStory() {
  const content = Object.fromEntries(IMAGE_FIELDS.map(([key]) => [key, '']))

  const res = await fetch(`${API}/stories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      story: {
        name: 'Site images',
        slug: 'site-images',
        parent_id: 0,
        content: {
          component: 'site_images',
          ...content,
        },
      },
      publish: 1,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    if (text.includes('already exists') || text.includes('has already been taken')) {
      console.log('Story "site-images" existe déjà')
      return
    }
    console.error('Erreur création story site-images:', text)
    return
  }

  console.log('Story "site-images" créée')
}

async function main() {
  console.log('Création du composant site_images...')
  await createComponent()

  console.log('\nCréation de la story site-images...')
  await createStory()

  console.log('\nTerminé.')
}

main()

export {}
