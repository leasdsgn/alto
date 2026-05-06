import { cache } from 'react'

interface StoryblokAssetObject {
  filename?: string
  url?: string
}

interface StoryblokStoryResponse {
  story?: {
    content?: Record<string, unknown>
  }
}

export interface SiteImages {
  footerBackground: string
  shared: {
    locationAvatars: [string, string, string]
    travelerAvatars: [string, string, string]
  }
  home: {
    heroBackground: string
    heroOverlay: string
    experience: {
      arrival: string
      checkin: string
      checkout: string
    }
  }
  about: {
    conceptLounge: string
    conceptCorridor: string
    founders: {
      paul: string
      mayeul: string
      benjamin: string
    }
  }
  blog: {
    storyArrival: string
    storyCheckin: string
  }
  lyon: {
    heroBackground: string
    bellecour: string
    vieuxLyon: string
    terreaux: string
    servicesImage: string
    pressLogo: string
    monocleLogo: string
  }
  pages: {
    contactHero: string
    apartmentsHero: string
    investHero: string
    investModel: string
  }
}

const STORYBLOK_STORY_SLUGS = ['globals/site-images', 'site-images'] as const

const DEFAULT_SITE_IMAGES: SiteImages = {
  footerBackground: '/images/footer-gradient.jpg',
  shared: {
    locationAvatars: ['/images/blog-1.jpg', '/images/hero-home.jpg', '/images/blog-3.jpg'],
    travelerAvatars: [
      '/images/avatars/voyageur-1.png',
      '/images/avatars/voyageur-2.png',
      '/images/avatars/voyageur-3.png',
    ],
  },
  home: {
    heroBackground: '/images/hero-room.png',
    heroOverlay: '/images/hero-overlay.png',
    experience: {
      arrival: '/images/hero-home.jpg',
      checkin: '/images/alto-salon.jpg',
      checkout: '/images/blog-3.jpg',
    },
  },
  about: {
    conceptLounge: '/images/about/concept-lounge.jpg',
    conceptCorridor: '/images/about/concept-corridor.jpg',
    founders: {
      paul: '/images/about/founder-paul.jpg',
      mayeul: '/images/about/founder-mayeul.jpg',
      benjamin: '/images/about/founder-benjamin.jpg',
    },
  },
  blog: {
    storyArrival: '/images/alto-salon.jpg',
    storyCheckin: '/images/blog-3.jpg',
  },
  lyon: {
    heroBackground: '/images/lyon/hero-lyon.jpg',
    bellecour: '/images/lyon/apt-bellecour.jpg',
    vieuxLyon: '/images/lyon/apt-vieux-lyon.jpg',
    terreaux: '/images/lyon/apt-terreaux.jpg',
    servicesImage: '/images/lyon/services-image.jpg',
    pressLogo: '/images/lyon/press-logo.png',
    monocleLogo: '/images/lyon/monocle-logo.png',
  },
  pages: {
    contactHero: '/images/alto-salon.jpg',
    apartmentsHero: '/images/alto-salon.jpg',
    investHero: '/images/alto-salon.jpg',
    investModel: '/images/alto-salon.jpg',
  },
}

export const getSiteImages = cache(async (): Promise<SiteImages> => {
  const token = getStoryblokToken()
  if (!token) return DEFAULT_SITE_IMAGES

  const content = await fetchSiteImagesContent(token)
  if (!content) return DEFAULT_SITE_IMAGES

  return {
    footerBackground: asset(content.footer_background, DEFAULT_SITE_IMAGES.footerBackground),
    shared: {
      locationAvatars: [
        asset(content.shared_location_avatar_1, DEFAULT_SITE_IMAGES.shared.locationAvatars[0]),
        asset(content.shared_location_avatar_2, DEFAULT_SITE_IMAGES.shared.locationAvatars[1]),
        asset(content.shared_location_avatar_3, DEFAULT_SITE_IMAGES.shared.locationAvatars[2]),
      ],
      travelerAvatars: [
        asset(content.shared_traveler_avatar_1, DEFAULT_SITE_IMAGES.shared.travelerAvatars[0]),
        asset(content.shared_traveler_avatar_2, DEFAULT_SITE_IMAGES.shared.travelerAvatars[1]),
        asset(content.shared_traveler_avatar_3, DEFAULT_SITE_IMAGES.shared.travelerAvatars[2]),
      ],
    },
    home: {
      heroBackground: asset(content.home_hero_background, DEFAULT_SITE_IMAGES.home.heroBackground),
      heroOverlay: asset(content.home_hero_overlay, DEFAULT_SITE_IMAGES.home.heroOverlay),
      experience: {
        arrival: asset(
          content.home_experience_arrival,
          DEFAULT_SITE_IMAGES.home.experience.arrival,
        ),
        checkin: asset(
          content.home_experience_checkin,
          DEFAULT_SITE_IMAGES.home.experience.checkin,
        ),
        checkout: asset(
          content.home_experience_checkout,
          DEFAULT_SITE_IMAGES.home.experience.checkout,
        ),
      },
    },
    about: {
      conceptLounge: asset(content.about_concept_lounge, DEFAULT_SITE_IMAGES.about.conceptLounge),
      conceptCorridor: asset(
        content.about_concept_corridor,
        DEFAULT_SITE_IMAGES.about.conceptCorridor,
      ),
      founders: {
        paul: asset(content.about_founder_paul, DEFAULT_SITE_IMAGES.about.founders.paul),
        mayeul: asset(
          content.about_founder_mayeul,
          DEFAULT_SITE_IMAGES.about.founders.mayeul,
        ),
        benjamin: asset(
          content.about_founder_benjamin,
          DEFAULT_SITE_IMAGES.about.founders.benjamin,
        ),
      },
    },
    blog: {
      storyArrival: asset(content.blog_story_arrival, DEFAULT_SITE_IMAGES.blog.storyArrival),
      storyCheckin: asset(content.blog_story_checkin, DEFAULT_SITE_IMAGES.blog.storyCheckin),
    },
    lyon: {
      heroBackground: asset(content.lyon_hero_background, DEFAULT_SITE_IMAGES.lyon.heroBackground),
      bellecour: asset(content.lyon_bellecour, DEFAULT_SITE_IMAGES.lyon.bellecour),
      vieuxLyon: asset(content.lyon_vieux_lyon, DEFAULT_SITE_IMAGES.lyon.vieuxLyon),
      terreaux: asset(content.lyon_terreaux, DEFAULT_SITE_IMAGES.lyon.terreaux),
      servicesImage: asset(content.lyon_services, DEFAULT_SITE_IMAGES.lyon.servicesImage),
      pressLogo: asset(content.lyon_press_logo, DEFAULT_SITE_IMAGES.lyon.pressLogo),
      monocleLogo: asset(content.lyon_monocle_logo, DEFAULT_SITE_IMAGES.lyon.monocleLogo),
    },
    pages: {
      contactHero: asset(content.page_contact_hero, DEFAULT_SITE_IMAGES.pages.contactHero),
      apartmentsHero: asset(
        content.page_apartments_hero,
        DEFAULT_SITE_IMAGES.pages.apartmentsHero,
      ),
      investHero: asset(content.page_invest_hero, DEFAULT_SITE_IMAGES.pages.investHero),
      investModel: asset(content.page_invest_model, DEFAULT_SITE_IMAGES.pages.investModel),
    },
  }
})

function getStoryblokToken() {
  return process.env.STORYBLOK_PREVIEW_TOKEN
    || process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN
    || process.env.NEXT_PUBLIC_STORYBLOK_TOKEN
    || ''
}

async function fetchSiteImagesContent(token: string) {
  for (const slug of STORYBLOK_STORY_SLUGS) {
    const params = new URLSearchParams({
      token,
      version: process.env.NODE_ENV === 'production' ? 'published' : 'draft',
    })

    const response = await fetch(`https://api.storyblok.com/v2/cdn/stories/${slug}?${params}`, {
      next: { revalidate: 300 },
    }).catch(() => null)

    if (!response?.ok) continue

    const data = (await response.json()) as StoryblokStoryResponse
    if (data.story?.content) return data.story.content
  }

  return null
}

function asset(value: unknown, fallback: string) {
  const url = assetUrl(value)
  return url || fallback
}

function assetUrl(value: unknown): string | null {
  if (typeof value === 'string') return normalizeAssetUrl(value)
  if (!isAssetObject(value)) return null
  return normalizeAssetUrl(value.filename || value.url || null)
}

function normalizeAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('https://s3.amazonaws.com/a.storyblok.com/')) {
    return value.replace('https://s3.amazonaws.com/a.storyblok.com/', 'https://a.storyblok.com/')
  }
  return value
}

function isAssetObject(value: unknown): value is StoryblokAssetObject {
  return typeof value === 'object' && value !== null
}
