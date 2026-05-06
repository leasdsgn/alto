import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyOpenApi, type GuestyOpenApiReservation } from '@/lib/guesty-openapi'
import { findInquiryByReservation, updateInquiry } from '@/lib/inquiries-repository'
import { calculateRefundAmountCents } from '@/lib/cancellation-policy'
import { verifyCancellationToken } from '@/lib/cancel-token'

const schema = z.object({
  token: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const tokenPayload = verifyCancellationToken(parsed.data.token)

    const inquiry = await findInquiryByReservation(tokenPayload.reservationId)
    if (!inquiry) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    if (inquiry.guest.email.toLowerCase() !== tokenPayload.email.toLowerCase()) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    if (!['confirmed', 'pending'].includes(inquiry.status)) {
      return NextResponse.json(
        { error: `cannot_cancel_${inquiry.status}` },
        { status: 409 },
      )
    }

    const reservation = await guestyOpenApi.getReservation(inquiry.guesty_reservation_id)
    const refundAmountCents = calculateRefundAmountCents(
      inquiry.amount_cents,
      inquiry.check_in,
    )

    await guestyOpenApi.cancelReservation(
      inquiry.guesty_reservation_id,
      'Annulation demandée par le voyageur',
    )

    await updateInquiry(inquiry.id, {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })

    if (refundAmountCents > 0) {
      const paymentId = findRefundablePaymentId(reservation)
      if (paymentId) {
        try {
          await guestyOpenApi.refundReservationPayment(
            inquiry.guesty_reservation_id,
            paymentId,
            refundAmountCents / 100,
            'Refund déclenché depuis le site Alto',
          )
        } catch (refundError) {
          console.error('[cancel] refund failed after successful cancel', refundError)
        }
      } else {
        console.error('[cancel] no refundable payment found', { reservationId: inquiry.guesty_reservation_id })
      }
    }

    // Envoi de l'email d'annulation temporairement désactivé.

    return NextResponse.json({
      ok: true,
      status: 'canceled',
      refundAmountCents,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      ['invalid_token_format', 'invalid_token_signature', 'invalid_token_payload', 'expired_token'].includes(
        error.message,
      )
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    console.error('[cancel] internal error', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

function findRefundablePaymentId(reservation: GuestyOpenApiReservation): string | null {
  const payments = reservation.money?.payments ?? reservation.payments ?? []

  for (const payment of payments) {
    if (!payment) continue

    const status = payment.status?.toUpperCase()
    if (status && ['FAILED', 'CANCELED', 'DECLINED'].includes(status)) {
      continue
    }

    if (payment._id) return payment._id
    if (payment.id) return payment.id
  }

  return null
}
