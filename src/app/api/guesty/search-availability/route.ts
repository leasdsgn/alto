import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { hasRedisConfig, redisCommand } from '@/lib/guesty-oauth-cache'
import { isCalendarDateAvailableForRequestedStay } from '@/lib/search-availability'
import type { GuestyListing } from '@/types/guesty'

const schema = z.object({
  city: z.string().min(1),
  guests: z.coerce.number().int().positive().default(1),
  from: z.iso.date(),
  to: z.iso.date(),
  nights: z.coerce.number().int().positive().max(30).default(1),
})

const MS_PER_DAY = 24 * 60 * 60 * 1000
const CACHE_TTL_SECONDS = 180
const CACHE_HEADER = `s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=900`
const MEMORY_CACHE_MAX_ENTRIES = 80

interface SearchAvailabilityPayload {
  unavailableDates: string[]
  checkedListings: number
}

const memoryCache = new Map<string, { expiresAt: number; payload: SearchAvailabilityPayload }>()
const pendingRequests = new Map<string, Promise<SearchAvailabilityPayload>>()

export async function GET(request: NextRequest) {
  try {
    const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { city, guests, from, to, nights } = parsed.data
    const startDate = parseDate(from)
    const endDate = parseDate(to)

    if (endDate < startDate) {
      return NextResponse.json({ error: 'invalid_range' }, { status: 400 })
    }

    const cacheKey = buildCacheKey({ city, guests, from, to, nights })
    const cached = await readAvailabilityCache(cacheKey)

    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': CACHE_HEADER,
        },
      })
    }

    const pending = pendingRequests.get(cacheKey)
    if (pending) {
      const payload = await pending
      return NextResponse.json(payload, {
        headers: {
          'Cache-Control': CACHE_HEADER,
        },
      })
    }

    const requestPromise = resolveSearchAvailability({
      city,
      guests,
      startDate,
      endDate,
      nights,
    }).finally(() => {
      pendingRequests.delete(cacheKey)
    })

    pendingRequests.set(cacheKey, requestPromise)
    const payload = await requestPromise
    await writeAvailabilityCache(cacheKey, payload)

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': CACHE_HEADER,
      },
    })
  } catch (error) {
    console.error('[search availability] error', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

async function resolveSearchAvailability({
  city,
  guests,
  startDate,
  endDate,
  nights,
}: {
  city: string
  guests: number
  startDate: Date
  endDate: Date
  nights: number
}): Promise<SearchAvailabilityPayload> {
  const { results } = await guestyClient.getListings()
  const listings = results.filter(
    (listing) => matchesCity(listing, city) && listing.accommodates >= guests,
  )

  const availableStarts = new Set<string>()
  const candidateDates = listDates(startDate, endDate)
  const calendarEnd = addDays(endDate, nights)

  const calendarResults = await mapWithConcurrency(listings, 4, async (listing) => {
    if (listing.maxNights && nights > listing.maxNights) return { status: 'skipped' as const }

    try {
      const calendar = await guestyClient.getListingCalendar(
        listing._id,
        formatDate(startDate),
        formatDate(calendarEnd),
      )

      return { status: 'fulfilled' as const, calendar, listing }
    } catch (error) {
      console.warn('[search availability] listing calendar failed', {
        listingId: listing._id,
        error: error instanceof Error ? error.message : String(error),
      })

      return { status: 'rejected' as const }
    }
  })

  const checkedListings = calendarResults.filter((result) => result?.status === 'fulfilled').length
  const failedListings = calendarResults.filter((result) => result?.status === 'rejected').length

  if (checkedListings === 0 && failedListings > 0) {
    throw new Error('search_availability_calendars_failed')
  }

  for (const result of calendarResults) {
    if (result?.status !== 'fulfilled') continue

    const calendar = result.calendar
    const daysByDate = new Map(calendar.days.map((day) => [day.date.slice(0, 10), day]))

    for (const date of candidateDates) {
      if (
        isCalendarDateAvailableForRequestedStay({
          daysByDate,
          startDate: formatDate(date),
          requestedNights: nights,
          fallbackMinNights: result.listing.minNights,
          fallbackMaxNights: result.listing.maxNights,
        })
      ) {
        availableStarts.add(formatDate(date))
      }
    }
  }

  const unavailableDates = candidateDates
    .map(formatDate)
    .filter((date) => !availableStarts.has(date))

  return {
    unavailableDates,
    checkedListings,
  }
}

async function readAvailabilityCache(key: string): Promise<SearchAvailabilityPayload | null> {
  const memoryEntry = memoryCache.get(key)
  if (memoryEntry && Date.now() < memoryEntry.expiresAt) return memoryEntry.payload

  if (!hasRedisConfig()) return null

  try {
    const value = await redisCommand<string>(['GET', key])
    if (!value) return null

    const payload = parseCachedPayload(value)
    if (payload) writeMemoryCache(key, payload)
    return payload
  } catch (error) {
    console.error('[search availability] cache read failed', error)
    return null
  }
}

async function writeAvailabilityCache(key: string, payload: SearchAvailabilityPayload) {
  writeMemoryCache(key, payload)

  if (!hasRedisConfig()) return

  try {
    await redisCommand<string>(['SET', key, JSON.stringify(payload), 'EX', CACHE_TTL_SECONDS])
  } catch (error) {
    console.error('[search availability] cache write failed', error)
  }
}

function writeMemoryCache(key: string, payload: SearchAvailabilityPayload) {
  memoryCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    payload,
  })

  if (memoryCache.size <= MEMORY_CACHE_MAX_ENTRIES) return

  const oldestKey = memoryCache.keys().next().value
  if (oldestKey) memoryCache.delete(oldestKey)
}

function parseCachedPayload(value: string): SearchAvailabilityPayload | null {
  try {
    const parsed = JSON.parse(value) as Partial<SearchAvailabilityPayload>
    if (
      Array.isArray(parsed.unavailableDates) &&
      parsed.unavailableDates.every((date) => typeof date === 'string') &&
      typeof parsed.checkedListings === 'number'
    ) {
      return {
        unavailableDates: parsed.unavailableDates,
        checkedListings: parsed.checkedListings,
      }
    }
  } catch {
    return null
  }

  return null
}

function buildCacheKey({
  city,
  guests,
  from,
  to,
  nights,
}: {
  city: string
  guests: number
  from: string
  to: string
  nights: number
}) {
  return ['guesty:search_availability', normalize(city) || 'all', guests, from, to, nights].join(
    ':',
  )
}

function matchesCity(listing: GuestyListing, city: string) {
  return normalize(listing.address?.city).includes(normalize(city))
}

function normalize(value: string | undefined | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * MS_PER_DAY)
}

function listDates(start: Date, end: Date) {
  const dates: Date[] = []

  for (let current = start; current <= end; current = addDays(current, 1)) {
    dates.push(current)
  }

  return dates
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
) {
  const results: R[] = []

  for (let index = 0; index < items.length; index += concurrency) {
    const batch = items.slice(index, index + concurrency)
    results.push(...(await Promise.all(batch.map(mapper))))
  }

  return results
}
