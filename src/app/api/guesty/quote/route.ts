import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'

const schema = z.object({
  listingId: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  guestsCount: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { listingId, checkIn, checkOut, guestsCount } = parsed.data

    const data = await guestyClient.createQuote(listingId, checkIn, checkOut, guestsCount)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
