import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import type { GuestyCalendarDay, GuestyListing } from '@/types/guesty'

const schema = z.object({
  city: z.string().min(1),
  guests: z.coerce.number().int().positive().default(1),
  from: z.iso.date(),
  to: z.iso.date(),
  nights: z.coerce.number().int().positive().max(30).default(1),
})

const MS_PER_DAY = 24 * 60 * 60 * 1000

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

    const { results } = await guestyClient.getListings()
    const listings = results.filter(
      (listing) => matchesCity(listing, city) && listing.accommodates >= guests,
    )

    const availableStarts = new Set<string>()
    const candidateDates = listDates(startDate, endDate)
    const calendarEnd = addDays(endDate, nights)

    for (const listing of listings) {
      if (listing.minNights && nights < listing.minNights) continue
      if (listing.maxNights && nights > listing.maxNights) continue

      const calendar = await guestyClient.getListingCalendar(
        listing._id,
        formatDate(startDate),
        formatDate(calendarEnd),
      )
      const daysByDate = new Map(calendar.days.map((day) => [day.date.slice(0, 10), day]))

      for (const date of candidateDates) {
        if (isListingAvailableForStay(daysByDate, date, nights)) {
          availableStarts.add(formatDate(date))
        }
      }
    }

    const unavailableDates = candidateDates
      .map(formatDate)
      .filter((date) => !availableStarts.has(date))

    return NextResponse.json(
      {
        unavailableDates,
        checkedListings: listings.length,
      },
      {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=900',
        },
      },
    )
  } catch (error) {
    console.error('[search availability] error', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
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

function isListingAvailableForStay(
  daysByDate: Map<string, GuestyCalendarDay>,
  startDate: Date,
  nights: number,
) {
  for (let index = 0; index < nights; index += 1) {
    const date = formatDate(addDays(startDate, index))
    if (daysByDate.get(date)?.status !== 'available') return false
  }

  return true
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
