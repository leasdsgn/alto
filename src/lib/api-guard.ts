import { type NextRequest, NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alto-virid.vercel.app'

export function assertSameOrigin(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV === 'development') return null

  const origin = request.headers.get('origin')
  if (!origin) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  try {
    const originHost = new URL(origin).host
    const siteHost = new URL(SITE_URL).host
    if (originHost !== siteHost) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  return null
}
