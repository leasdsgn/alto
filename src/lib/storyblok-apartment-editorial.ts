import { cache } from 'react'
import { DEFAULT_LOCALE } from '@/lib/i18n/locale'
import { getStoryblokToken, getStoryblokVersion } from '@/lib/storyblok-preview'
import { type InquiryLocale } from '@/types/inquiry'

export interface ApartmentFaqItem {
  question: string
  answer: string
}

export interface ApartmentFeatureItem {
  title: string
  description: string
}

export interface ApartmentEditorial {
  guestyId?: string
  slug?: string
  visible: boolean
  title?: string
  intro?: string
  description?: string
  space?: string
  neighborhoodName?: string
  neighborhoodDescription?: string
  transit?: string
  features: ApartmentFeatureItem[]
  faqExtra: ApartmentFaqItem[]
  review?: {
    quote: string
    name: string
    stay: string
  }
}

interface StoryblokStory {
  name: string
  slug: string
  full_slug: string
  content?: Record<string, unknown>
}

interface StoryblokStoryResponse {
  story?: StoryblokStory
}

interface StoryblokStoriesResponse {
  stories?: StoryblokStory[]
}

const STORYBLOK_BASE_URL = 'https://api.storyblok.com/v2/cdn/stories'
const APARTMENT_STORY_PREFIXES = ['apartments', 'appartements', 'apartment-editorials'] as const
const GLOBAL_FAQ_SLUGS = ['globals/apartment-faq', 'apartment-faq', 'global-faq'] as const

const DEFAULT_APARTMENT_FAQ: Record<InquiryLocale, ApartmentFaqItem[]> = {
  fr: [
    {
      question: 'Comment fonctionne le check-in ?',
      answer:
        'L’arrivée se fait en autonomie avec des instructions envoyées avant le séjour. L’équipe reste disponible si vous avez besoin d’aide.',
    },
    {
      question: 'Le ménage est-il inclus ?',
      answer:
        'Le ménage de départ est prévu et l’appartement est préparé avant votre arrivée pour un séjour sans logistique supplémentaire.',
    },
    {
      question: 'Puis-je réserver en direct ?',
      answer:
        'Oui. La réservation peut se faire directement sur Alto avec le même niveau d’information, un contact plus direct et un suivi plus simple.',
    },
    {
      question: 'Que comprend le prix affiché ?',
      answer:
        'Le tarif couvre le logement, le linge de maison, le Wi-Fi et l’accompagnement de l’équipe. Les conditions exactes restent précisées au moment de la réservation.',
    },
  ],
  en: [
    {
      question: 'How does check-in work?',
      answer:
        'Check-in is self-service with instructions sent before your stay. The team remains available if you need help.',
    },
    {
      question: 'Is cleaning included?',
      answer:
        'End-of-stay cleaning is included, and the apartment is prepared before your arrival so the stay stays simple.',
    },
    {
      question: 'Can I book directly?',
      answer:
        'Yes. You can book directly on Alto with the same level of information, a more direct contact, and simpler follow-up.',
    },
    {
      question: 'What does the displayed price include?',
      answer:
        'The rate includes the apartment, household linen, Wi-Fi, and support from the team. Exact conditions are confirmed during booking.',
    },
  ],
}

export const getGlobalApartmentFaq = cache(
  async (locale: InquiryLocale = DEFAULT_LOCALE): Promise<ApartmentFaqItem[]> => {
    const version = await getStoryblokVersion()
    const token = getStoryblokToken(version)
    if (!token) return DEFAULT_APARTMENT_FAQ[locale]

    for (const slug of GLOBAL_FAQ_SLUGS) {
      const story = await fetchStoryBySlug(token, version, locale, slug)
      const content = story?.content
      if (!content) continue

      const items = mapFaqItems(content.items)
      if (items.length > 0) return items
    }

    return DEFAULT_APARTMENT_FAQ[locale]
  },
)

export const getApartmentEditorial = cache(
  async ({
    guestyId,
    slug,
    locale = DEFAULT_LOCALE,
  }: {
    guestyId: string
    slug: string
    locale?: InquiryLocale
  }): Promise<ApartmentEditorial | null> => {
    const version = await getStoryblokVersion()
    const token = getStoryblokToken(version)
    if (!token) return null

    for (const prefix of APARTMENT_STORY_PREFIXES) {
      const story = await fetchStoryBySlug(token, version, locale, `${prefix}/${slug}`)
      const editorial = mapApartmentEditorial(story)
      if (editorial) return editorial
    }

    const storyByGuestyId = await fetchApartmentStoryByGuestyId(token, version, locale, guestyId)
    return mapApartmentEditorial(storyByGuestyId)
  },
)

async function fetchStoryBySlug(
  token: string,
  version: 'draft' | 'published',
  locale: InquiryLocale,
  slug: string,
) {
  const params = new URLSearchParams({
    token,
    version,
    language: locale,
    fallback_lang: DEFAULT_LOCALE,
  })

  const response = await fetch(`${STORYBLOK_BASE_URL}/${slug}?${params}`, {
    next: { revalidate: 300 },
  }).catch(() => null)

  if (!response?.ok) return null
  const data = (await response.json()) as StoryblokStoryResponse
  return data.story ?? null
}

async function fetchApartmentStoryByGuestyId(
  token: string,
  version: 'draft' | 'published',
  locale: InquiryLocale,
  guestyId: string,
) {
  const params = new URLSearchParams({
    token,
    version,
    language: locale,
    fallback_lang: DEFAULT_LOCALE,
    content_type: 'apartment_editorial',
    per_page: '1',
  })
  params.set('filter_query[guesty_id][in]', guestyId)

  const response = await fetch(`${STORYBLOK_BASE_URL}?${params}`, {
    next: { revalidate: 300 },
  }).catch(() => null)

  if (!response?.ok) return null
  const data = (await response.json()) as StoryblokStoriesResponse
  return data.stories?.[0] ?? null
}

function mapApartmentEditorial(story: StoryblokStory | null): ApartmentEditorial | null {
  const content = story?.content
  if (!content) return null

  const visible = asBoolean(content.visible, true)
  if (!visible) return null

  return {
    guestyId: asString(content.guesty_id),
    slug: asString(content.slug) ?? story.slug,
    visible,
    title: asString(content.title),
    intro: asString(content.intro),
    description: asString(content.description),
    space: asString(content.space),
    neighborhoodName: asString(content.neighborhood_name),
    neighborhoodDescription: asString(content.neighborhood_description),
    transit: asString(content.transit),
    features: mapFeatureItems(content.features),
    faqExtra: mapFaqItems(content.faq_extra),
    review: mapReview(content),
  }
}

function mapReview(content: Record<string, unknown>): ApartmentEditorial['review'] {
  const quote = asString(content.review_quote)
  const name = asString(content.review_name)
  const stay = asString(content.review_stay)

  if (!quote || !name || !stay) return undefined
  return { quote, name, stay }
}

function mapFaqItems(value: unknown): ApartmentFaqItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!isRecord(item)) return null
      const question = asString(item.question)
      const answer = asString(item.answer)
      if (!question || !answer) return null
      return { question, answer }
    })
    .filter(Boolean) as ApartmentFaqItem[]
}

function mapFeatureItems(value: unknown): ApartmentFeatureItem[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!isRecord(item)) return null
      const title = asString(item.title)
      const description = asString(item.description)
      if (!title || !description) return null
      return { title, description }
    })
    .filter(Boolean) as ApartmentFeatureItem[]
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
