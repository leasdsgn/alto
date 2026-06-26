'use client'

import { useEffect, useState } from 'react'
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { useLocale } from '@/components/providers/locale-provider'
import { getStripeInstance } from '@/lib/stripe-client'
import { nightsBetween } from '@/lib/formatters'
import { t } from '@/lib/i18n/booking-dictionary'
import { clearPendingBankAuth, savePendingBankAuth } from '@/lib/pending-bank-auth'
import { QuoteSummary } from './quote-summary'
import { GuestForm, type GuestFormValues } from './guest-form'
import { PolicyCheckboxes, type PolicyValues } from './policy-checkboxes'
import { PaymentForm } from './payment-form'
import { type InquiryLocale } from '@/types/inquiry'
import type { GuestyErrorBody } from '@/lib/guesty-errors'

interface BookingFlowProps {
  listingId: string
  listingTitle: string
  checkIn: string
  checkOut: string
  guestsCount: number
  quoteId: string
  ratePlanId: string
  amountCents: number
  currency: string
}

export function BookingFlow(props: BookingFlowProps) {
  const locale = useLocale()
  const [paymentProviderState, setPaymentProviderState] = useState<{
    connectedAccountId: string | null
    ready: boolean
    error: string | null
  }>({
    connectedAccountId: null,
    ready: false,
    error: null,
  })

  const [guest, setGuest] = useState<GuestFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    let cancelled = false

    async function loadProvider() {
      try {
        const response = await fetch(`/api/guesty/payment-provider?listingId=${props.listingId}`)
        if (!response.ok) throw new Error('payment_provider_failed')

        const data = await response.json()
        if (!cancelled) {
          setPaymentProviderState({
            connectedAccountId: data.providerAccountId ?? null,
            ready: true,
            error: null,
          })
        }
      } catch (error) {
        if (!cancelled) {
          setPaymentProviderState({
            connectedAccountId: null,
            ready: false,
            error: error instanceof Error ? error.message : 'unknown',
          })
        }
      }
    }

    loadProvider()

    return () => {
      cancelled = true
    }
  }, [props.listingId])

  const stripePromise = paymentProviderState.ready
    ? getStripeInstance(paymentProviderState.connectedAccountId)
    : null
  const stripeOptions: StripeElementsOptions = {
    appearance: altoAppearance,
    mode: 'payment',
    amount: props.amountCents,
    currency: props.currency,
    paymentMethodTypes: ['card'],
    setupFutureUsage: 'off_session',
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
      <div className="space-y-8">
        <GuestForm locale={locale} values={guest} onChange={setGuest} disabled={false} />

        {stripePromise ? (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <PaymentSection
              locale={locale}
              guest={guest}
              connectedAccountId={paymentProviderState.connectedAccountId}
              {...props}
            />
          </Elements>
        ) : (
          <p className="text-taupe text-sm">{t(locale, 'loading')}...</p>
        )}

        {paymentProviderState.error ? (
          <p className="text-taupe text-sm italic">{t(locale, 'errorGenericDesc')}</p>
        ) : null}
      </div>

      <QuoteSummary
        locale={locale}
        listingTitle={props.listingTitle}
        checkIn={props.checkIn}
        checkOut={props.checkOut}
        guestsCount={props.guestsCount}
        nights={nightsBetween(props.checkIn, props.checkOut)}
        amountCents={props.amountCents}
        currency={props.currency}
      />
    </div>
  )
}

interface PaymentSectionProps extends BookingFlowProps {
  locale: InquiryLocale
  guest: GuestFormValues
  connectedAccountId: string | null
}

class ReservationError extends Error {
  constructor(
    public readonly code: string,
    public readonly title: string,
    public readonly description: string,
  ) {
    super(description)
  }
}

type ReservationApiResponse =
  | {
      phase: 'confirmed'
      reservation: unknown
      payment: unknown
    }
  | {
      phase: 'requires_action'
      reservationId: string
      paymentId: string
      clientSecret: string | null
    }
  | {
      phase: 'processing'
      reservationId: string
      paymentId: string
    }

interface FormError {
  title: string
  description: string
}

function PaymentSection(props: PaymentSectionProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [policy, setPolicy] = useState<PolicyValues>({ privacy: false, terms: false })
  const [submitting, setSubmitting] = useState(false)
  const [paymentAuthenticating, setPaymentAuthenticating] = useState(false)
  const [formError, setFormError] = useState<FormError | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!stripe || !elements) return
    setFormError(null)

    if (!isGuestValid(props.guest)) {
      toast.error(t(props.locale, 'errorValidationTitle'), {
        description: t(props.locale, 'errorValidationDesc'),
      })
      return
    }

    setSubmitting(true)

    try {
      const paymentCredential = await createPaymentCredential()
      await submitReservation(paymentCredential)
      setSuccess(true)
    } catch (err) {
      if (err instanceof ReservationError) {
        setFormError({ title: err.title, description: err.description })
        toast.error(err.title, { description: err.description })
      } else {
        const description =
          err instanceof Error ? err.message : t(props.locale, 'errorPaymentFailedDesc')
        setFormError({ title: t(props.locale, 'errorPaymentFailedTitle'), description })
        toast.error(t(props.locale, 'errorPaymentFailedTitle'), { description })
      }
    } finally {
      setPaymentAuthenticating(false)
      setSubmitting(false)
    }
  }

  async function createPaymentCredential(): Promise<string> {
    if (!stripe || !elements) throw new Error(t(props.locale, 'errorGenericDesc'))

    const submitResult = await elements.submit()
    if (submitResult.error) {
      throw new Error(submitResult.error.message ?? t(props.locale, 'errorInvalidCardDesc'))
    }

    const { error, confirmationToken } = await stripe.createConfirmationToken({
      elements,
      params: {
        payment_method_data: {
          billing_details: {
            name: `${props.guest.firstName} ${props.guest.lastName}`.trim(),
            email: props.guest.email,
            phone: props.guest.phone,
          },
        },
        return_url: buildBankAuthReturnUrl(),
      },
    })

    if (error) throw new Error(error.message ?? t(props.locale, 'errorInvalidCardDesc'))
    if (!confirmationToken?.id) throw new Error(t(props.locale, 'errorInvalidCardDesc'))

    return confirmationToken.id
  }

  async function submitReservation(paymentCredential: string): Promise<void> {
    const response = await fetch('/api/guesty/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: props.quoteId,
        ratePlanId: props.ratePlanId,
        listingId: props.listingId,
        listingTitle: props.listingTitle,
        guest: props.guest,
        policy: { privacy: true, terms: true },
        checkIn: props.checkIn,
        checkOut: props.checkOut,
        guestsCount: props.guestsCount,
        amountCents: props.amountCents,
        currency: props.currency,
        preferredLanguage: props.locale,
        confirmationToken: paymentCredential,
      }),
    })

    const body = (await response.json().catch(() => null)) as
      | GuestyErrorBody
      | ReservationApiResponse
      | null

    if (!response.ok) {
      throwReservationApiError(body)
    }

    if (isReservationApiResponse(body) && body.phase === 'confirmed') {
      redirectAfterConfirmedBooking()
      return
    }

    if (isReservationApiResponse(body) && body.phase === 'requires_action') {
      await completePendingAuth(body)
      return
    }

    throw new ReservationError(
      'UNKNOWN',
      t(props.locale, 'errorGenericTitle'),
      t(props.locale, 'errorGenericDesc'),
    )
  }

  async function completePendingAuth(
    action: Extract<ReservationApiResponse, { phase: 'requires_action' }>,
  ) {
    if (!stripe) throw new Error(t(props.locale, 'errorGenericDesc'))

    setPaymentAuthenticating(true)

    if (action.clientSecret) {
      savePendingBankAuth({
        reservationId: action.reservationId,
        paymentId: action.paymentId,
        clientSecret: action.clientSecret,
        connectedAccountId: props.connectedAccountId,
        locale: props.locale,
        returnTo: window.location.href,
      })

      const result = await stripe.handleNextAction({ clientSecret: action.clientSecret })

      if (result.error) {
        const status = await retrievePaymentIntentStatus(action.clientSecret)
        await cleanupFailedPendingAuth(action, status)
        clearPendingBankAuth()

        throw new ReservationError(
          'THREE_DS_REQUIRED',
          t(props.locale, 'errorThreeDSRequiredTitle'),
          result.error.message ?? t(props.locale, 'errorThreeDSRequiredDesc'),
        )
      }

      const stripeStatus = result.paymentIntent?.status ?? result.setupIntent?.status ?? null

      if (!isStripeContinuableStatus(stripeStatus)) {
        await cleanupFailedPendingAuth(action, stripeStatus)
        clearPendingBankAuth()
        throw new ReservationError(
          'THREE_DS_REQUIRED',
          t(props.locale, 'errorThreeDSRequiredTitle'),
          t(props.locale, 'errorThreeDSRequiredDesc'),
        )
      }

      await verifyPendingAuth(action, stripeStatus)
      clearPendingBankAuth()
      redirectAfterConfirmedBooking()
      return
    }

    await cleanupFailedPendingAuth(action, 'requires_action')
    throw new ReservationError(
      'THREE_DS_REQUIRED',
      t(props.locale, 'errorThreeDSRequiredTitle'),
      t(props.locale, 'errorThreeDSRequiredDesc'),
    )
  }

  async function verifyPendingAuth(
    action: Extract<ReservationApiResponse, { phase: 'requires_action' }>,
    stripePaymentStatus: string | null,
  ) {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch('/api/guesty/reservation/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: action.reservationId,
          paymentId: action.paymentId,
          stripePaymentStatus,
          preferredLanguage: props.locale,
        }),
      })

      const body = (await response.json().catch(() => null)) as
        | GuestyErrorBody
        | ReservationApiResponse
        | null

      if (!response.ok) {
        throwReservationApiError(body)
      }

      if (isReservationApiResponse(body) && body.phase === 'confirmed') return

      if (isReservationApiResponse(body) && body.phase === 'processing') {
        await wait(2000)
        continue
      }

      break
    }

    throw new ReservationError(
      'PAYMENT_FAILED',
      t(props.locale, 'errorPaymentFailedTitle'),
      t(props.locale, 'errorPaymentFailedDesc'),
    )
  }

  async function cleanupFailedPendingAuth(
    action: Extract<ReservationApiResponse, { phase: 'requires_action' }>,
    stripePaymentStatus: string | null,
  ) {
    const response = await fetch('/api/guesty/reservation/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: action.reservationId,
        paymentId: action.paymentId,
        stripePaymentStatus: stripePaymentStatus ?? 'requires_payment_method',
        authOutcome: 'failed',
        preferredLanguage: props.locale,
      }),
    })

    if (!response.ok) return
  }

  async function retrievePaymentIntentStatus(clientSecret: string): Promise<string | null> {
    if (!stripe) return null

    try {
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
      return paymentIntent?.status ?? null
    } catch {
      return null
    }
  }

  function throwReservationApiError(body: GuestyErrorBody | ReservationApiResponse | null): never {
    if (body && 'error' in body && body.error?.title && body.error.description) {
      throw new ReservationError(body.error.code, body.error.title, body.error.description)
    }
    throw new ReservationError(
      'UNKNOWN',
      t(props.locale, 'errorGenericTitle'),
      t(props.locale, 'errorGenericDesc'),
    )
  }

  function isReservationApiResponse(
    body: GuestyErrorBody | ReservationApiResponse | null,
  ): body is ReservationApiResponse {
    return Boolean(body && 'phase' in body)
  }

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  if (success) {
    return (
      <div className="border-divider bg-cream rounded-lg border p-6">
        <p className="text-coffee text-lg font-semibold">{t(props.locale, 'bookingSuccess')}</p>
      </div>
    )
  }

  const canSubmit =
    policy.privacy &&
    policy.terms &&
    isGuestValid(props.guest) &&
    !submitting &&
    Boolean(stripe) &&
    Boolean(elements)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentForm locale={props.locale} />

      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-950"
        >
          <p className="font-semibold">{formError.title}</p>
          <p className="mt-1 leading-relaxed">{formError.description}</p>
        </div>
      ) : null}

      <p className="border-divider bg-cream text-coffee rounded-lg border p-4 text-sm leading-relaxed">
        {t(props.locale, 'depositNotice')}
      </p>

      <PolicyCheckboxes
        locale={props.locale}
        values={policy}
        onChange={setPolicy}
        disabled={submitting}
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className="bg-coffee text-cream hover:bg-coffee/90 disabled:bg-taupe w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
      >
        {paymentAuthenticating
          ? `${t(props.locale, 'paymentAuthenticating')}...`
          : submitting
            ? `${t(props.locale, 'loading')}...`
            : t(props.locale, 'submitInstant')}
      </button>
    </form>
  )
}

function isGuestValid(guest: GuestFormValues) {
  return (
    guest.firstName.trim().length > 0 &&
    guest.lastName.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email) &&
    guest.phone.trim().length > 0
  )
}

function buildBankAuthReturnUrl() {
  const url = new URL('/book/payment-return', window.location.origin)
  return url.toString()
}

function redirectAfterConfirmedBooking() {
  window.location.replace('/')
}

function isStripeContinuableStatus(status: string | null): boolean {
  return status === 'succeeded' || status === 'processing' || status === 'requires_capture'
}

const altoAppearance = {
  theme: 'flat' as const,
  variables: {
    colorPrimary: '#2f1a09',
    colorBackground: '#fff8f0',
    colorText: '#2f1a09',
    colorDanger: '#9b2c2c',
    fontFamily: 'Manrope, system-ui, sans-serif',
    borderRadius: '8px',
  },
}
