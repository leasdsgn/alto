import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('guesty-client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllGlobals()
    vi.stubGlobal('__guestyToken', undefined)
    vi.stubGlobal('__guestyTokenExpiresAt', undefined)
    vi.stubGlobal('__guestyRateLimitedUntil', undefined)
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN
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

  it('transmet le ccToken dans le payload inquiry', async () => {
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
        json: () =>
          Promise.resolve({
            _id: 'res-123',
            confirmationCode: 'CONF123',
            status: 'reserved',
            listingId: 'lst-123',
            checkIn: '2026-05-01',
            checkOut: '2026-05-05',
            guestsCount: 2,
            money: { totalPaid: 0, balanceDue: 1200, currency: 'EUR' },
            guest: {
              firstName: 'Jean',
              lastName: 'Dupont',
              email: 'jean@test.fr',
              phone: '+33612345678',
            },
          }),
      })
    vi.stubGlobal('fetch', mockFetch)

    const { guestyClient } = await import('@/lib/guesty-client')

    await guestyClient.createInquiry({
      quoteId: 'quote-123',
      ratePlanId: 'rate-123',
      ccToken: 'tok_visa_123',
      guest: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.fr',
        phone: '+33612345678',
      },
      policy: {
        privacy: { accepted: true, acceptedAt: '2026-04-23T00:00:00.000Z' },
        terms: { accepted: true, acceptedAt: '2026-04-23T00:00:00.000Z' },
      },
    })

    const [, request] = mockFetch.mock.calls[1]
    expect(String(mockFetch.mock.calls[1][0])).toContain('/reservations/quotes/quote-123/inquiry')
    expect(request.method).toBe('POST')
    expect(JSON.parse(String(request.body))).toMatchObject({
      ratePlanId: 'rate-123',
      ccToken: 'tok_visa_123',
    })
  })

  it('appelle l’endpoint instant pour une réservation instantanée', async () => {
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
        json: () =>
          Promise.resolve({
            _id: 'res-123',
            confirmationCode: 'CONF123',
            status: 'confirmed',
            listingId: 'lst-123',
            checkIn: '2026-05-01',
            checkOut: '2026-05-05',
            guestsCount: 2,
            money: { totalPaid: 1200, balanceDue: 0, currency: 'EUR' },
            guest: {
              firstName: 'Jean',
              lastName: 'Dupont',
              email: 'jean@test.fr',
              phone: '+33612345678',
            },
          }),
      })
    vi.stubGlobal('fetch', mockFetch)

    const { guestyClient } = await import('@/lib/guesty-client')

    await guestyClient.createInstantReservation({
      quoteId: 'quote-123',
      ratePlanId: 'rate-123',
      ccToken: 'tok_visa_123',
      guest: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.fr',
        phone: '+33612345678',
      },
      policy: {
        privacy: { accepted: true, acceptedAt: '2026-04-23T00:00:00.000Z' },
        terms: { accepted: true, acceptedAt: '2026-04-23T00:00:00.000Z' },
      },
    })

    const [, request] = mockFetch.mock.calls[1]
    expect(String(mockFetch.mock.calls[1][0])).toContain('/reservations/quotes/quote-123/instant')
    expect(request.method).toBe('POST')
    expect(JSON.parse(String(request.body))).toMatchObject({
      ratePlanId: 'rate-123',
      ccToken: 'tok_visa_123',
    })
  })
})
