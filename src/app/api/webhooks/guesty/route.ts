import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import {
  findInquiryByReservation,
  recordWebhookEvent,
  updateInquiry,
} from '@/lib/inquiries-repository'
import { verifyGuestySignature } from '@/lib/guesty-webhook'

const payloadSchema = z
  .object({
    event: z.string(),
    payment: z
      .object({
        reservationId: z.string().optional(),
        refundedAmount: z.number().optional(),
        refundAmount: z.number().optional(),
      })
      .passthrough()
      .optional(),
    reservation: z
      .object({
        _id: z.string().optional(),
        id: z.string().optional(),
        status: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifyGuestySignature(request.headers, rawBody)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const parsed = payloadSchema.safeParse(JSON.parse(rawBody))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const eventId = request.headers.get('svix-id')
    if (!eventId) {
      return NextResponse.json({ error: 'Missing svix-id' }, { status: 400 })
    }

    const payload = parsed.data
    const reservationId = resolveReservationId(payload)

    const isNewEvent = await recordWebhookEvent({
      svixId: eventId,
      eventName: payload.event,
      reservationId,
    })

    if (!isNewEvent) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    switch (payload.event) {
      case 'payments.received':
        if (reservationId) {
          await handlePaymentReceived(reservationId)
        }
        break
      case 'payments.refunded':
        if (reservationId) {
          await handlePaymentRefunded(
            reservationId,
            payload.payment?.refundedAmount ?? payload.payment?.refundAmount ?? null,
          )
        }
        break
      case 'reservation.updated':
        if (reservationId) {
          await handleReservationUpdated(reservationId, payload.reservation?.status ?? null)
        }
        break
      default:
        return NextResponse.json({ ok: true, skipped: payload.event })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[webhooks/guesty] error', error)
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function resolveReservationId(payload: z.infer<typeof payloadSchema>): string | null {
  if (payload.payment?.reservationId) return payload.payment.reservationId
  if (payload.reservation?._id) return payload.reservation._id
  if (payload.reservation?.id) return payload.reservation.id
  return null
}

async function handlePaymentReceived(reservationId: string) {
  const inquiry = await findInquiryByReservation(reservationId)
  if (!inquiry || inquiry.status === 'confirmed' || inquiry.status === 'refunded') return

  await updateInquiry(inquiry.id, { status: 'confirmed' })
  // Envoi de l'email de confirmation temporairement désactivé.
}

async function handleReservationUpdated(reservationId: string, status: string | null) {
  if (status !== 'canceled' && status !== 'declined') return

  const inquiry = await findInquiryByReservation(reservationId)
  if (!inquiry) return

  if (inquiry.status === 'pending') {
    await updateInquiry(inquiry.id, { status: 'refused' })
    // Envoi de l'email de refus temporairement désactivé.
    return
  }

  if (inquiry.status === 'confirmed') {
    await updateInquiry(inquiry.id, {
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
  }
}

async function handlePaymentRefunded(
  reservationId: string,
  _refundedAmount: number | null,
) {
  const inquiry = await findInquiryByReservation(reservationId)
  if (!inquiry || inquiry.status === 'refunded') return

  await updateInquiry(inquiry.id, { status: 'refunded' })
  // Envoi de l'email d'annulation temporairement désactivé.
}
