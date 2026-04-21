import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { toErrorResponse, parseGuestyError } from '@/lib/guesty-errors'

const schema = z.object({
  listingId: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  guestsCount: z.number().int().positive(),
  preferredLanguage: z.enum(['fr', 'en']).default('fr'),
})

export async function POST(request: NextRequest) {
  let locale: 'fr' | 'en' = 'fr'

  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      const { body: errorBody, status } = toErrorResponse(
        new Error('{"error":{"code":"VALIDATION_FAILED"}}'),
        (body as { preferredLanguage?: 'fr' | 'en' })?.preferredLanguage ?? 'fr',
      )
      return NextResponse.json(
        { ...errorBody, issues: parsed.error.issues },
        { status },
      )
    }

    locale = parsed.data.preferredLanguage

    const { listingId, checkIn, checkOut, guestsCount } = parsed.data
    const data = await guestyClient.createQuote(listingId, checkIn, checkOut, guestsCount)
    return NextResponse.json(data)
  } catch (error) {
    const { body, status } = toErrorResponse(error, locale)
    console.error('[quote route] error', { code: parseGuestyError(error).code, rawMessage: body.error.description })
    return NextResponse.json(body, { status })
  }
}
