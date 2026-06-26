import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { assertSameOrigin } from '@/lib/api-guard'
import { guestyClient } from '@/lib/guesty-client'
import { parseGuestyError, toErrorResponse } from '@/lib/guesty-errors'
import { cancelUnpaidReservation, isPaidInstantCharge } from '@/lib/instant-charge-payment'
import type { GuestyInstantChargeReservation } from '@/types/guesty'

const schema = z.object({
  reservationId: z.string().min(1),
  paymentId: z.string().min(1),
  preferredLanguage: z.enum(['fr', 'en']).default('fr'),
})

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
      return NextResponse.json({ ...errorBody, issues: parsed.error.issues }, { status })
    }

    const data = parsed.data
    locale = data.preferredLanguage

    const verified = await guestyClient.verifyReservationPayment({
      reservationId: data.reservationId,
      paymentId: data.paymentId,
    })

    if (isPaidInstantCharge(verified)) {
      return NextResponse.json(buildConfirmedResponse(verified))
    }

    console.error('[reservation verify route] payment not confirmed', {
      reservationId: verified.reservation?._id,
      reservationStatus: verified.reservation?.status,
      paymentId: verified.payment?._id,
      paymentStatus: verified.payment?.status,
      paymentAmount: verified.payment?.amount,
      paymentCurrency: verified.payment?.currency,
      paymentError: verified.payment?.error,
      processorError: verified.payment?.processorError,
    })

    await cancelUnpaidReservation(verified, 'Cancelled Due to Hold/Expiration')
    throw new Error('{"error":{"code":"PAYMENT_FAILED"}}')
  } catch (error) {
    const { body, status } = toErrorResponse(error, locale)
    console.error('[reservation verify route] error', {
      code: parseGuestyError(error).code,
      rawMessage: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(body, { status })
  }
}

function buildConfirmedResponse(response: GuestyInstantChargeReservation) {
  return {
    phase: 'confirmed',
    reservation: response.reservation,
    payment: response.payment,
  }
}
