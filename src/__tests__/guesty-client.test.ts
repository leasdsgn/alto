import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('guesty-client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    vi.stubGlobal('__guestyToken', undefined)
    vi.stubGlobal('__guestyTokenExpiresAt', undefined)
    vi.stubGlobal('__guestyRateLimitedUntil', undefined)
  })

  it('lance une erreur si les credentials sont absentes', async () => {
    delete process.env.GUESTY_BEAPI_CLIENT_ID
    delete process.env.GUESTY_BEAPI_CLIENT_SECRET

    const { guestyClient } = await import('@/lib/guesty-client')

    await expect(guestyClient.getListings()).rejects.toThrow(
      'GUESTY_BEAPI_CLIENT_ID et GUESTY_BEAPI_CLIENT_SECRET requis',
    )
  })

  it('gère le rate limiting (429)', async () => {
    process.env.GUESTY_BEAPI_CLIENT_ID = 'test-id'
    process.env.GUESTY_BEAPI_CLIENT_SECRET = 'test-secret'

    const mockFetch = vi.fn().mockResolvedValue({
      status: 429,
      ok: false,
    })
    vi.stubGlobal('fetch', mockFetch)

    const { guestyClient } = await import('@/lib/guesty-client')

    await expect(guestyClient.getListings()).rejects.toThrow('rate limited')
  })

  it('construit les URLs correctement pour getAvailableListings', async () => {
    process.env.GUESTY_BEAPI_CLIENT_ID = 'test-id'
    process.env.GUESTY_BEAPI_CLIENT_SECRET = 'test-secret'

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ access_token: 'tok', expires_in: 3600, token_type: 'Bearer' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ results: [] }),
      })
    vi.stubGlobal('fetch', mockFetch)

    const { guestyClient } = await import('@/lib/guesty-client')
    await guestyClient.getAvailableListings('2026-05-01', '2026-05-05', 2)

    const apiCall = mockFetch.mock.calls[1]
    expect(apiCall[0]).toContain('/listings?')
    expect(apiCall[0]).toContain('checkIn=2026-05-01')
    expect(apiCall[0]).toContain('checkOut=2026-05-05')
    expect(apiCall[0]).toContain('minOccupancy=2')
  })
})
