import type { MetadataRoute } from 'next'
import { getApartmentCards } from '@/components/sections/apartments-section'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { DEFAULT_LOCALE } from '@/lib/i18n/locale'
import { absoluteUrl } from '@/lib/seo'

export const revalidate = 3600

const STATIC_ROUTES: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/appartements', priority: 0.9, changeFrequency: 'daily' },
  { path: '/notre-histoire', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/investir', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/cgv', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/annulation', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const [apartments, articles] = await Promise.all([
    getApartmentCards().catch(() => []),
    getBlogArticles(DEFAULT_LOCALE).catch(() => []),
  ])

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...apartments.map((apartment) => ({
      url: absoluteUrl(`/appartements/${apartment.slug}`),
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/blog/${article.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.55,
    })),
  ]
}
