import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { toErrorResponse, parseGuestyError } from '@/lib/guesty-errors'
import { assertSameOrigin } from '@/lib/api-guard'
import { validateReservationInput } from '@/lib/reservation-validation'
import type { GuestyReservationRequest } from '@/types/guesty'

const guestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
})

const policySchema = z.object({
  privacy: z.literal(true),
  terms: z.literal(true),
})

const baseSchema = z.object({
  quoteId: z.string().min(1).optional(),
  ratePlanId: z.string().min(1).optional(),
  listingId: z.string().min(1),
  listingTitle: z.string().min(1).optional(),
  guest: guestSchema,
  policy: policySchema,
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  guestsCount: z.number().int().positive(),
  amountCents: z.number().int().positive().optional(),
  currency: z.string().min(1).optional(),
  preferredLanguage: z.enum(['fr', 'en']).default('fr'),
})

const instantSchema = baseSchema.extend({
  mode: z.literal('instant'),
  ccToken: z.string().min(1),
})

const inquirySchema = baseSchema.extend({
  mode: z.literal('inquiry'),
  ccToken: z.string().min(1),
})

const schema = z.discriminatedUnion('mode', [instantSchema, inquirySchema])

export async function POST(request: NextRequest) {
  const guard = assertSameOrigin(request)
  if (guard) return guard

  let locale: 'fr' | 'en' = 'fr'

  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      locale = (body as { preferredLanguage?: 'fr' | 'en' })?.preferredLanguage ?? 'fr'
      const { body: errorBody, status } = toErrorResponse(
        new Error('{"error":{"code":"VALIDATION_FAILED"}}'),
        locale,
      )
      return NextResponse.json(
        { ...errorBody, issues: parsed.error.issues },
        { status },
      )
    }

    const data = parsed.data
    locale = data.preferredLanguage

    const nowIso = new Date().toISOString()
    const guestyPolicy: GuestyReservationRequest['policy'] = {
      privacy: { accepted: data.policy.privacy, acceptedAt: nowIso },
      terms: { accepted: data.policy.terms, acceptedAt: nowIso },
    }

    if (data.mode === 'instant') {
      return NextResponse.json({ error: { code: 'INSTANT_BOOKING_DISABLED' } }, { status: 501 })
    }

    const [listing, quote] = await Promise.all([
      guestyClient.getListing(data.listingId),
      guestyClient.createQuote(data.listingId, data.checkIn, data.checkOut, data.guestsCount),
    ])

    const validated = validateReservationInput({
      listing,
      quote,
      requestedRatePlanId: data.ratePlanId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guestsCount: data.guestsCount,
    })

    const inquiry = await guestyClient.createInquiry({
      quoteId: validated.quote._id,
      ratePlanId: validated.ratePlan.ratePlan._id,
      guest: data.guest,
      policy: guestyPolicy,
      ccToken: data.ccToken,
    })

    // Envoi de l'email "inquiry received" temporairement désactivé.

    return NextResponse.json(inquiry)
  } catch (error) {
    const { body, status } = toErrorResponse(error, locale)
    console.error('[reservation route] error', {
      code: parseGuestyError(error).code,
      rawMessage: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(body, { status })
  }
}
