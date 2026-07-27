import { describe, expect, it } from 'vitest'
import { PRODUCTION_SITE_URL, resolveSiteUrl } from '@/lib/seo'

describe('resolveSiteUrl', () => {
  it('refuse une URL localhost sur un build de production', () => {
    expect(resolveSiteUrl('http://localhost:3000', 'production')).toBe(PRODUCTION_SITE_URL)
  })

  it('conserve localhost en développement', () => {
    expect(resolveSiteUrl('http://localhost:3000/', 'development')).toBe('http://localhost:3000')
  })

  it('retombe sur le domaine public lorsque la variable est absente ou invalide', () => {
    expect(resolveSiteUrl(undefined, 'production')).toBe(PRODUCTION_SITE_URL)
    expect(resolveSiteUrl('alto-collection.com', 'production')).toBe(PRODUCTION_SITE_URL)
  })

  it('normalise le domaine public configuré', () => {
    expect(resolveSiteUrl('https://www.alto-collection.com///', 'production')).toBe(
      PRODUCTION_SITE_URL,
    )
  })
})
