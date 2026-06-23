import { type NextRequest, NextResponse } from 'next/server'

const DEFAULT_SITE_URL = 'https://alto-collection.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL

function normalizeHost(value: string | null | undefined): string | null {
  const candidate = value?.split(',')[0]?.trim()
  if (!candidate) return null

  try {
    return new URL(candidate).host.toLowerCase()
  } catch {
    try {
      return new URL(`https://${candidate}`).host.toLowerCase()
    } catch {
      return null
    }
  }
}

function getAllowedHosts(request: NextRequest): Set<string> {
  return new Set(
    [
      request.nextUrl.host,
      request.headers.get('host'),
      request.headers.get('x-forwarded-host'),
      SITE_URL,
      DEFAULT_SITE_URL,
    ]
      .map(normalizeHost)
      .filter((host): host is string => Boolean(host)),
  )
}

function isAllowedSource(value: string | null, allowedHosts: Set<string>): boolean {
  const host = normalizeHost(value)
  return Boolean(host && allowedHosts.has(host))
}

export function assertSameOrigin(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV === 'development') return null

  const allowedHosts = getAllowedHosts(request)
  const origin = request.headers.get('origin')
  if (origin) {
    if (isAllowedSource(origin, allowedHosts)) return null

    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  if (isAllowedSource(request.headers.get('referer'), allowedHosts)) return null

  return NextResponse.json({ error: 'forbidden' }, { status: 403 })
}
