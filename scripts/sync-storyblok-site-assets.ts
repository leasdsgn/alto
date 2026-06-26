/**
 * Script pour :
 * 1. Créer / réutiliser un dossier Assets Storyblok
 * 2. Uploader les images locales du site
 * 3. Injecter ces assets dans la story "site-images"
 *
 * Usage :
 * STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:sync-assets
 */

import path from 'node:path'

declare const Bun: {
  file: (filePath: string) => Blob & { exists: () => Promise<boolean> }
}

const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '291441851126938'
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`
const ASSET_FOLDER_NAME = 'alto-site-images'
const STORY_SLUG = 'site-images'
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const STORYBLOK_ABOUT_CONCEPT_CHAIR_URL =
  'https://a.storyblok.com/f/291441851126938/da52da72c6/images-about-concept-chair.jpg'

if (!TOKEN) {
  console.error('STORYBLOK_PERSONAL_TOKEN requis')
  process.exit(1)
}

const headers = {
  Authorization: TOKEN,
}

const jsonHeaders = {
  ...headers,
  'Content-Type': 'application/json',
}

type SiteImageField =
  | {
      source: 'local'
      field: string
      label: string
      localPath: string
    }
  | {
      source: 'storyblok'
      field: string
      label: string
      storyblokUrl: string
    }

const SITE_IMAGE_FIELDS: SiteImageField[] = [
  {
    source: 'local',
    field: 'footer_background',
    label: 'Global - Footer - Image de fond',
    localPath: 'images/footer-gradient.webp',
  },
  {
    source: 'local',
    field: 'shared_location_avatar_1',
    label: 'Global - Avatars lieux - Image 1',
    localPath: 'images/blog-1.jpg',
  },
  {
    source: 'local',
    field: 'shared_location_avatar_2',
    label: 'Global - Avatars lieux - Image 2',
    localPath: 'images/hero-home.webp',
  },
  {
    source: 'local',
    field: 'shared_location_avatar_3',
    label: 'Global - Avatars lieux - Image 3',
    localPath: 'images/blog-3.jpg',
  },
  {
    source: 'local',
    field: 'shared_traveler_avatar_1',
    label: 'Global - Avatars voyageurs - Image 1',
    localPath: 'images/avatars/voyageur-1.png',
  },
  {
    source: 'local',
    field: 'shared_traveler_avatar_2',
    label: 'Global - Avatars voyageurs - Image 2',
    localPath: 'images/avatars/voyageur-2.png',
  },
  {
    source: 'local',
    field: 'shared_traveler_avatar_3',
    label: 'Global - Avatars voyageurs - Image 3',
    localPath: 'images/avatars/voyageur-3.png',
  },
  {
    source: 'local',
    field: 'home_hero_background',
    label: 'Accueil - Hero - Image principale',
    localPath: 'images/hero-room.webp',
  },
  {
    source: 'local',
    field: 'home_hero_overlay',
    label: 'Accueil - Hero - Image superposée',
    localPath: 'images/hero-overlay.webp',
  },
  {
    source: 'local',
    field: 'home_experience_arrival',
    label: 'Accueil - À propos carousel - Carte espaces',
    localPath: 'images/experience-espaces.png',
  },
  {
    source: 'local',
    field: 'home_experience_checkin',
    label: 'Accueil - À propos carousel - Carte localisation',
    localPath: 'images/experience-localisation.png',
  },
  {
    source: 'local',
    field: 'home_experience_checkout',
    label: 'Accueil - À propos carousel - Carte confort',
    localPath: 'images/blog-3.jpg',
  },
  {
    source: 'local',
    field: 'about_concept_lounge',
    label: 'À propos - Hero - Grande photo gauche',
    localPath: 'images/about/concept-lounge.jpg',
  },
  {
    source: 'local',
    field: 'about_concept_corridor',
    label: 'À propos - Garanties - Photo latérale',
    localPath: 'images/about/concept-corridor.jpg',
  },
  {
    source: 'storyblok',
    field: 'about_concept_chair',
    label: 'À propos - Bloc concept - Photo fauteuil',
    storyblokUrl: STORYBLOK_ABOUT_CONCEPT_CHAIR_URL,
  },
  {
    source: 'local',
    field: 'about_founder_paul',
    label: 'À propos - Fondateurs - Paul',
    localPath: 'images/about/founder-paul.jpg',
  },
  {
    source: 'local',
    field: 'about_founder_mayeul',
    label: 'À propos - Fondateurs - Mayeul',
    localPath: 'images/about/founder-mayeul.jpg',
  },
  {
    source: 'local',
    field: 'about_founder_benjamin',
    label: 'À propos - Fondateurs - Benjamin',
    localPath: 'images/about/founder-benjamin.jpg',
  },
  {
    source: 'local',
    field: 'blog_story_arrival',
    label: 'Blog - Article mis en avant - Image arrivée',
    localPath: 'images/alto-salon.jpg',
  },
  {
    source: 'local',
    field: 'blog_story_checkin',
    label: 'Blog - Article mis en avant - Image check-in',
    localPath: 'images/blog-3.jpg',
  },
  {
    source: 'local',
    field: 'lyon_hero_background',
    label: 'Lyon - Hero - Image principale',
    localPath: 'images/lyon/hero-lyon.jpg',
  },
  {
    source: 'local',
    field: 'lyon_bellecour',
    label: 'Lyon - Quartiers - Bellecour',
    localPath: 'images/lyon/apt-bellecour.jpg',
  },
  {
    source: 'local',
    field: 'lyon_vieux_lyon',
    label: 'Lyon - Quartiers - Vieux Lyon',
    localPath: 'images/lyon/apt-vieux-lyon.jpg',
  },
  {
    source: 'local',
    field: 'lyon_terreaux',
    label: 'Lyon - Quartiers - Terreaux',
    localPath: 'images/lyon/apt-terreaux.jpg',
  },
  {
    source: 'local',
    field: 'lyon_services',
    label: 'Lyon - Services - Image section',
    localPath: 'images/lyon/services-image.jpg',
  },
  {
    source: 'local',
    field: 'lyon_press_logo',
    label: 'Lyon - Presse - Logo presse',
    localPath: 'images/lyon/press-logo.png',
  },
  {
    source: 'local',
    field: 'lyon_monocle_logo',
    label: 'Lyon - Presse - Logo Monocle',
    localPath: 'images/lyon/monocle-logo.png',
  },
  {
    source: 'local',
    field: 'page_contact_hero',
    label: 'Contact - Hero - Image principale',
    localPath: 'images/alto-salon.jpg',
  },
  {
    source: 'local',
    field: 'page_apartments_hero',
    label: 'Appartements - Hero - Image principale',
    localPath: 'images/alto-salon.jpg',
  },
  {
    source: 'local',
    field: 'page_invest_hero',
    label: 'Investir - Hero - Image principale',
    localPath: 'images/alto-salon.jpg',
  },
  {
    source: 'local',
    field: 'page_invest_model',
    label: 'Investir - Modèle - Image section',
    localPath: 'images/alto-salon.jpg',
  },
]

interface StoryblokAssetFolder {
  id: number
  name: string
  parent_id?: number | null
}

interface StoryblokAsset {
  id: number
  filename: string
  short_filename?: string
  asset_folder_id?: number
  alt?: string | null
  title?: string | null
  focus?: string | null
  copyright?: string | null
}

interface StorySummary {
  id: number
  name: string
  slug: string
  full_slug?: string
}

interface StoryDetails extends StorySummary {
  parent_id: number
  content: Record<string, unknown>
}

interface SignedResponse {
  id: number
  post_url: string
  fields: Record<string, string>
}

async function main() {
  const folder = await ensureAssetFolder()
  console.log(`Dossier assets : ${folder.name} (#${folder.id})`)

  const existingAssets = await getAssetsByFilename(folder.id)
  const uploadedByLocalPath = new Map<string, StoryblokAsset>()

  for (const imageField of SITE_IMAGE_FIELDS) {
    if (imageField.source !== 'local') continue
    if (uploadedByLocalPath.has(imageField.localPath)) continue

    const asset = await ensureAsset(imageField.localPath, folder.id, existingAssets)
    uploadedByLocalPath.set(imageField.localPath, asset)
    console.log(`Asset prêt : ${imageField.localPath} -> ${asset.filename}`)
  }

  const story = await getSiteImagesStory()
  const nextContent = {
    ...story.content,
    component: 'site_images',
  } as Record<string, unknown>

  for (const imageField of SITE_IMAGE_FIELDS) {
    if (imageField.source === 'storyblok') {
      if (!hasStoryAssetUrl(nextContent[imageField.field])) {
        nextContent[imageField.field] = toRemoteStoryAssetObject(
          imageField.storyblokUrl,
          imageField.label,
        )
      }
      continue
    }

    const asset = uploadedByLocalPath.get(imageField.localPath)
    if (!asset) {
      throw new Error(`Asset introuvable pour ${imageField.localPath}`)
    }

    nextContent[imageField.field] = toStoryAssetObject(asset, imageField.label)
  }

  await updateStory({
    ...story,
    content: nextContent,
  })

  console.log('\nStory "site-images" mise à jour et publiée.')
}

async function ensureAssetFolder() {
  const response = await fetch(`${API}/asset_folders/`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Impossible de lister les dossiers assets: ${await response.text()}`)
  }

  const data = (await response.json()) as { asset_folders?: StoryblokAssetFolder[] }
  const existing = (data.asset_folders ?? []).find(
    (folder) =>
      folder.name === ASSET_FOLDER_NAME && (folder.parent_id === 0 || folder.parent_id == null),
  )

  if (existing) return existing

  const createResponse = await fetch(`${API}/asset_folders/`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      asset_folder: {
        name: ASSET_FOLDER_NAME,
        parent_id: 0,
      },
    }),
  })

  if (!createResponse.ok) {
    throw new Error(`Impossible de créer le dossier assets: ${await createResponse.text()}`)
  }

  const created = (await createResponse.json()) as { asset_folder: StoryblokAssetFolder }
  return created.asset_folder
}

async function getAssetsByFilename(folderId: number) {
  const response = await fetch(
    `${API}/assets/?in_folder=${folderId}&sort_by=short_filename:asc&per_page=100`,
    {
      headers,
    },
  )

  if (!response.ok) {
    throw new Error(`Impossible de lister les assets: ${await response.text()}`)
  }

  const data = (await response.json()) as { assets?: StoryblokAsset[] }
  const map = new Map<string, StoryblokAsset>()

  for (const asset of data.assets ?? []) {
    if (!asset.short_filename) continue
    map.set(asset.short_filename, asset)
  }

  return map
}

async function ensureAsset(
  localPath: string,
  folderId: number,
  existingAssets: Map<string, StoryblokAsset>,
) {
  const absolutePath = path.resolve(PUBLIC_DIR, localPath)
  const file = Bun.file(absolutePath)

  if (!(await file.exists())) {
    throw new Error(`Fichier local introuvable: ${absolutePath}`)
  }

  const shortFilename = toAssetFilename(localPath)
  const existing = existingAssets.get(shortFilename)
  if (existing) return existing

  const signedResponse = await getSignedResponse(shortFilename, folderId)

  const form = new FormData()
  for (const [key, value] of Object.entries(signedResponse.fields)) {
    form.append(key, value)
  }
  form.append('file', file, shortFilename)

  const uploadResponse = await fetch(signedResponse.post_url, {
    method: 'POST',
    body: form,
  })

  if (!uploadResponse.ok) {
    throw new Error(`Upload S3 échoué pour ${shortFilename}: ${await uploadResponse.text()}`)
  }

  const finishResponse = await fetch(`${API}/assets/${signedResponse.id}/finish_upload`, {
    headers,
  })

  if (!finishResponse.ok) {
    throw new Error(
      `Validation upload échouée pour ${shortFilename}: ${await finishResponse.text()}`,
    )
  }

  await finishResponse.json().catch(() => null)
  const asset = await getAssetById(signedResponse.id)

  existingAssets.set(shortFilename, asset)
  return asset
}

async function getSignedResponse(filename: string, folderId: number) {
  const response = await fetch(`${API}/assets/`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({
      filename,
      asset_folder_id: folderId,
      validate_upload: 1,
    }),
  })

  if (!response.ok) {
    throw new Error(`Impossible de signer l'upload ${filename}: ${await response.text()}`)
  }

  const data = (await response.json()) as Record<string, unknown>

  if (isSignedResponse(data)) return data
  if (isSignedResponse(data.signed_response)) return data.signed_response

  throw new Error(`Réponse de signature inattendue pour ${filename}`)
}

async function getSiteImagesStory() {
  const response = await fetch(`${API}/stories/?text_search=${encodeURIComponent(STORY_SLUG)}`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Impossible de lister les stories: ${await response.text()}`)
  }

  const data = (await response.json()) as { stories?: StorySummary[] }
  const summary = (data.stories ?? []).find(
    (story) => story.slug === STORY_SLUG || story.full_slug === STORY_SLUG,
  )

  if (!summary) {
    throw new Error('Story "site-images" introuvable')
  }

  const storyResponse = await fetch(`${API}/stories/${summary.id}`, {
    headers,
  })

  if (!storyResponse.ok) {
    throw new Error(`Impossible de récupérer la story ${summary.id}: ${await storyResponse.text()}`)
  }

  const storyData = (await storyResponse.json()) as { story: StoryDetails }
  return storyData.story
}

async function updateStory(story: StoryDetails) {
  const response = await fetch(`${API}/stories/${story.id}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: JSON.stringify({
      force_update: 1,
      publish: 1,
      story: {
        id: story.id,
        name: story.name,
        slug: story.slug,
        parent_id: story.parent_id,
        content: story.content,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Impossible de mettre à jour la story: ${await response.text()}`)
  }
}

async function getAssetById(assetId: number) {
  const response = await fetch(`${API}/assets/${assetId}`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Impossible de récupérer l'asset ${assetId}: ${await response.text()}`)
  }

  const data = (await response.json()) as StoryblokAsset | { asset: StoryblokAsset }
  return 'asset' in data ? data.asset : data
}

function toAssetFilename(localPath: string) {
  return localPath.replaceAll('/', '--')
}

function toStoryAssetObject(asset: StoryblokAsset, alt: string) {
  return {
    id: asset.id,
    alt,
    title: asset.title ?? null,
    copyright: asset.copyright ?? null,
    fieldtype: 'asset',
    filename: asset.filename,
    focus: asset.focus ?? null,
    name: '',
  }
}

function toRemoteStoryAssetObject(filename: string, alt: string) {
  return {
    alt,
    title: null,
    copyright: null,
    fieldtype: 'asset',
    filename,
    focus: null,
    name: '',
  }
}

function hasStoryAssetUrl(value: unknown) {
  if (typeof value === 'string') return value.length > 0
  if (!value || typeof value !== 'object') return false

  const filename = (value as { filename?: unknown; url?: unknown }).filename
  const url = (value as { filename?: unknown; url?: unknown }).url

  return (
    (typeof filename === 'string' && filename.length > 0) ||
    (typeof url === 'string' && url.length > 0)
  )
}

function isSignedResponse(value: unknown): value is SignedResponse {
  if (!value || typeof value !== 'object') return false
  const candidate = value as SignedResponse
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.post_url === 'string' &&
    typeof candidate.fields === 'object' &&
    candidate.fields !== null
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

export {}
