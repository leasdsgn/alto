import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import {
  cancelUnpaidReservation,
  extractStripeClientSecret,
  isPaidInstantCharge,
  redactStripeClientSecrets,
} from '@/lib/instant-charge-payment'
import { toErrorResponse, parseGuestyError } from '@/lib/guesty-errors'
import { assertSameOrigin } from '@/lib/api-guard'
import { validateReservationInput } from '@/lib/reservation-validation'
import { assertListingShownOnWebsite } from '@/lib/guesty-listing-visibility'
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
    assertListingShownOnWebsite(listing)

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
    })

    if (isPaidInstantCharge(instantCharge)) {
      // Envoi des emails de réservation temporairement désactivé.
      return NextResponse.json(buildConfirmedResponse(instantCharge))
    }

    if (instantCharge.payment.status?.toUpperCase() === 'PENDING_AUTH') {
      const reservationId = instantCharge.reservation?._id
      const paymentId = instantCharge.payment?._id
      const clientSecret = extractStripeClientSecret(instantCharge)

      logPendingAuthPayload(instantCharge, Boolean(clientSecret))

      if (!reservationId || !paymentId) {
        throw new Error('{"error":{"code":"THREE_DS_REQUIRED"}}')
      }

      return NextResponse.json({
        phase: 'requires_action',
        reservationId,
        paymentId,
        clientSecret,
      })
    }

    if (!isPaidInstantCharge(instantCharge)) {
      logInstantChargeNotPaid(instantCharge)
      await cancelUnpaidReservation(instantCharge, 'Others')
      throw new Error('{"error":{"code":"PAYMENT_FAILED"}}')
    }

    return NextResponse.json(buildConfirmedResponse(instantCharge))
  } catch (error) {
    const { body, status } = toErrorResponse(error, locale)
    console.error('[reservation route] error', {
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

function logPendingAuthPayload(
  response: GuestyInstantChargeReservation,
  clientSecretFound: boolean,
) {
  console.error('[reservation route] pending auth payment', {
    reservationId: response.reservation?._id,
    reservationStatus: response.reservation?.status,
    paymentId: response.payment?._id,
    paymentStatus: response.payment?.status,
    paymentAmount: response.payment?.amount,
    paymentCurrency: response.payment?.currency,
    paymentMethodId: response.payment?.paymentMethodId,
    hasThreeDSChallenge: hasThreeDSChallenge(response.threeDSChallenge),
    challengeKeys: getChallengeKeys(response.threeDSChallenge),
    clientSecretFound,
  })
  console.error(
    '[reservation route] pending auth raw',
    JSON.stringify(redactStripeClientSecrets(response)),
  )
}

function getChallengeKeys(challenge: unknown): string[] {
  if (!challenge || typeof challenge !== 'object' || Array.isArray(challenge)) return []
  return Object.keys(challenge)
}

function hasThreeDSChallenge(challenge: unknown): boolean {
  if (!challenge) return false
  if (typeof challenge === 'string') return challenge.length > 0
  if (typeof challenge !== 'object') return false
  return Object.keys(challenge).length > 0
}
