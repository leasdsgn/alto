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
  ['footer_background', 'Footer background'],
  ['shared_location_avatar_1', 'Shared location avatar 1'],
  ['shared_location_avatar_2', 'Shared location avatar 2'],
  ['shared_location_avatar_3', 'Shared location avatar 3'],
  ['shared_traveler_avatar_1', 'Shared traveler avatar 1'],
  ['shared_traveler_avatar_2', 'Shared traveler avatar 2'],
  ['shared_traveler_avatar_3', 'Shared traveler avatar 3'],
  ['home_hero_background', 'Home hero background'],
  ['home_hero_overlay', 'Home hero overlay'],
  ['home_experience_arrival', 'Home experience arrival'],
  ['home_experience_checkin', 'Home experience checkin'],
  ['home_experience_checkout', 'Home experience checkout'],
  ['about_concept_lounge', 'About concept lounge'],
  ['about_concept_corridor', 'About concept corridor'],
  ['about_founder_paul', 'About founder Paul'],
  ['about_founder_mayeul', 'About founder Mayeul'],
  ['about_founder_benjamin', 'About founder Benjamin'],
  ['blog_story_arrival', 'Blog story arrival'],
  ['blog_story_checkin', 'Blog story checkin'],
  ['lyon_hero_background', 'Lyon hero background'],
  ['lyon_bellecour', 'Lyon Bellecour'],
  ['lyon_vieux_lyon', 'Lyon Vieux Lyon'],
  ['lyon_terreaux', 'Lyon Terreaux'],
  ['lyon_services', 'Lyon services'],
  ['lyon_press_logo', 'Lyon press logo'],
  ['lyon_monocle_logo', 'Lyon Monocle logo'],
  ['page_contact_hero', 'Contact hero'],
  ['page_apartments_hero', 'Apartments hero'],
  ['page_invest_hero', 'Invest hero'],
  ['page_invest_model', 'Invest model'],
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
