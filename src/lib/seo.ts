import type { Metadata } from 'next'
import type { Apartment } from '@/types/apartment'
import type { BlogArticle } from '@/lib/blog-data'

export const SITE_NAME = 'Alto'
export const PRODUCTION_SITE_URL = 'https://www.alto-collection.com'
export const SITE_URL = resolveSiteUrl()
export const DEFAULT_OG_IMAGE = '/images/hero-room.webp'

type JsonLd = Record<string, unknown>

interface SeoMetadataInput {
  title: string
  description: string
  path: string
  image?: string | null
  type?: 'website' | 'article'
  noIndex?: boolean
}

interface BreadcrumbItem {
  name: string
  path: string
}

export function defineSeoMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noIndex = false,
}: SeoMetadataInput): Metadata {
  const canonical = absoluteUrl(path)
  const imageUrl = image ? absoluteUrl(image) : absoluteUrl(DEFAULT_OG_IMAGE)

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: imageUrl }],
      locale: 'fr_FR',
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  }
}

export function absoluteUrl(path: string) {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('//')) return `https:${path}`
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/images/logo-alto-dark.png'),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['fr', 'en'],
    },
  }
}

export function buildWebsiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/appartements')}?city={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function buildApartmentJsonLd(apartment: Apartment): JsonLd {
  const path = `/appartements/${apartment.slug}`
  const image = apartment.images[0] ?? apartment.image
  const offers =
    apartment.price && apartment.price > 0
      ? {
          '@type': 'Offer',
          price: apartment.price,
          priceCurrency: apartment.currency,
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(path),
        }
      : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: apartment.name,
    url: absoluteUrl(path),
    image: image ? absoluteUrl(image) : undefined,
    description: apartment.description,
    address: apartment.address,
    containedInPlace: apartment.city,
    amenityFeature: apartment.amenities.slice(0, 12).map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    offers,
  }
}

export function buildArticleJsonLd(article: BlogArticle): JsonLd {
  const path = `/blog/${article.slug}`
  const image = article.ogImage ?? article.heroImage ?? article.image

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription ?? article.subtitle,
    image: absoluteUrl(image),
    mainEntityOfPage: absoluteUrl(path),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/images/logo-alto-dark.png'),
      },
    },
  }
}

export function resolveSiteUrl(
  value = process.env.NEXT_PUBLIC_SITE_URL,
  environment = process.env.NODE_ENV,
) {
  const normalized = normalizeSiteUrl(value)

  if (!normalized) return PRODUCTION_SITE_URL
  if (environment === 'production' && isLocalUrl(normalized)) return PRODUCTION_SITE_URL

  return normalized
}

function normalizeSiteUrl(value: string | undefined) {
  if (!value) return null

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString().replace(/\/+$/, '')
  } catch {
    return null
  }
}

function isLocalUrl(value: string) {
  const hostname = new URL(value).hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
}
