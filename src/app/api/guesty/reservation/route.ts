import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { guestyOpenApi, type GuestyOpenApiReservation } from '@/lib/guesty-openapi'
import { toErrorResponse, parseGuestyError } from '@/lib/guesty-errors'
import { assertSameOrigin } from '@/lib/api-guard'
import { validateReservationInput } from '@/lib/reservation-validation'
import type {
  GuestyInstantChargeReservation,
  GuestyInstantReservationRequest,
} from '@/types/guesty'

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

const schema = baseSchema.extend({
  confirmationToken: z.string().min(1),
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

    const nowIso = new Date().toISOString()
    const guestyPolicy: GuestyInstantReservationRequest['policy'] = {
      privacy: {
        isAccepted: data.policy.privacy,
        dateOfAcceptance: nowIso,
      },
      termsAndConditions: {
        isAccepted: data.policy.terms,
        dateOfAcceptance: nowIso,
      },
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

    const baseReservationPayload = {
      quoteId: validated.quote._id,
      ratePlanId: validated.ratePlan.ratePlan._id,
      guest: data.guest,
      policy: guestyPolicy,
    }

    const instantCharge = await guestyClient.createInstantReservation({
      ...baseReservationPayload,
      confirmationToken: data.confirmationToken,
      reuse: true,
    })
    const reservation = await verifyPendingAuthPayment(instantCharge).catch(async (error) => {
      await cancelUnpaidReservation(instantCharge, 'Paiement non finalisé depuis le site Alto')
      throw error
    })

    if (!isPaidInstantCharge(reservation)) {
      logInstantChargeNotPaid(reservation)
      await cancelUnpaidReservation(reservation, 'Paiement refusé depuis le site Alto')
      throw new Error('{"error":{"code":"PAYMENT_FAILED"}}')
    }

    // Envoi des emails de réservation temporairement désactivé.

    return NextResponse.json(reservation)
  } catch (error) {
    const { body, status } = toErrorResponse(error, locale)
    console.error('[reservation route] error', {
      code: parseGuestyError(error).code,
      rawMessage: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(body, { status })
  }
}

async function verifyPendingAuthPayment(
  response: GuestyInstantChargeReservation,
): Promise<GuestyInstantChargeReservation> {
  if (response.payment.status?.toUpperCase() !== 'PENDING_AUTH') return response

  const reservationId = response.reservation?._id
  const paymentId = response.payment?._id

  if (!reservationId || !paymentId) return response

  if (hasThreeDSChallenge(response.threeDSChallenge)) {
    console.error('[reservation route] three ds challenge required', {
      reservationId,
      paymentId,
      challengeKeys: getChallengeKeys(response.threeDSChallenge),
    })
    throw new Error('{"error":{"code":"THREE_DS_REQUIRED"}}')
  }

  console.error('[reservation route] pending auth without challenge', {
    reservationId,
    paymentId,
  })

  return response
}

function isPaidInstantCharge(response: GuestyInstantChargeReservation): boolean {
  const paymentStatus = response.payment.status?.toUpperCase()
  const unresolvedStatuses = new Set(['FAILED', 'CANCELED', 'DECLINED', 'PENDING_AUTH'])

  return Boolean(
    response.reservation?._id &&
    response.payment?._id &&
    response.payment.amount > 0 &&
    paymentStatus &&
    !unresolvedStatuses.has(paymentStatus),
  )
}

function logInstantChargeNotPaid(response: GuestyInstantChargeReservation) {
  console.error('[reservation route] instant charge not paid', {
    reservationId: response.reservation?._id,
    reservationStatus: response.reservation?.status,
    paymentId: response.payment?._id,
    paymentStatus: response.payment?.status,
    paymentAmount: response.payment?.amount,
    paymentCurrency: response.payment?.currency,
    paymentMethodId: response.payment?.paymentMethodId,
    paymentError: response.payment?.error,
    processorError: response.payment?.processorError,
    hasThreeDSChallenge: Boolean(response.threeDSChallenge),
  })
}

async function cancelUnpaidReservation(
  response: GuestyInstantChargeReservation,
  reason: string,
): Promise<void> {
  const reservationId = response.reservation?._id
  if (!reservationId) return

  const status = response.reservation.status?.toLowerCase()
  if (status && ['canceled', 'cancelled', 'closed', 'declined'].includes(status)) return

  try {
    const currentReservation = await guestyOpenApi.getReservation(reservationId)

    if (isOpenApiReservationPaid(currentReservation)) {
      console.info('[reservation route] skip cleanup for paid reservation', {
        reservationId,
        status: currentReservation.status,
      })
      return
    }

    await guestyOpenApi.cancelReservation(reservationId, reason)
    console.info('[reservation route] canceled unpaid reservation', {
      reservationId,
      reason,
    })
  } catch (cleanupError) {
    console.error('[reservation route] cleanup reservation failed', {
      reservationId,
      cleanupError: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
    })
  }
}

function isOpenApiReservationPaid(reservation: GuestyOpenApiReservation): boolean {
  const payments = reservation.money?.payments ?? reservation.payments ?? []
  const hasPaidTotal =
    typeof reservation.money?.totalPaid === 'number' && reservation.money.totalPaid > 0

  return (
    hasPaidTotal ||
    payments.some((payment) => {
      const status = payment.status?.toUpperCase()
      return Boolean(
        payment.amount &&
        payment.amount > 0 &&
        status &&
        ['DONE', 'PAID', 'SUCCEEDED', 'SUCCESS', 'COMPLETED'].includes(status),
      )
    })
  )
}

function hasThreeDSChallenge(challenge: unknown): boolean {
  if (!challenge) return false
  if (typeof challenge === 'string') return challenge.length > 0
  if (typeof challenge !== 'object') return false
  return Object.keys(challenge).length > 0
}

function getChallengeKeys(challenge: unknown): string[] {
  if (!challenge || typeof challenge !== 'object' || Array.isArray(challenge)) return []
  return Object.keys(challenge)
}
