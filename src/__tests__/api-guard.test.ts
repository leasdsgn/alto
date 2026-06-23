import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

function makeRequest(url: string, headers: Record<string, string>) {
  return new NextRequest(url, { headers })
}

describe('api guard', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.NEXT_PUBLIC_SITE_URL
  })

  it('accepte l’origin du domaine Alto Collection', async () => {
    const { assertSameOrigin } = await import('@/lib/api-guard')

    const result = assertSameOrigin(
      makeRequest('https://alto-collection.com/api/guesty/quote', {
        origin: 'https://alto-collection.com',
      }),
    )

    expect(result).toBeNull()
  })

  it('accepte le domaine configuré même si la requête arrive sur une URL interne', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://alto-collection.com'
    const { assertSameOrigin } = await import('@/lib/api-guard')

    const result = assertSameOrigin(
      makeRequest('https://alto-virid.vercel.app/api/guesty/quote', {
        origin: 'https://alto-collection.com',
      }),
    )

    expect(result).toBeNull()
  })

  it('rejette une origin externe', async () => {
    const { assertSameOrigin } = await import('@/lib/api-guard')

    const result = assertSameOrigin(
      makeRequest('https://alto-collection.com/api/guesty/quote', {
        origin: 'https://example.com',
      }),
    )

    expect(result?.status).toBe(403)
  })

  it('accepte le referer du domaine Alto Collection quand origin est absent', async () => {
    const { assertSameOrigin } = await import('@/lib/api-guard')

    const result = assertSameOrigin(
      makeRequest('https://alto-collection.com/api/guesty/quote', {
        referer: 'https://alto-collection.com/appartements/terreaux',
      }),
    )

    expect(result).toBeNull()
  })
})
