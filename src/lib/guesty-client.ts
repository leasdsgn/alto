import {
  type GuestyTokenResponse,
  type GuestyListing,
  type GuestyCalendarDay,
  type GuestyQuote,
  type GuestyPaymentProvider,
  type GuestyInstantChargeReservation,
  type GuestyInstantReservationRequest,
  type GuestyVerifyPaymentRequest,
} from '@/types/guesty'
import { type GuestyMock } from './guesty-mock'
import {
  acquireOAuthLock,
  readOAuthCache,
  releaseOAuthLock,
  writeOAuthCache,
  writeRateLimit,
} from './guesty-oauth-cache'
import { withGuestyRateLimit, writeApiRateLimit } from './guesty-rate-limit'

const BEAPI_BASE_URL = 'https://booking.guesty.com'
const TOKEN_URL = `${BEAPI_BASE_URL}/oauth2/token`
const RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000
const TOKEN_SAFETY_MARGIN_MS = 5 * 60 * 1000
const TOKEN_LOCK_TTL_MS = 10 * 1000
const TOKEN_LOCK_WAIT_MS = 5 * 1000
const TOKEN_LOCK_POLL_MS = 200
const TOKEN_LOCK_ATTEMPTS = 3

export interface GuestyListingsQuery {
  fields?: readonly string[]
  checkIn?: string
  checkOut?: string
  guests?: number
  limit?: number
  cursor?: string
}

const memoryCache = globalThis as unknown as {
  __guestyToken?: string
  __guestyTokenExpiresAt?: number
  __guestyRateLimitedUntil?: number
}

let accessTokenRequest: Promise<string> | null = null

async function invalidateAccessToken(): Promise<void> {
  memoryCache.__guestyToken = undefined
  memoryCache.__guestyTokenExpiresAt = undefined
  await writeOAuthCache({ accessToken: '', expiresAt: 0 }).catch(() => {})
}

async function getAccessToken(): Promise<string> {
  const now = Date.now()

  if (memoryCache.__guestyToken && now < (memoryCache.__guestyTokenExpiresAt ?? 0)) {
    return memoryCache.__guestyToken
  }

  if (accessTokenRequest) return accessTokenRequest

  accessTokenRequest = resolveAccessToken().finally(() => {
    accessTokenRequest = null
  })

  return accessTokenRequest
}

async function resolveAccessToken(): Promise<string> {
  const sharedToken = await readSharedAccessToken()
  if (sharedToken) return sharedToken

  for (let attempt = 0; attempt < TOKEN_LOCK_ATTEMPTS; attempt++) {
    const lockOwner = crypto.randomUUID()
    const lockAcquired = await acquireOAuthLock(lockOwner, TOKEN_LOCK_TTL_MS)

    if (lockAcquired === null && process.env.NODE_ENV === 'production') {
      throw new Error('Guesty OAuth cache unavailable')
    }

    if (lockAcquired === false) {
      const waitedToken = await waitForSharedAccessToken()
      if (waitedToken) return waitedToken
      continue
    }

    try {
      const refreshedToken = await readSharedAccessToken()
      if (refreshedToken) return refreshedToken
      return await requestNewAccessToken()
    } finally {
      if (lockAcquired) await releaseOAuthLock(lockOwner)
    }
  }

  throw new Error('Guesty OAuth token lock timeout')
}

async function requestNewAccessToken(): Promise<string> {
  const now = Date.now()
  const clientId = process.env.GUESTY_BEAPI_CLIENT_ID
  const clientSecret = process.env.GUESTY_BEAPI_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('GUESTY_BEAPI_CLIENT_ID et GUESTY_BEAPI_CLIENT_SECRET requis')
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (response.status === 429) {
    const refreshed = await readOAuthCache()
    const refreshedAt = Date.now()

    if (refreshed?.accessToken && refreshedAt < refreshed.expiresAt) {
      memoryCache.__guestyToken = refreshed.accessToken
      memoryCache.__guestyTokenExpiresAt = refreshed.expiresAt
      return refreshed.accessToken
    }

    const rateLimitedUntil = now + getRetryAfterMs(response)
    memoryCache.__guestyRateLimitedUntil = rateLimitedUntil
    await writeRateLimit(rateLimitedUntil)
    throw new Error(
      'Guesty rate limited, retry apres ' + new Date(rateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Guesty OAuth failed (${response.status}): ${error}`)
  }

  const data: GuestyTokenResponse = await response.json()
  const expiresAt = now + data.expires_in * 1000 - TOKEN_SAFETY_MARGIN_MS

  memoryCache.__guestyToken = data.access_token
  memoryCache.__guestyTokenExpiresAt = expiresAt
  await writeOAuthCache({ accessToken: data.access_token, expiresAt })

  return data.access_token
}

async function readSharedAccessToken(): Promise<string | null> {
  const now = Date.now()
  const shared = await readOAuthCache()

  if (shared?.accessToken && now < shared.expiresAt) {
    memoryCache.__guestyToken = shared.accessToken
    memoryCache.__guestyTokenExpiresAt = shared.expiresAt
    return shared.accessToken
  }

  if (shared?.rateLimitedUntil && now < shared.rateLimitedUntil) {
    memoryCache.__guestyRateLimitedUntil = shared.rateLimitedUntil
    throw new Error(
      'Guesty rate limited, retry apres ' +
        new Date(shared.rateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }

  if (memoryCache.__guestyRateLimitedUntil && now < memoryCache.__guestyRateLimitedUntil) {
    throw new Error(
      'Guesty rate limited, retry apres ' +
        new Date(memoryCache.__guestyRateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }

  return null
}

async function waitForSharedAccessToken(): Promise<string | null> {
  const deadline = Date.now() + TOKEN_LOCK_WAIT_MS

  while (Date.now() < deadline) {
    await wait(TOKEN_LOCK_POLL_MS)

    const sharedToken = await readSharedAccessToken()
    if (sharedToken) return sharedToken
  }

  return null
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetryAfterMs(response: Response) {
  const retryAfter = response.headers?.get('retry-after')
  if (!retryAfter) return RATE_LIMIT_COOLDOWN_MS

  const retryAfterSeconds = Number(retryAfter)
  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(1000, retryAfterSeconds * 1000)
  }

  const retryAfterDate = Date.parse(retryAfter)
  if (Number.isFinite(retryAfterDate)) {
    return Math.max(1000, retryAfterDate - Date.now())
  }

  return RATE_LIMIT_COOLDOWN_MS
}

function buildListingsPath(query: GuestyListingsQuery = {}) {
  const params = new URLSearchParams()

  if (query.fields?.length) params.set('fields', query.fields.join(' '))
  if (query.checkIn) params.set('checkIn', query.checkIn)
  if (query.checkOut) params.set('checkOut', query.checkOut)
  if (query.guests) params.set('minOccupancy', String(query.guests))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.cursor) params.set('cursor', query.cursor)

  const queryString = params.toString()
  return queryString ? `/listings?${queryString}` : '/listings'
}

async function guestyFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number } = {},
  isRetry = false,
): Promise<T> {
  const token = await getAccessToken()
  const { revalidate, ...fetchOptions } = options

  const response = await withGuestyRateLimit(() =>
    fetch(`${BEAPI_BASE_URL}/api${path}`, {
      ...fetchOptions,
      headers: {
        Accept: 'application/json; charset=utf-8',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...fetchOptions.headers,
      },
      ...(revalidate !== undefined && { next: { revalidate } }),
    }),
  )

  if (response.status === 401 && !isRetry) {
    await invalidateAccessToken()
    return guestyFetch<T>(path, options, true)
  }

  if (response.status === 429) {
    const rateLimitedUntil = Date.now() + getRetryAfterMs(response)
    await writeApiRateLimit(rateLimitedUntil)
    throw new Error(
      'Guesty rate limited, retry apres ' + new Date(rateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Guesty API error (${response.status}): ${error}`)
  }

  return response.json() as Promise<T>
}

const USE_MOCK = process.env.GUESTY_MOCK === 'true'

type GuestyCalendarResponse = { days: GuestyCalendarDay[] }
type GuestyCalendarPayload = GuestyCalendarResponse | GuestyCalendarDay[]

function normalizeCalendar(payload: GuestyCalendarPayload): GuestyCalendarResponse {
  if (Array.isArray(payload)) return { days: payload }
  return { days: Array.isArray(payload.days) ? payload.days : [] }
}

async function mock<K extends keyof GuestyMock>(method: K): Promise<GuestyMock[K]> {
  const { guestyMock } = await import('./guesty-mock')
  return guestyMock[method]
}

export const guestyClient = {
  getListings(query?: GuestyListingsQuery) {
    if (USE_MOCK) return mock('getListings').then((fn) => fn())
    return guestyFetch<{ results: GuestyListing[] }>(buildListingsPath(query), { revalidate: 300 })
  },

  getListing(listingId: string) {
    if (USE_MOCK) return mock('getListing').then((fn) => fn(listingId))
    return guestyFetch<GuestyListing>(`/listings/${listingId}`)
  },

  getListingCalendar(listingId: string, from: string, to: string) {
    if (USE_MOCK) return mock('getListingCalendar').then((fn) => fn(listingId, from, to))
    const params = new URLSearchParams({ from, to })
    return guestyFetch<GuestyCalendarPayload>(`/listings/${listingId}/calendar?${params}`).then(
      normalizeCalendar,
    )
  },

  getAvailableListings(
    checkIn: string,
    checkOut: string,
    guests?: number,
    options: Pick<GuestyListingsQuery, 'fields'> = {},
  ) {
    if (USE_MOCK) return mock('getAvailableListings').then((fn) => fn(checkIn, checkOut, guests))
    return guestyFetch<{ results: GuestyListing[] }>(
      buildListingsPath({ checkIn, checkOut, guests, fields: options.fields }),
      { revalidate: 60 },
    )
  },

  createQuote(listingId: string, checkIn: string, checkOut: string, guestsCount: number) {
    if (USE_MOCK)
      return mock('createQuote').then((fn) => fn(listingId, checkIn, checkOut, guestsCount))
    return guestyFetch<GuestyQuote>('/reservations/quotes', {
      method: 'POST',
      body: JSON.stringify({
        listingId,
        checkInDateLocalized: checkIn,
        checkOutDateLocalized: checkOut,
        guestsCount,
      }),
    })
  },

  getPaymentProvider(listingId: string) {
    if (USE_MOCK) return mock('getPaymentProvider').then((fn) => fn(listingId))
    return guestyFetch<GuestyPaymentProvider>(`/listings/${listingId}/payment-provider`)
  },

  createInstantReservation(body: GuestyInstantReservationRequest) {
    const { quoteId, ...payload } = body
    if (USE_MOCK) return mock('createInstantReservation').then((fn) => fn(body))
    return guestyFetch<GuestyInstantChargeReservation>(
      `/reservations/quotes/${quoteId}/instant-charge`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },

  verifyReservationPayment(body: GuestyVerifyPaymentRequest) {
    // GuestyPay uniquement. Le flow Stripe direct finalise le 3DS via Stripe.js.
    const { reservationId, ...payload } = body
    if (USE_MOCK) return mock('verifyReservationPayment').then((fn) => fn(body))
    return guestyFetch<GuestyInstantChargeReservation>(
      `/reservations/${reservationId}/verify-payment`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    )
  },
}
