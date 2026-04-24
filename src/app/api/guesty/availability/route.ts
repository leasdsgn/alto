import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'

const schema = z.object({
  listingId: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  guests: z.coerce.number().int().positive().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = schema.safeParse(params)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { listingId, checkIn, checkOut } = parsed.data

    const data = await guestyClient.getListingCalendar(listingId, checkIn, checkOut)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[availability] error', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
