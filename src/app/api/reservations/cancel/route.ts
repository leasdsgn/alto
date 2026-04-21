import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyOpenApi, type GuestyOpenApiReservation } from '@/lib/guesty-openapi'
import { findInquiryByReservation, updateInquiry } from '@/lib/inquiries-repository'
import { sendEmail } from '@/lib/resend-client'
import { translate } from '@/lib/i18n/email-dictionary'
import { calculateRefundAmountCents } from '@/lib/cancellation-policy'
import { formatCurrency } from '@/lib/formatters'
import CancellationConfirmedEmail from '@/emails/cancellation-confirmed'
import { type InquiryRow } from '@/types/inquiry'
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

    if (refundAmountCents > 0) {
      const paymentId = findRefundablePaymentId(reservation)
      if (!paymentId) {
        throw new Error('Aucun paiement Guesty remboursable trouvé pour cette réservation')
      }

      await guestyOpenApi.refundReservationPayment(
        inquiry.guesty_reservation_id,
        paymentId,
        refundAmountCents / 100,
        'Refund déclenché depuis le site Alto',
      )
    } else {
      await sendCancellationEmail(inquiry, null)
    }

    await updateInquiry(inquiry.id, {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })

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

    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
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

async function sendCancellationEmail(
  inquiry: InquiryRow,
  refundAmountCents: number | null,
) {
  await sendEmail({
    to: inquiry.guest.email,
    subject: translate(inquiry.locale, 'cancellation.subject'),
    react: CancellationConfirmedEmail({
      locale: inquiry.locale,
      guest: { firstName: inquiry.guest.firstName },
      listing: { title: inquiry.listing_title },
      refund:
        refundAmountCents && refundAmountCents > 0
          ? {
              amount: formatCurrency(refundAmountCents, inquiry.currency, inquiry.locale),
            }
          : null,
    }),
  })
}
