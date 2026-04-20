import {
  type GuestyTokenResponse,
  type GuestyListing,
  type GuestyCalendarDay,
  type GuestyQuote,
  type GuestyPaymentProvider,
  type GuestyReservation,
} from '@/types/guesty'

const BEAPI_BASE_URL = 'https://booking.guesty.com'
const TOKEN_URL = `${BEAPI_BASE_URL}/oauth2/token`

const tokenCache = globalThis as unknown as {
  __guestyToken?: string
  __guestyTokenExpiresAt?: number
  __guestyRateLimitedUntil?: number
}

async function getAccessToken(): Promise<string> {
  if (tokenCache.__guestyToken && Date.now() < (tokenCache.__guestyTokenExpiresAt ?? 0)) {
    return tokenCache.__guestyToken
  }

  if (tokenCache.__guestyRateLimitedUntil && Date.now() < tokenCache.__guestyRateLimitedUntil) {
    throw new Error('Guesty rate limited, retry apres ' + new Date(tokenCache.__guestyRateLimitedUntil).toLocaleTimeString('fr-FR'))
  }

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
    tokenCache.__guestyRateLimitedUntil = Date.now() + 2 * 60 * 1000
    throw new Error('Guesty rate limited, pause 2 min')
  }

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Guesty OAuth failed (${response.status}): ${error}`)
  }

  const data: GuestyTokenResponse = await response.json()

  tokenCache.__guestyToken = data.access_token
  tokenCache.__guestyTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000

  return tokenCache.__guestyToken
}

async function guestyFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number } = {},
): Promise<T> {
  const token = await getAccessToken()
  const { revalidate, ...fetchOptions } = options

  const response = await fetch(`${BEAPI_BASE_URL}/api${path}`, {
    ...fetchOptions,
    headers: {
      Accept: 'application/json; charset=utf-8',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...fetchOptions.headers,
    },
    ...(revalidate !== undefined && { next: { revalidate } }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Guesty API error (${response.status}): ${error}`)
  }

  return response.json() as Promise<T>
}

export const guestyClient = {
  getListings() {
    return guestyFetch<{ results: GuestyListing[] }>('/listings', { revalidate: 300 })
  },

  getListing(listingId: string) {
    return guestyFetch<GuestyListing>(`/listings/${listingId}`)
  },

  getListingCalendar(listingId: string, from: string, to: string) {
    const params = new URLSearchParams({ from, to })
    return guestyFetch<{ days: GuestyCalendarDay[] }>(
      `/listings/${listingId}/calendar?${params}`,
    )
  },

  getAvailableListings(checkIn: string, checkOut: string, guests?: number) {
    const params = new URLSearchParams({ checkIn, checkOut })
    if (guests) params.set('minOccupancy', String(guests))
    return guestyFetch<{ results: GuestyListing[] }>(`/listings?${params}`, { revalidate: 60 })
  },

  createQuote(listingId: string, checkIn: string, checkOut: string, guestsCount: number) {
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
    return guestyFetch<GuestyPaymentProvider>(`/listings/${listingId}/payment-provider`)
  },

  createInstantReservation(body: {
    quoteId: string
    ratePlanId: string
    ccToken: string
    guest: { firstName: string; lastName: string; email: string; phone: string }
    policy: { privacy: boolean; terms: boolean }
  }) {
    return guestyFetch<GuestyReservation>('/reservations/instant', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  createInquiry(body: {
    quoteId: string
    ratePlanId: string
    guest: { firstName: string; lastName: string; email: string; phone: string }
    policy: { privacy: boolean; terms: boolean }
  }) {
    return guestyFetch<GuestyReservation>('/reservations/inquiry', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },
}
