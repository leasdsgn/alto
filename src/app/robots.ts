import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/preview/',
        '/preview_settings/',
        '/preview_categories/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
