import { beforeEach, describe, expect, it, vi } from 'vitest'

const oauthCache = vi.hoisted(() => ({
  acquireOpenApiOAuthLock: vi.fn(),
  readOpenApiOAuthCache: vi.fn(),
  releaseOpenApiOAuthLock: vi.fn(),
  writeOpenApiOAuthCache: vi.fn(),
  writeOpenApiOAuthRateLimit: vi.fn(),
}))

vi.mock('@/lib/guesty-openapi-cache', () => oauthCache)

describe('guesty-openapi', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllGlobals()

    const tokenCache = globalThis as typeof globalThis & {
      __guestyOpenApiToken?: string
      __guestyOpenApiTokenExpiresAt?: number
      __guestyOpenApiRateLimitedUntil?: number
    }
    tokenCache.__guestyOpenApiToken = undefined
    tokenCache.__guestyOpenApiTokenExpiresAt = undefined
    tokenCache.__guestyOpenApiRateLimitedUntil = undefined

    process.env.GUESTY_OPENAPI_CLIENT_ID = 'test-id'
    process.env.GUESTY_OPENAPI_CLIENT_SECRET = 'test-secret'
    oauthCache.acquireOpenApiOAuthLock.mockResolvedValue(null)
    oauthCache.readOpenApiOAuthCache.mockResolvedValue(null)
    oauthCache.releaseOpenApiOAuthLock.mockResolvedValue(undefined)
    oauthCache.writeOpenApiOAuthCache.mockResolvedValue(undefined)
    oauthCache.writeOpenApiOAuthRateLimit.mockResolvedValue(undefined)
  })

  it('réutilise le token partagé sans rappeler OAuth', async () => {
    oauthCache.readOpenApiOAuthCache.mockResolvedValue({
      accessToken: 'shared-token',
      expiresAt: Date.now() + 60_000,
      rateLimitedUntil: null,
    })
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [], count: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', mockFetch)

    const { guestyOpenApi } = await import('@/lib/guesty-openapi')
    await guestyOpenApi.getListingVisibilityPage({ limit: 100, skip: 0 })

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(String(mockFetch.mock.calls[0][0])).toContain('/v1/listings?')
    expect(String(mockFetch.mock.calls[0][0])).toContain('fields=customFields+areaSquareFeet')
  })

  it('partage un nouveau token OAuth après sa création', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'new-token', expires_in: 86_400 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ results: [], count: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', mockFetch)

    const { guestyOpenApi } = await import('@/lib/guesty-openapi')
    await guestyOpenApi.getListingVisibilityPage({ limit: 100, skip: 0 })

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(String(mockFetch.mock.calls[0][0])).toContain('/oauth2/token')
    expect(oauthCache.writeOpenApiOAuthCache).toHaveBeenCalledWith({
      accessToken: 'new-token',
      expiresAt: expect.any(Number),
    })
  })
})
