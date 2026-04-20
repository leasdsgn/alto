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

export const guestyOpenApi = {
  cancelReservation(reservationId: string, reason?: string) {
    if (process.env.GUESTY_MOCK === 'true') {
      return Promise.resolve({ _id: reservationId, status: 'canceled', mock: true })
    }
    return openApiFetch<{ _id: string; status: string }>(
      `/reservations/${reservationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          status: 'canceled',
          ...(reason && { cancellationReason: reason }),
        }),
      },
    )
  },
}
