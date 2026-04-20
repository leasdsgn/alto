'use client'

import { useEffect, useState } from 'react'
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { getStripeInstance } from '@/lib/stripe-client'
import { nightsBetween } from '@/lib/formatters'
import { t } from '@/lib/i18n/booking-dictionary'
import { useLocaleStore } from '@/lib/stores/locale'
import { QuoteSummary } from './quote-summary'
import { GuestForm, type GuestFormValues } from './guest-form'
import { PolicyCheckboxes, type PolicyValues } from './policy-checkboxes'
import { PaymentForm } from './payment-form'
import { type InquiryLocale } from '@/types/inquiry'

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
  mode: 'instant' | 'inquiry'
}

export function BookingFlow(props: BookingFlowProps) {
  const locale = useLocaleStore((s) => s.locale)
  const [setupState, setSetupState] = useState<{
    clientSecret: string | null
    customerId: string | null
    connectedAccountId: string | null
    error: string | null
  }>({ clientSecret: null, customerId: null, connectedAccountId: null, error: null })

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
        if (props.mode === 'inquiry') {
          if (!guest.email) return
          const response = await fetch('/api/stripe/setup-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId: props.listingId, email: guest.email }),
          })
          if (!response.ok) throw new Error('setup_intent_failed')
          const data = await response.json()
          if (!cancelled) {
            setSetupState({
              clientSecret: data.clientSecret,
              customerId: data.customerId,
              connectedAccountId: data.connectedAccountId,
              error: null,
            })
          }
        } else {
          const response = await fetch(
            `/api/guesty/payment-provider?listingId=${props.listingId}`,
          )
          if (!response.ok) throw new Error('payment_provider_failed')
          const data = await response.json()
          if (!cancelled) {
            setSetupState({
              clientSecret: null,
              customerId: null,
              connectedAccountId: data.providerAccountId,
              error: null,
            })
          }
        }
      } catch (error) {
        if (!cancelled) {
          setSetupState((prev) => ({
            ...prev,
            error: error instanceof Error ? error.message : 'unknown',
          }))
        }
      }
    }

    loadProvider()
    return () => {
      cancelled = true
    }
  }, [props.listingId, props.mode, guest.email])

  const stripePromise = setupState.connectedAccountId
    ? getStripeInstance(setupState.connectedAccountId)
    : null

  const elementsOptions = setupState.clientSecret
    ? { clientSecret: setupState.clientSecret, appearance: altoAppearance }
    : { mode: 'payment' as const, amount: props.amountCents, currency: props.currency, appearance: altoAppearance }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
      <div className="space-y-8">
        <GuestForm
          locale={locale}
          values={guest}
          onChange={setGuest}
          disabled={false}
        />

        {stripePromise ? (
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentSection
              locale={locale}
              guest={guest}
              {...props}
              customerId={setupState.customerId}
            />
          </Elements>
        ) : (
          <p className="text-taupe text-sm">{t(locale, 'loading')}...</p>
        )}

        {setupState.error ? (
          <p className="text-sm text-red-700">{t(locale, 'error')}</p>
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
  customerId: string | null
}

function PaymentSection(props: PaymentSectionProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [policy, setPolicy] = useState<PolicyValues>({ privacy: false, terms: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    try {
      const paymentMethodId = await createPaymentMethod(props.mode)
      await submitReservation(paymentMethodId)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown')
    } finally {
      setSubmitting(false)
    }
  }

  async function createPaymentMethod(mode: 'instant' | 'inquiry'): Promise<string> {
    if (!stripe || !elements) throw new Error('stripe_not_ready')
    await elements.submit()

    if (mode === 'inquiry') {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      })
      if (error) throw new Error(error.message ?? 'setup_failed')
      if (!setupIntent?.payment_method) throw new Error('no_payment_method')
      return String(setupIntent.payment_method)
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      elements,
    })
    if (error) throw new Error(error.message ?? 'pm_failed')
    return paymentMethod.id
  }

  async function submitReservation(paymentIdentifier: string) {
    const basePayload = {
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
    }

    const payload =
      props.mode === 'instant'
        ? { ...basePayload, mode: 'instant' as const, ccToken: paymentIdentifier }
        : {
            ...basePayload,
            mode: 'inquiry' as const,
            stripePaymentMethodId: paymentIdentifier,
            stripeCustomerId: props.customerId ?? undefined,
          }

    const response = await fetch('/api/guesty/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: 'reservation_failed' }))
      throw new Error(typeof body.error === 'string' ? body.error : 'reservation_failed')
    }
  }

  if (success) {
    return (
      <div className="border-divider bg-cream rounded-lg border p-6">
        <p className="text-coffee text-lg font-semibold">
          {props.mode === 'instant' ? t(props.locale, 'bookingSuccess') : t(props.locale, 'inquirySuccess')}
        </p>
      </div>
    )
  }

  const canSubmit = policy.privacy && policy.terms && !submitting && stripe && elements
  const submitLabel =
    props.mode === 'instant' ? t(props.locale, 'submitInstant') : t(props.locale, 'submitInquiry')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentForm locale={props.locale} />

      <PolicyCheckboxes
        locale={props.locale}
        values={policy}
        onChange={setPolicy}
        disabled={submitting}
      />

      {props.mode === 'inquiry' ? (
        <p className="text-taupe text-xs italic">{t(props.locale, 'noCharge')}</p>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="bg-coffee text-cream hover:bg-coffee/90 disabled:bg-taupe w-full rounded-lg px-6 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
      >
        {submitting ? `${t(props.locale, 'loading')}...` : submitLabel}
      </button>
    </form>
  )
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
