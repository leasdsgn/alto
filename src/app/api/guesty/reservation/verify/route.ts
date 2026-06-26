import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { assertSameOrigin } from '@/lib/api-guard'
import { parseGuestyError, toErrorResponse } from '@/lib/guesty-errors'
import { guestyOpenApi, type GuestyOpenApiReservation } from '@/lib/guesty-openapi'
import { isOpenApiReservationPaid } from '@/lib/instant-charge-payment'

const schema = z.object({
  reservationId: z.string().min(1),
  paymentId: z.string().min(1),
  preferredLanguage: z.enum(['fr', 'en']).default('fr'),
})

const PAYMENT_SYNC_ATTEMPTS = 8
const PAYMENT_SYNC_INTERVAL_MS = 1500

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

    const reservation = await waitForOpenApiReservationPayment(data.reservationId)

    if (isOpenApiReservationPaid(reservation)) {
      return NextResponse.json(buildConfirmedResponse(reservation, data.paymentId))
    }

    console.info('[reservation verify route] payment not paid after open api sync', {
      reservationId: reservation._id ?? reservation.id ?? data.reservationId,
      reservationStatus: reservation.status,
      paymentId: data.paymentId,
      totalPaid: reservation.money?.totalPaid,
      balanceDue: reservation.money?.balanceDue,
    })

    if (!isActiveReservation(reservation)) {
      throw new Error('{"error":{"code":"PAYMENT_FAILED"}}')
    }

    return NextResponse.json(
      {
        phase: 'processing',
        reservationId: data.reservationId,
        paymentId: data.paymentId,
      },
      { status: 202 },
    )
  } catch (error) {
    const { body, status } = toErrorResponse(error, locale)
    console.error('[reservation verify route] error', {
      code: parseGuestyError(error).code,
      rawMessage: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(body, { status })
  }
}

async function waitForOpenApiReservationPayment(
  reservationId: string,
): Promise<GuestyOpenApiReservation> {
  let reservation = await guestyOpenApi.getReservation(reservationId)

  for (let attempt = 1; attempt < PAYMENT_SYNC_ATTEMPTS; attempt++) {
    if (isOpenApiReservationPaid(reservation) || !isActiveReservation(reservation)) {
      return reservation
    }

    await wait(PAYMENT_SYNC_INTERVAL_MS)
    reservation = await guestyOpenApi.getReservation(reservationId)
  }

  return reservation
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isActiveReservation(reservation: GuestyOpenApiReservation): boolean {
  const status = reservation.status?.toLowerCase()
  if (!status) return true
  return !['canceled', 'cancelled', 'closed', 'declined'].includes(status)
}

function buildConfirmedResponse(reservation: GuestyOpenApiReservation, paymentId: string) {
  const payment = findPayment(reservation, paymentId)

  return {
    phase: 'confirmed',
    reservation,
    payment: payment ?? {
      _id: paymentId,
      status: 'paid',
      amount: reservation.money?.totalPaid ?? 0,
      currency: reservation.money?.currency,
    },
  }
}

function findPayment(reservation: GuestyOpenApiReservation, paymentId: string) {
  const payments = reservation.money?.payments ?? reservation.payments ?? []
  return payments.find((payment) => payment._id === paymentId || payment.id === paymentId)
}
