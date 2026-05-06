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

const SITE_IMAGE_FIELDS = [
  { field: 'footer_background', label: 'Footer background', localPath: 'images/footer-gradient.jpg' },
  { field: 'shared_location_avatar_1', label: 'Shared location avatar 1', localPath: 'images/blog-1.jpg' },
  { field: 'shared_location_avatar_2', label: 'Shared location avatar 2', localPath: 'images/hero-home.jpg' },
  { field: 'shared_location_avatar_3', label: 'Shared location avatar 3', localPath: 'images/blog-3.jpg' },
  { field: 'shared_traveler_avatar_1', label: 'Shared traveler avatar 1', localPath: 'images/avatars/voyageur-1.png' },
  { field: 'shared_traveler_avatar_2', label: 'Shared traveler avatar 2', localPath: 'images/avatars/voyageur-2.png' },
  { field: 'shared_traveler_avatar_3', label: 'Shared traveler avatar 3', localPath: 'images/avatars/voyageur-3.png' },
  { field: 'home_hero_background', label: 'Home hero background', localPath: 'images/hero-room.png' },
  { field: 'home_hero_overlay', label: 'Home hero overlay', localPath: 'images/hero-overlay.png' },
  { field: 'home_experience_arrival', label: 'Home experience arrival', localPath: 'images/hero-home.jpg' },
  { field: 'home_experience_checkin', label: 'Home experience checkin', localPath: 'images/alto-salon.jpg' },
  { field: 'home_experience_checkout', label: 'Home experience checkout', localPath: 'images/blog-3.jpg' },
  { field: 'about_concept_lounge', label: 'About concept lounge', localPath: 'images/about/concept-lounge.jpg' },
  { field: 'about_concept_corridor', label: 'About concept corridor', localPath: 'images/about/concept-corridor.jpg' },
  { field: 'about_founder_paul', label: 'About founder Paul', localPath: 'images/about/founder-paul.jpg' },
  { field: 'about_founder_mayeul', label: 'About founder Mayeul', localPath: 'images/about/founder-mayeul.jpg' },
  { field: 'about_founder_benjamin', label: 'About founder Benjamin', localPath: 'images/about/founder-benjamin.jpg' },
  { field: 'blog_story_arrival', label: 'Blog story arrival', localPath: 'images/alto-salon.jpg' },
  { field: 'blog_story_checkin', label: 'Blog story checkin', localPath: 'images/blog-3.jpg' },
  { field: 'lyon_hero_background', label: 'Lyon hero background', localPath: 'images/lyon/hero-lyon.jpg' },
  { field: 'lyon_bellecour', label: 'Lyon Bellecour', localPath: 'images/lyon/apt-bellecour.jpg' },
  { field: 'lyon_vieux_lyon', label: 'Lyon Vieux Lyon', localPath: 'images/lyon/apt-vieux-lyon.jpg' },
  { field: 'lyon_terreaux', label: 'Lyon Terreaux', localPath: 'images/lyon/apt-terreaux.jpg' },
  { field: 'lyon_services', label: 'Lyon services', localPath: 'images/lyon/services-image.jpg' },
  { field: 'lyon_press_logo', label: 'Lyon press logo', localPath: 'images/lyon/press-logo.png' },
  { field: 'lyon_monocle_logo', label: 'Lyon Monocle logo', localPath: 'images/lyon/monocle-logo.png' },
  { field: 'page_contact_hero', label: 'Contact hero', localPath: 'images/alto-salon.jpg' },
  { field: 'page_apartments_hero', label: 'Apartments hero', localPath: 'images/alto-salon.jpg' },
  { field: 'page_invest_hero', label: 'Invest hero', localPath: 'images/alto-salon.jpg' },
  { field: 'page_invest_model', label: 'Invest model', localPath: 'images/alto-salon.jpg' },
] as const

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
    (folder) => folder.name === ASSET_FOLDER_NAME && (folder.parent_id === 0 || folder.parent_id == null),
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
  const response = await fetch(`${API}/assets/?in_folder=${folderId}&sort_by=short_filename:asc&per_page=100`, {
    headers,
  })

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

  const finishResponse = await fetch(
    `${API}/assets/${signedResponse.id}/finish_upload`,
    { headers },
  )

  if (!finishResponse.ok) {
    throw new Error(`Validation upload échouée pour ${shortFilename}: ${await finishResponse.text()}`)
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

  const data = await response.json() as Record<string, unknown>

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

  const data = await response.json() as StoryblokAsset | { asset: StoryblokAsset }
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

function isSignedResponse(value: unknown): value is SignedResponse {
  if (!value || typeof value !== 'object') return false
  const candidate = value as SignedResponse
  return typeof candidate.id === 'number'
    && typeof candidate.post_url === 'string'
    && typeof candidate.fields === 'object'
    && candidate.fields !== null
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

export {}
