'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/components/providers/locale-provider'
import { t } from '@/lib/i18n/booking-dictionary'
import { getStripeInstance } from '@/lib/stripe-client'
import {
  clearPendingBankAuth,
  readPendingBankAuth,
  type PendingBankAuthState,
} from '@/lib/pending-bank-auth'
import type { GuestyErrorBody } from '@/lib/guesty-errors'

type ReturnState =
  | { status: 'loading' }
  | { status: 'confirmed'; returnTo: string }
  | { status: 'processing'; returnTo: string }
  | { status: 'failed'; title: string; description: string; returnTo: string }

type ReservationApiResponse =
  | {
      phase: 'confirmed'
      reservation: unknown
      payment: unknown
    }
  | {
      phase: 'processing'
      reservationId: string
      paymentId: string
    }

export function BookingAuthReturn() {
  const locale = useLocale()
  const [state, setState] = useState<ReturnState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function finalizeBankAuth() {
      const pending = readPendingBankAuth()
      const fallbackReturnTo = '/'

      if (!pending) {
        setState({
          status: 'failed',
          title: t(locale, 'errorPaymentReturnMissingTitle'),
          description: t(locale, 'errorPaymentReturnMissingDesc'),
          returnTo: fallbackReturnTo,
        })
        return
      }

      try {
        const clientSecret = getClientSecretFromUrl() ?? pending.clientSecret
        if (!clientSecret) {
          throw new ReturnError(
            t(pending.locale, 'errorPaymentReturnMissingTitle'),
            t(pending.locale, 'errorPaymentReturnMissingDesc'),
          )
        }

        const stripe = await getStripeInstance(pending.connectedAccountId)
        if (!stripe) {
          throw new ReturnError(
            t(pending.locale, 'errorGenericTitle'),
            t(pending.locale, 'errorGenericDesc'),
          )
        }

        const { error, paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
        const stripePaymentStatus = paymentIntent?.status ?? null

        if (error) {
          await finalizeGuestyReservation(pending, stripePaymentStatus, true)
          throw new ReturnError(
            t(pending.locale, 'errorThreeDSRequiredTitle'),
            error.message ?? t(pending.locale, 'errorThreeDSRequiredDesc'),
          )
        }

        if (!isStripeContinuableStatus(stripePaymentStatus)) {
          await finalizeGuestyReservation(pending, stripePaymentStatus, true)
          throw new ReturnError(
            t(pending.locale, 'errorThreeDSRequiredTitle'),
            t(pending.locale, 'errorThreeDSRequiredDesc'),
          )
        }

        const confirmed = await finalizeGuestyReservation(pending, stripePaymentStatus, false)
        if (cancelled) return

        if (confirmed) {
          clearPendingBankAuth()
          redirectAfterConfirmedBooking()
          return
        }

        setState({ status: 'processing', returnTo: pending.returnTo })
      } catch (error) {
        if (cancelled) return
        const pendingAfterError = readPendingBankAuth()
        const returnTo = pendingAfterError?.returnTo ?? fallbackReturnTo
        clearPendingBankAuth()

        setState({
          status: 'failed',
          title:
            error instanceof ReturnError ? error.title : t(locale, 'errorThreeDSRequiredTitle'),
          description:
            error instanceof Error ? error.message : t(locale, 'errorThreeDSRequiredDesc'),
          returnTo,
        })
      }
    }

    finalizeBankAuth()

    return () => {
      cancelled = true
    }
  }, [locale])

  if (state.status === 'loading') {
    return (
      <StatusPanel
        title={t(locale, 'paymentProcessingTitle')}
        description={t(locale, 'paymentProcessingDesc')}
      />
    )
  }

  if (state.status === 'confirmed') {
    return (
      <StatusPanel
        title={t(locale, 'bookingSuccess')}
        description={t(locale, 'paymentProcessingDesc')}
      />
    )
  }

  if (state.status === 'processing') {
    return (
      <StatusPanel
        title={t(locale, 'paymentProcessingTitle')}
        description={t(locale, 'paymentProcessingDesc')}
        returnTo={state.returnTo}
        ctaLabel={t(locale, 'retry')}
      />
    )
  }

  return (
    <StatusPanel
      title={state.title}
      description={state.description}
      returnTo={state.returnTo}
      ctaLabel={t(locale, 'retry')}
    />
  )
}

async function finalizeGuestyReservation(
  pending: PendingBankAuthState,
  stripePaymentStatus: string | null,
  failed: boolean,
): Promise<boolean> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch('/api/guesty/reservation/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: pending.reservationId,
        paymentId: pending.paymentId,
        stripePaymentStatus,
        authOutcome: failed ? 'failed' : undefined,
        preferredLanguage: pending.locale,
      }),
    })

    const body = (await response.json().catch(() => null)) as
      | GuestyErrorBody
      | ReservationApiResponse
      | null

    if (!response.ok) {
      if (body && 'error' in body && body.error?.title && body.error.description) {
        throw new ReturnError(body.error.title, body.error.description)
      }
      throw new ReturnError(
        t(pending.locale, 'errorGenericTitle'),
        t(pending.locale, 'errorGenericDesc'),
      )
    }

    if (body && 'phase' in body && body.phase === 'confirmed') return true

    if (body && 'phase' in body && body.phase === 'processing') {
      await wait(2000)
      continue
    }

    break
  }

  return false
}

function StatusPanel({
  title,
  description,
  returnTo,
  ctaLabel,
}: {
  title: string
  description: string
  returnTo?: string
  ctaLabel?: string
}) {
  return (
    <div className="border-divider bg-cream mx-auto max-w-xl rounded-lg border p-6">
      <p className="text-coffee text-xl font-semibold">{title}</p>
      <p className="text-taupe mt-3 text-sm leading-relaxed">{description}</p>
      {returnTo ? (
        <Link
          href={returnTo}
          className="bg-coffee text-cream hover:bg-coffee/90 mt-6 inline-flex rounded-lg px-5 py-3 text-sm font-semibold transition-colors"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  )
}

class ReturnError extends Error {
  constructor(
    public readonly title: string,
    message: string,
  ) {
    super(message)
  }
}

function getClientSecretFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('payment_intent_client_secret')
}

function isStripeContinuableStatus(status: string | null): boolean {
  return status === 'succeeded' || status === 'processing' || status === 'requires_capture'
}

function redirectAfterConfirmedBooking() {
  window.location.replace('/')
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
