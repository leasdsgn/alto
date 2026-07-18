/**
 * Synchronise les assets éditoriaux vers les vraies stories CMS.
 *
 * - Upload les fichiers de public/images dans un dossier Storyblok dédié
 * - Réutilise les assets déjà uploadés si le nom existe
 * - Assigne les images aux champs des stories `pages/*` et `globals/*`
 * - Ne modifie pas les textes existants
 *
 * Usage :
 *   bun run storyblok:sync-cms-assets
 */

import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'

declare const Bun: {
  file: (filePath: string) => Blob & {
    exists: () => Promise<boolean>
    text: () => Promise<string>
  }
}

loadLocalEnv()

const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN
const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '291441851126938'
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const ASSET_FOLDER_NAME = 'alto-cms-assets'
const STORYBLOK_CONCEPT_IMAGE =
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

type AssetKey =
  | 'logoLight'
  | 'logoDark'
  | 'footerBackground'
  | 'locationAvatar1'
  | 'locationAvatar2'
  | 'locationAvatar3'
  | 'travelerAvatar1'
  | 'travelerAvatar2'
  | 'travelerAvatar3'
  | 'homeHero'
  | 'homeOverlay'
  | 'experienceArrival'
  | 'experienceCheckin'
  | 'experienceCheckout'
  | 'experienceDurability'
  | 'apartmentsHero'
  | 'aboutHero'
  | 'aboutGuarantees'
  | 'founderPaul'
  | 'founderMayeul'
  | 'founderBenjamin'
  | 'investHero'
  | 'investModel'
  | 'lyonHero'
  | 'lyonBellecour'
  | 'lyonVieuxLyon'
  | 'lyonTerreaux'
  | 'lyonServices'
  | 'lyonPressLogo'
  | 'lyonMonocleLogo'
  | 'blogArrival'
  | 'blogCheckin'
  | 'blogParis1'
  | 'blogParis2'
  | 'blogParis3'
  | 'blogParis4'
  | 'blogLyon1'
  | 'serviceCheckin'
  | 'serviceCleaning'
  | 'serviceSupport'
  | 'serviceWallet'
  | 'whatsappButton'

interface LocalAssetDefinition {
  key: AssetKey
  localPath: string
  alt: string
}

const ASSETS: LocalAssetDefinition[] = [
  { key: 'logoLight', localPath: 'images/logo-alto-light.png', alt: 'Logo Alto' },
  { key: 'logoDark', localPath: 'images/logo-alto-dark.png', alt: 'Logo Alto' },
  { key: 'footerBackground', localPath: 'images/footer-gradient.webp', alt: 'Fond Alto' },
  { key: 'locationAvatar1', localPath: 'images/blog-1.jpg', alt: 'Appartement Alto à Paris' },
  { key: 'locationAvatar2', localPath: 'images/hero-home.webp', alt: 'Appartement Alto à Lyon' },
  { key: 'locationAvatar3', localPath: 'images/blog-3.jpg', alt: 'Séjour Alto' },
  {
    key: 'travelerAvatar1',
    localPath: 'images/avatars/voyageur-1.png',
    alt: 'Voyageuse Alto',
  },
  {
    key: 'travelerAvatar2',
    localPath: 'images/avatars/voyageur-2.png',
    alt: 'Voyageur Alto',
  },
  {
    key: 'travelerAvatar3',
    localPath: 'images/avatars/voyageur-3.png',
    alt: 'Cliente Alto',
  },
  { key: 'homeHero', localPath: 'images/hero-room.webp', alt: 'Salon Alto' },
  { key: 'homeOverlay', localPath: 'images/hero-overlay.webp', alt: 'Intérieur Alto' },
  {
    key: 'experienceArrival',
    localPath: 'images/experience-espaces.png',
    alt: 'Espaces Alto',
  },
  {
    key: 'experienceCheckin',
    localPath: 'images/experience-localisation.png',
    alt: 'Localisation Alto',
  },
  { key: 'experienceCheckout', localPath: 'images/experience-confort.webp', alt: 'Confort Alto' },
  {
    key: 'experienceDurability',
    localPath: 'images/experience-durabilite.webp',
    alt: 'Durabilité Alto',
  },
  {
    key: 'apartmentsHero',
    localPath: 'images/appartements-hero.webp',
    alt: 'Appartement Alto',
  },
  { key: 'aboutHero', localPath: 'images/about/about-hero.webp', alt: 'Salle à manger Alto' },
  {
    key: 'aboutGuarantees',
    localPath: 'images/about/concept-corridor.jpg',
    alt: 'Couloir Alto',
  },
  { key: 'founderPaul', localPath: 'images/about/founder-paul.jpg', alt: 'Paul Borie' },
  {
    key: 'founderMayeul',
    localPath: 'images/about/founder-mayeul.jpg',
    alt: 'Mayeul Desombre',
  },
  {
    key: 'founderBenjamin',
    localPath: 'images/about/founder-benjamin.jpg',
    alt: 'Benjamin Farhi',
  },
  { key: 'investHero', localPath: 'images/alto-salon.jpg', alt: 'Investir avec Alto' },
  { key: 'investModel', localPath: 'images/alto-salon.jpg', alt: 'Intérieur Alto' },
  { key: 'lyonHero', localPath: 'images/lyon/hero-lyon.jpg', alt: 'Lyon' },
  { key: 'lyonBellecour', localPath: 'images/lyon/apt-bellecour.jpg', alt: 'Bellecour' },
  { key: 'lyonVieuxLyon', localPath: 'images/lyon/apt-vieux-lyon.jpg', alt: 'Vieux Lyon' },
  { key: 'lyonTerreaux', localPath: 'images/lyon/apt-terreaux.jpg', alt: 'Terreaux' },
  { key: 'lyonServices', localPath: 'images/lyon/services-image.jpg', alt: 'Service Alto Lyon' },
  { key: 'lyonPressLogo', localPath: 'images/lyon/press-logo.png', alt: 'Logo presse' },
  { key: 'lyonMonocleLogo', localPath: 'images/lyon/monocle-logo.png', alt: 'Logo Monocle' },
  { key: 'blogArrival', localPath: 'images/alto-salon.jpg', alt: 'Séjour Alto' },
  { key: 'blogCheckin', localPath: 'images/blog-3.jpg', alt: 'Check-in Alto' },
  { key: 'blogParis1', localPath: 'images/blog-1.jpg', alt: 'Paris' },
  { key: 'blogParis2', localPath: 'images/blog-2.jpg', alt: 'Saint-Germain' },
  { key: 'blogParis3', localPath: 'images/blog-3.jpg', alt: 'Opéra' },
  { key: 'blogParis4', localPath: 'images/blog-4.jpg', alt: 'Voyage Alto' },
  { key: 'blogLyon1', localPath: 'images/lyon/blog-terreaux.jpg', alt: 'Lyon' },
  { key: 'serviceCheckin', localPath: 'images/icons/checkin.svg', alt: 'Check-in autonome' },
  { key: 'serviceCleaning', localPath: 'images/icons/cleaning.svg', alt: 'Ménage' },
  { key: 'serviceSupport', localPath: 'images/icons/support.svg', alt: 'Support' },
  { key: 'serviceWallet', localPath: 'images/icons/wallet.svg', alt: 'Prix net' },
  {
    key: 'whatsappButton',
    localPath: 'images/icons/whatsapp-button-white-medium.png',
    alt: 'Chat on WhatsApp',
  },
]

const ARTICLE_IMAGES: Array<{ slug: string; asset: AssetKey }> = [
  { slug: 'le-marais-a-hauteur-de-regard', asset: 'blogParis1' },
  { slug: 'un-week-end-a-saint-germain', asset: 'blogParis2' },
  { slug: 'autour-de-l-opera', asset: 'blogParis3' },
  { slug: 'lyon-entre-terrasses-et-traboules', asset: 'blogLyon1' },
  { slug: '48-heures-autour-de-bellecour', asset: 'lyonBellecour' },
  { slug: 'vieux-lyon-et-escaliers-secrets', asset: 'lyonVieuxLyon' },
  { slug: 'preparer-son-arrivee-en-autonomie', asset: 'blogParis4' },
  { slug: 'choisir-le-bon-quartier', asset: 'blogArrival' },
  { slug: 'voyager-leger-en-ville', asset: 'homeHero' },
]

async function main() {
  const folder = await ensureAssetFolder()
  console.log(`Dossier assets : ${folder.name} (#${folder.id})`)

  const existingAssets = await getAssetsByFilename(folder.id)
  const assets = await uploadAssets(folder.id, existingAssets)

  await updateStoryIfExists('globals/header', (content) => {
    content.logo_light = assets.logoLight
    content.logo_dark = assets.logoDark
  })

  await updateStoryIfExists('globals/footer', (content) => {
    content.logo = assets.logoLight
  })

  await updateStoryIfExists('globals/shared-assets', (content) => {
    content.location_avatar_1 = assets.locationAvatar1
    content.location_avatar_2 = assets.locationAvatar2
    content.location_avatar_3 = assets.locationAvatar3
    content.traveler_avatar_1 = assets.travelerAvatar1
    content.traveler_avatar_2 = assets.travelerAvatar2
    content.traveler_avatar_3 = assets.travelerAvatar3
    content.footer_background = assets.footerBackground
  })

  await updateStoryIfExists('pages/home', (content) => {
    updateBodyComponents(content, ['hero_section', 'home_hero_section'], (blok) => {
      blok.background_image = assets.homeHero
      blok.overlay_image = assets.homeOverlay
    })

    updateBodyComponents(content, ['home_about_section'], (blok) => {
      blok.location_avatar_1 = assets.locationAvatar1
      blok.location_avatar_2 = assets.locationAvatar2
      blok.location_avatar_3 = assets.locationAvatar3
      blok.traveler_avatar_1 = assets.travelerAvatar1
      blok.traveler_avatar_2 = assets.travelerAvatar2
      blok.traveler_avatar_3 = assets.travelerAvatar3
    })

    updateExperiencePanels(content, ['panels_section', 'home_experience_section'], assets)
    updateServiceIcons(content, ['services_section', 'home_services_section'], assets)
  })

  await updateStoryIfExists('pages/lyon', (content) => {
    updateBodyComponents(content, ['lyon_hero_section', 'hero_section'], (blok) => {
      blok.background_image = assets.lyonHero
    })
    updateBodyComponents(content, ['lyon_stats_section'], (blok) => {
      blok.press_logo = assets.lyonPressLogo
      blok.monocle_logo = assets.lyonMonocleLogo
    })
    updateBodyComponents(content, ['lyon_services_section'], (blok) => {
      blok.image = assets.lyonServices
    })
    updateBodyComponents(content, ['lyon_quartiers_section', 'quartiers_section'], (blok) => {
      const items = ensureBloks(blok.items, [
        { component: 'quartier', name: 'Bellecour', slug: 'bellecour', description: '2e arr.' },
        { component: 'quartier', name: 'Vieux Lyon', slug: 'vieux-lyon', description: '5e arr.' },
        { component: 'quartier', name: 'Terreaux', slug: 'terreaux', description: '1e arr.' },
      ])
      setByIndex(items, 0, 'image', assets.lyonBellecour)
      setByIndex(items, 1, 'image', assets.lyonVieuxLyon)
      setByIndex(items, 2, 'image', assets.lyonTerreaux)
      blok.items = items
    })
  })

  await updateStoryIfExists('pages/appartements', (content) => {
    updateBodyComponents(content, ['hero_compact_section'], (blok) => {
      blok.background_image = assets.apartmentsHero
    })
  })

  await updateStoryIfExists('pages/notre-histoire', (content) => {
    updateBodyComponents(content, ['notre_histoire_section'], (blok) => {
      blok.hero_image = assets.aboutHero
      blok.concept_image = remoteAsset(STORYBLOK_CONCEPT_IMAGE, 'Intérieur Alto')
      blok.guarantees_image = assets.aboutGuarantees
      blok.founder_paul_image = assets.founderPaul
      blok.founder_mayeul_image = assets.founderMayeul
      blok.founder_benjamin_image = assets.founderBenjamin
    })
    updateBodyComponents(content, ['concept_section'], (blok) => {
      blok.image = remoteAsset(STORYBLOK_CONCEPT_IMAGE, 'Intérieur Alto')
    })
    updateBodyComponents(content, ['guarantees_section'], (blok) => {
      blok.image = assets.aboutGuarantees
    })
    updateBodyComponents(content, ['founders_section'], (blok) => {
      const founders = ensureBloks(blok.founders, [
        { component: 'founder', name: 'Paul Borie' },
        { component: 'founder', name: 'Mayeul Desombre' },
        { component: 'founder', name: 'Benjamin Farhi' },
      ])
      setByIndex(founders, 0, 'image', assets.founderPaul)
      setByIndex(founders, 1, 'image', assets.founderMayeul)
      setByIndex(founders, 2, 'image', assets.founderBenjamin)
      blok.founders = founders
    })
    updateServiceIcons(content, ['services_section', 'feature_grid_section'], assets)
  })

  await updateStoryIfExists('pages/investir', (content) => {
    updateBodyComponents(content, ['hero_compact_section'], (blok) => {
      blok.background_image = assets.investHero
    })
    updateBodyComponents(content, ['invest_model_section', 'image_text_section'], (blok) => {
      blok.image = assets.investModel
    })
  })

  for (const slug of ['pages/cgv', 'pages/confidentialite', 'pages/annulation']) {
    await updateStoryIfExists(slug, (content) => {
      updateBodyComponents(content, ['hero_compact_section'], (blok) => {
        blok.background_image = assets.investHero
      })
    })
  }

  await updateStoryIfExists('pages/blog', (content) => {
    updateBodyComponents(content, ['blog_index_section'], (blok) => {
      blok.story_arrival_image = assets.blogArrival
      blok.story_checkin_image = assets.blogCheckin
    })
    updateServiceIcons(content, ['services_section'], assets)
  })

  for (const article of ARTICLE_IMAGES) {
    await updateArticleImage(article.slug, assets[article.asset])
  }

  console.log('\nAssets CMS Storyblok synchronisés.')
}

async function uploadAssets(
  folderId: number,
  existingAssets: Map<string, StoryblokAsset>,
): Promise<Record<AssetKey, Record<string, unknown>>> {
  const uploaded = {} as Record<AssetKey, Record<string, unknown>>

  for (const definition of ASSETS) {
    const asset = await ensureAsset(definition.localPath, folderId, existingAssets)
    uploaded[definition.key] = toStoryAssetObject(asset, definition.alt)
    console.log(`Asset prêt : ${definition.localPath} -> ${asset.filename}`)
  }

  return uploaded
}

async function updateArticleImage(slug: string, image: Record<string, unknown>) {
  const story =
    (await getStoryByFullSlug(`blog/${slug}`)) ?? (await getStoryByFullSlug(`articles/${slug}`))
  if (!story) {
    console.log(`  · article ${slug} introuvable, skip`)
    return
  }

  story.content.cover_image = image
  story.content.hero_image = image
  story.content.og_image = image
  await updateStory(story)
  console.log(`  ↻ article ${story.full_slug ?? story.slug}`)
}

async function updateStoryIfExists(
  fullSlug: string,
  updater: (content: Record<string, unknown>) => void,
) {
  const story = await getStoryByFullSlug(fullSlug)
  if (!story) {
    console.log(`  · story ${fullSlug} introuvable, skip`)
    return
  }

  updater(story.content)
  await updateStory(story)
  console.log(`  ↻ story ${fullSlug}`)
}

function updateExperiencePanels(
  content: Record<string, unknown>,
  components: string[],
  assets: Record<AssetKey, Record<string, unknown>>,
) {
  updateBodyComponents(content, components, (blok) => {
    const panels = ensureBloks(blok.panels, [
      {
        component: 'panel',
        label: 'Espaces',
        title: 'Espaces de charme, singuliers, atypiques, et bien pensés.',
      },
      {
        component: 'panel',
        label: 'Localisation',
        title: 'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
      },
      {
        component: 'panel',
        label: 'Confort',
        title: 'Standards hôteliers. Soin des détails, équipements modernes.',
      },
      {
        component: 'panel',
        label: 'Durabilité',
        title: 'Matériaux durables et sourcés. Vigilance sur l’impact des installations.',
      },
    ])
    setByIndex(panels, 0, 'image', assets.experienceArrival)
    setByIndex(panels, 1, 'image', assets.experienceCheckin)
    setByIndex(panels, 2, 'image', assets.experienceCheckout)
    setByIndex(panels, 3, 'image', assets.experienceDurability)
    blok.panels = panels
  })
}

function updateServiceIcons(
  content: Record<string, unknown>,
  components: string[],
  assets: Record<AssetKey, Record<string, unknown>>,
) {
  updateBodyComponents(content, components, (blok) => {
    const items = ensureBloks(blok.items ?? blok.features, [
      { component: 'service_card', title: 'Self check-in' },
      { component: 'service_card', title: 'Ménage' },
      { component: 'service_card', title: 'Assistance de 8 h à 20 h' },
      { component: 'service_card', title: 'Pas de frais cachés' },
    ])
    setByIndex(items, 0, 'icon', assets.serviceCheckin)
    setByIndex(items, 1, 'icon', assets.serviceCleaning)
    setByIndex(items, 2, 'icon', assets.serviceSupport)
    setByIndex(items, 3, 'icon', assets.serviceWallet)
    if (blok.features) blok.features = items
    else blok.items = items
  })
}

function updateBodyComponents(
  content: Record<string, unknown>,
  componentNames: string[],
  updater: (blok: Record<string, unknown>) => void,
) {
  const body = Array.isArray(content.body) ? content.body : []
  for (const blok of body) {
    if (!isRecord(blok) || typeof blok.component !== 'string') continue
    if (componentNames.includes(blok.component)) updater(blok)
  }
}

function ensureBloks(value: unknown, defaults: Array<Record<string, unknown>>) {
  const existing = Array.isArray(value) ? value.filter(isRecord) : []
  const next = [...existing]
  while (next.length < defaults.length) {
    next.push({
      _uid: crypto.randomUUID(),
      ...defaults[next.length],
    })
  }
  return next
}

function setByIndex(
  list: Array<Record<string, unknown>>,
  index: number,
  field: string,
  value: Record<string, unknown>,
) {
  const item = list[index]
  if (!item) return
  item[field] = value
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
    if (asset.short_filename) map.set(asset.short_filename, asset)
    const filename = asset.filename.split('/').at(-1)
    if (filename) map.set(filename, asset)
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

  const finishResponse = await apiFetch(`${API}/assets/${signedResponse.id}/finish_upload`, {
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
  const response = await apiFetch(`${API}/assets/`, {
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

async function getAssetById(assetId: number) {
  const response = await apiFetch(`${API}/assets/${assetId}`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Impossible de récupérer l'asset ${assetId}: ${await response.text()}`)
  }

  const data = (await response.json()) as StoryblokAsset | { asset: StoryblokAsset }
  return 'asset' in data ? data.asset : data
}

async function getStoryByFullSlug(fullSlug: string): Promise<StoryDetails | null> {
  const params = new URLSearchParams({ by_slugs: fullSlug, per_page: '1' })
  const response = await apiFetch(`${API}/stories?${params}`, { headers })

  if (!response.ok) {
    throw new Error(`Impossible de récupérer ${fullSlug}: ${await response.text()}`)
  }

  const data = (await response.json()) as { stories?: StorySummary[] }
  const summary = (data.stories ?? []).find((story) => story.full_slug === fullSlug)
  if (!summary) return null

  const storyResponse = await apiFetch(`${API}/stories/${summary.id}`, { headers })
  if (!storyResponse.ok) {
    throw new Error(`Impossible de lire la story ${summary.id}: ${await storyResponse.text()}`)
  }

  const storyData = (await storyResponse.json()) as { story: StoryDetails }
  return storyData.story
}

async function updateStory(story: StoryDetails) {
  const response = await apiFetch(`${API}/stories/${story.id}`, {
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
    throw new Error(
      `Impossible de mettre à jour ${story.full_slug ?? story.slug}: ${await response.text()}`,
    )
  }
}

async function apiFetch(input: string, init: RequestInit, attempts = 4): Promise<Response> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    await sleep(220)
    const response = await fetch(input, init)
    if (response.status !== 429) return response
    if (attempt === attempts - 1) return response
    await sleep(1000 * (attempt + 1))
  }

  return fetch(input, init)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

function remoteAsset(filename: string, alt: string) {
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

function isSignedResponse(value: unknown): value is SignedResponse {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.post_url === 'string' &&
    isRecord(value.fields)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
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
    const value = trimmed
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

await main()
