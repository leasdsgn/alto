import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'

const guestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
})

const schema = z.object({
  quoteId: z.string().min(1),
  ratePlanId: z.string().min(1),
  guest: guestSchema,
  ccToken: z.string().optional(),
  policy: z.object({
    privacy: z.literal(true),
    terms: z.literal(true),
  }),
  mode: z.enum(['instant', 'inquiry']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { mode, ccToken, ...rest } = parsed.data

    if (mode === 'instant') {
      if (!ccToken) {
        return NextResponse.json(
          { error: 'ccToken requis pour une reservation instantanee' },
          { status: 400 },
        )
      }
      const data = await guestyClient.createInstantReservation({ ...rest, ccToken })
      return NextResponse.json(data)
    }

    const data = await guestyClient.createInquiry(rest)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
