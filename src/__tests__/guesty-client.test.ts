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

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ access_token: 'tok', expires_in: 3600, token_type: 'Bearer' }),
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

  it('appelle l’endpoint instant-charge pour une réservation instantanée', async () => {
    process.env.GUESTY_BEAPI_CLIENT_ID = 'test-id'
    process.env.GUESTY_BEAPI_CLIENT_SECRET = 'test-secret'

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ access_token: 'tok', expires_in: 3600, token_type: 'Bearer' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            reservation: {
              _id: 'res-123',
              confirmationCode: 'CONF123',
              status: 'confirmed',
              checkInDateLocalized: '2026-05-01',
              checkOutDateLocalized: '2026-05-05',
              guestsCount: 2,
            },
            payment: {
              _id: 'pay-123',
              status: 'done',
              amount: 1200,
              currency: 'EUR',
              reservationId: 'res-123',
              paymentMethodId: 'pm_123',
            },
          }),
      })
    vi.stubGlobal('fetch', mockFetch)

    const { guestyClient } = await import('@/lib/guesty-client')

    await guestyClient.createInstantReservation({
      quoteId: 'quote-123',
      ratePlanId: 'rate-123',
      confirmationToken: 'ctoken_visa_123',
      guest: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@test.fr',
        phone: '+33612345678',
      },
      policy: {
        privacy: { isAccepted: true, dateOfAcceptance: '2026-04-23T00:00:00.000Z' },
        termsAndConditions: { isAccepted: true, dateOfAcceptance: '2026-04-23T00:00:00.000Z' },
      },
    })

    const [, request] = mockFetch.mock.calls[1]
    expect(String(mockFetch.mock.calls[1][0])).toContain(
      '/reservations/quotes/quote-123/instant-charge',
    )
    expect(request.method).toBe('POST')
    expect(JSON.parse(String(request.body))).toMatchObject({
      ratePlanId: 'rate-123',
      confirmationToken: 'ctoken_visa_123',
      policy: {
        privacy: {
          isAccepted: true,
          dateOfAcceptance: '2026-04-23T00:00:00.000Z',
        },
        termsAndConditions: {
          isAccepted: true,
          dateOfAcceptance: '2026-04-23T00:00:00.000Z',
        },
      },
    })
  })

  it('appelle l’endpoint verify-payment pour une réservation en pending auth', async () => {
    process.env.GUESTY_BEAPI_CLIENT_ID = 'test-id'
    process.env.GUESTY_BEAPI_CLIENT_SECRET = 'test-secret'

    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({ access_token: 'tok', expires_in: 3600, token_type: 'Bearer' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            reservation: {
              _id: 'res-123',
              confirmationCode: 'CONF123',
              status: 'confirmed',
            },
            payment: {
              _id: 'pay-123',
              status: 'done',
              amount: 1200,
              currency: 'EUR',
              reservationId: 'res-123',
              paymentMethodId: 'pm_123',
            },
          }),
      })
    vi.stubGlobal('fetch', mockFetch)

    const { guestyClient } = await import('@/lib/guesty-client')

    await guestyClient.verifyReservationPayment({
      reservationId: 'res-123',
      paymentId: 'pay-123',
    })

    const [, request] = mockFetch.mock.calls[1]
    expect(String(mockFetch.mock.calls[1][0])).toContain('/reservations/res-123/verify-payment')
    expect(request.method).toBe('POST')
    expect(JSON.parse(String(request.body))).toEqual({
      paymentId: 'pay-123',
    })
  })
})
