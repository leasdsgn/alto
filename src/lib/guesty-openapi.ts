import type { GuestyCancellationReason } from '@/lib/instant-charge-payment'
import type { GuestyCustomFields } from '@/types/guesty'
import {
  acquireOpenApiOAuthLock,
  readOpenApiOAuthCache,
  releaseOpenApiOAuthLock,
  writeOpenApiOAuthCache,
  writeOpenApiOAuthRateLimit,
} from '@/lib/guesty-openapi-cache'

const OPENAPI_BASE_URL = 'https://open-api.guesty.com'
const TOKEN_URL = `${OPENAPI_BASE_URL}/oauth2/token`
const TOKEN_SAFETY_MARGIN_MS = 30 * 60 * 1000
const TOKEN_LOCK_TTL_MS = 10 * 1000
const TOKEN_LOCK_WAIT_MS = 5 * 1000
const TOKEN_LOCK_POLL_MS = 200
const TOKEN_LOCK_ATTEMPTS = 3
const TOKEN_RATE_LIMIT_FALLBACK_MS = 24 * 60 * 60 * 1000

const tokenCache = globalThis as unknown as {
  __guestyOpenApiToken?: string
  __guestyOpenApiTokenExpiresAt?: number
  __guestyOpenApiRateLimitedUntil?: number
}

let accessTokenRequest: Promise<string> | null = null

async function getOpenApiToken(): Promise<string> {
  const now = Date.now()

  if (tokenCache.__guestyOpenApiToken && now < (tokenCache.__guestyOpenApiTokenExpiresAt ?? 0)) {
    return tokenCache.__guestyOpenApiToken
  }

  if (accessTokenRequest) return accessTokenRequest

  accessTokenRequest = resolveOpenApiToken().finally(() => {
    accessTokenRequest = null
  })

  return accessTokenRequest
}

async function resolveOpenApiToken(): Promise<string> {
  const sharedToken = await readSharedOpenApiToken()
  if (sharedToken) return sharedToken

  for (let attempt = 0; attempt < TOKEN_LOCK_ATTEMPTS; attempt += 1) {
    const lockOwner = crypto.randomUUID()
    const lockAcquired = await acquireOpenApiOAuthLock(lockOwner, TOKEN_LOCK_TTL_MS)

    if (lockAcquired === null && process.env.NODE_ENV === 'production') {
      throw new Error('Guesty Open API OAuth cache unavailable')
    }

    if (lockAcquired === false) {
      const waitedToken = await waitForSharedOpenApiToken()
      if (waitedToken) return waitedToken
      continue
    }

    try {
      const refreshedToken = await readSharedOpenApiToken()
      if (refreshedToken) return refreshedToken
      return await requestNewOpenApiToken()
    } finally {
      if (lockAcquired) await releaseOpenApiOAuthLock(lockOwner)
    }
  }

  throw new Error('Guesty Open API OAuth token lock timeout')
}

async function requestNewOpenApiToken(): Promise<string> {
  const now = Date.now()

  const clientId = process.env.GUESTY_OPENAPI_CLIENT_ID
  const clientSecret = process.env.GUESTY_OPENAPI_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('GUESTY_OPENAPI_CLIENT_ID et GUESTY_OPENAPI_CLIENT_SECRET requis')
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'open-api',
    }),
  })

  if (response.status === 429) {
    const refreshedToken = await readOpenApiOAuthCache()
    if (refreshedToken?.accessToken && Date.now() < refreshedToken.expiresAt) {
      cacheOpenApiToken(refreshedToken.accessToken, refreshedToken.expiresAt)
      return refreshedToken.accessToken
    }

    const rateLimitedUntil = now + getOAuthRateLimitDelayMs(response)
    tokenCache.__guestyOpenApiRateLimitedUntil = rateLimitedUntil
    await writeOpenApiOAuthRateLimit(rateLimitedUntil)
    throw new Error(
      'Guesty Open API OAuth rate limited, retry apres ' +
        new Date(rateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Guesty Open API OAuth failed (${response.status}): ${error}`)
  }

  const data = (await response.json()) as { access_token: string; expires_in: number }
  const expiresInMs = data.expires_in * 1000
  const safetyMarginMs = Math.min(TOKEN_SAFETY_MARGIN_MS, expiresInMs / 2)
  const expiresAt = now + expiresInMs - safetyMarginMs

  cacheOpenApiToken(data.access_token, expiresAt)
  await writeOpenApiOAuthCache({ accessToken: data.access_token, expiresAt })

  return data.access_token
}

async function readSharedOpenApiToken(): Promise<string | null> {
  const now = Date.now()
  const shared = await readOpenApiOAuthCache()

  if (shared?.accessToken && now < shared.expiresAt) {
    cacheOpenApiToken(shared.accessToken, shared.expiresAt)
    return shared.accessToken
  }

  if (shared?.rateLimitedUntil && now < shared.rateLimitedUntil) {
    tokenCache.__guestyOpenApiRateLimitedUntil = shared.rateLimitedUntil
    throw new Error(
      'Guesty Open API OAuth rate limited, retry apres ' +
        new Date(shared.rateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }

  if (
    tokenCache.__guestyOpenApiRateLimitedUntil &&
    now < tokenCache.__guestyOpenApiRateLimitedUntil
  ) {
    throw new Error(
      'Guesty Open API OAuth rate limited, retry apres ' +
        new Date(tokenCache.__guestyOpenApiRateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }

  return null
}

async function waitForSharedOpenApiToken(): Promise<string | null> {
  const deadline = Date.now() + TOKEN_LOCK_WAIT_MS

  while (Date.now() < deadline) {
    await wait(TOKEN_LOCK_POLL_MS)
    const sharedToken = await readSharedOpenApiToken()
    if (sharedToken) return sharedToken
  }

  return null
}

function cacheOpenApiToken(accessToken: string, expiresAt: number) {
  tokenCache.__guestyOpenApiToken = accessToken
  tokenCache.__guestyOpenApiTokenExpiresAt = expiresAt
  tokenCache.__guestyOpenApiRateLimitedUntil = undefined
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getOAuthRateLimitDelayMs(response: Response) {
  const reset = parseDelayHeader(response.headers?.get('ratelimit-reset'))
  if (reset) return reset

  const retryAfter = parseDelayHeader(response.headers?.get('retry-after'))
  return retryAfter ?? TOKEN_RATE_LIMIT_FALLBACK_MS
}

function parseDelayHeader(value: string | null) {
  if (!value) return null

  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(1000, seconds * 1000)

  const date = Date.parse(value)
  if (Number.isFinite(date)) return Math.max(1000, date - Date.now())

  return null
}

async function openApiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getOpenApiToken()
  const response = await fetch(`${OPENAPI_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Guesty Open API error (${response.status}): ${error}`)
  }

  return response.json() as Promise<T>
}

interface GuestyOpenApiPayment {
  _id?: string
  id?: string
  amount?: number
  currency?: string
  status?: string
}

export interface GuestyOpenApiReservation {
  _id?: string
  id?: string
  status?: string
  listingId?: string
  guest?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  checkInDateLocalized?: string
  checkOutDateLocalized?: string
  guestsCount?: number
  money?: {
    totalPaid?: number
    balanceDue?: number
    currency?: string
    payments?: GuestyOpenApiPayment[]
  }
  payments?: GuestyOpenApiPayment[]
}

export interface GuestyOpenApiListingVisibility {
  _id?: string
  id?: string
  customFields?: GuestyCustomFields
  areaSquareFeet?: number
}

interface GuestyOpenApiListingVisibilityPage {
  results?: GuestyOpenApiListingVisibility[]
  count?: number
  limit?: number
  skip?: number
}

export const guestyOpenApi = {
  getListingVisibilityPage({ limit, skip }: { limit: number; skip: number }) {
    const params = new URLSearchParams({
      fields: 'customFields areaSquareFeet',
      limit: String(limit),
      skip: String(skip),
    })
    return openApiFetch<GuestyOpenApiListingVisibilityPage>(`/v1/listings?${params}`)
  },

  getListingCustomFields(listingId: string) {
    return openApiFetch<GuestyCustomFields>(`/v1/listings/${listingId}/custom-fields`)
  },

  getReservation(reservationId: string) {
    if (process.env.GUESTY_MOCK === 'true') {
      return Promise.resolve(buildMockReservation(reservationId))
    }
    return openApiFetch<GuestyOpenApiReservation>(`/v1/reservations/${reservationId}`)
  },

  cancelReservation(reservationId: string, reason: GuestyCancellationReason) {
    if (process.env.GUESTY_MOCK === 'true') {
      return Promise.resolve({ _id: reservationId, status: 'canceled', mock: true })
    }
    return openApiFetch<{ _id: string; status: string }>(`/v1/reservations/${reservationId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'canceled',
        cancellationReason: reason,
      }),
    })
  },

  refundReservationPayment(
    reservationId: string,
    paymentId: string,
    amount: number,
    note?: string,
  ) {
    if (process.env.GUESTY_MOCK === 'true') {
      return Promise.resolve({
        reservationId,
        paymentId,
        amount,
        status: 'refunded',
        mock: true,
      })
    }
    return openApiFetch<{ status: string }>(
      `/v1/reservations/${reservationId}/payments/${paymentId}/refund`,
      {
        method: 'POST',
        body: JSON.stringify({
          amount,
          ...(note && { note }),
        }),
      },
    )
  },
}

function buildMockReservation(reservationId: string): GuestyOpenApiReservation {
  return {
    _id: reservationId,
    status: 'confirmed',
    listingId: 'mock-faubourg',
    guest: {
      firstName: 'Camille',
      lastName: 'Martin',
      email: 'camille@example.com',
      phone: '+33600000000',
    },
    checkInDateLocalized: '2026-05-20',
    checkOutDateLocalized: '2026-05-24',
    guestsCount: 2,
    money: {
      totalPaid: 980,
      balanceDue: 0,
      currency: 'EUR',
      payments: [
        {
          _id: 'pay-mock-1',
          amount: 980,
          currency: 'EUR',
          status: 'done',
        },
      ],
    },
  }
}
