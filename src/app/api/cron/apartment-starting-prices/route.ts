import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import {
  APARTMENT_STARTING_PRICES_CACHE_TAG,
  preloadApartmentStartingPrices,
} from '@/components/sections/apartments-section'

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authorization !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  revalidateTag(APARTMENT_STARTING_PRICES_CACHE_TAG, { expire: 0 })
  const result = await preloadApartmentStartingPrices()

  return NextResponse.json({
    ok: true,
    refreshed: true,
    durationMs: Date.now() - startedAt,
    ...result,
  })
}
