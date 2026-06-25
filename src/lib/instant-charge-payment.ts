import { guestyOpenApi, type GuestyOpenApiReservation } from '@/lib/guesty-openapi'
import type { GuestyInstantChargeReservation } from '@/types/guesty'

export const GUESTY_CANCELLATION_REASONS = [
  'No Reason Provided',
  'Cancelled Due to Hold/Expiration',
  'Not Comfortable For Owner',
  'Not a Good Fit For Guest',
  'Personal Circumstances',
  'Guest Convenience',
  'Policy Compliance',
  'OTA Policy',
  'Property Issues',
  'Security & Legal Concerns',
  'Management/Ownership Changes',
  'Financial Issues',
  'External Factors',
  'Communication/Technical Issues',
  'Others',
] as const

export type GuestyCancellationReason = (typeof GUESTY_CANCELLATION_REASONS)[number]

const PAID_STATUSES = new Set(['DONE', 'PAID', 'SUCCEEDED', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED'])
const STRIPE_CLIENT_SECRET_PATTERN = /^(pi|seti)_[A-Za-z0-9]+_secret_[A-Za-z0-9]+/

export function isPaidInstantCharge(response: GuestyInstantChargeReservation): boolean {
  const paymentStatus = response.payment.status?.toUpperCase()

  return Boolean(
    response.reservation?._id &&
    response.payment?._id &&
    response.payment.amount > 0 &&
    paymentStatus &&
    PAID_STATUSES.has(paymentStatus),
  )
}

export function isOpenApiReservationPaid(reservation: GuestyOpenApiReservation): boolean {
  const payments = reservation.money?.payments ?? reservation.payments ?? []
  const hasPaidTotal =
    typeof reservation.money?.totalPaid === 'number' && reservation.money.totalPaid > 0

  return (
    hasPaidTotal ||
    payments.some((payment) => {
      const status = payment.status?.toUpperCase()
      return Boolean(payment.amount && payment.amount > 0 && status && PAID_STATUSES.has(status))
    })
  )
}

export async function cancelUnpaidReservation(
  response: GuestyInstantChargeReservation,
  reason: GuestyCancellationReason,
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

export function extractStripeClientSecret(response: GuestyInstantChargeReservation): string | null {
  const challengeSecret = extractKnownChallengeClientSecret(response.threeDSChallenge)
  if (challengeSecret) return challengeSecret

  return findStripeClientSecret(response)
}

export function redactStripeClientSecrets<T>(value: T): T {
  if (typeof value === 'string') {
    return (STRIPE_CLIENT_SECRET_PATTERN.test(value) ? '[stripe_client_secret]' : value) as T
  }

  if (!value || typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map((item) => redactStripeClientSecrets(item)) as T
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, redactStripeClientSecrets(entry)]),
  ) as T
}

function extractKnownChallengeClientSecret(challenge: unknown): string | null {
  if (!challenge || typeof challenge !== 'object' || Array.isArray(challenge)) return null

  const record = challenge as Record<string, unknown>
  const candidates = [record.clientSecret, record.client_secret, record.paymentIntentClientSecret]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && STRIPE_CLIENT_SECRET_PATTERN.test(candidate)) {
      return candidate
    }
  }

  return null
}

function findStripeClientSecret(value: unknown, seen = new WeakSet<object>()): string | null {
  if (typeof value === 'string') {
    return STRIPE_CLIENT_SECRET_PATTERN.test(value) ? value : null
  }

  if (!value || typeof value !== 'object') return null
  if (seen.has(value)) return null
  seen.add(value)

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findStripeClientSecret(item, seen)
      if (found) return found
    }
    return null
  }

  for (const entry of Object.values(value)) {
    const found = findStripeClientSecret(entry, seen)
    if (found) return found
  }

  return null
}
