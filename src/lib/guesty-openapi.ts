import type { GuestyCancellationReason } from '@/lib/instant-charge-payment'
import type { GuestyCustomFields } from '@/types/guesty'

const OPENAPI_BASE_URL = 'https://open-api.guesty.com'
const TOKEN_URL = `${OPENAPI_BASE_URL}/oauth2/token`

const tokenCache = globalThis as unknown as {
  __guestyOpenApiToken?: string
  __guestyOpenApiTokenExpiresAt?: number
}

async function getOpenApiToken(): Promise<string> {
  if (
    tokenCache.__guestyOpenApiToken &&
    Date.now() < (tokenCache.__guestyOpenApiTokenExpiresAt ?? 0)
  ) {
    return tokenCache.__guestyOpenApiToken
  }

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

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Guesty Open API OAuth failed (${response.status}): ${error}`)
  }

  const data = (await response.json()) as { access_token: string; expires_in: number }

  tokenCache.__guestyOpenApiToken = data.access_token
  tokenCache.__guestyOpenApiTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000

  return data.access_token
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
      fields: 'customFields',
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
