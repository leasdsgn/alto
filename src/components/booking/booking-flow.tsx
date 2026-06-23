'use client'

import { useEffect, useState } from 'react'
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import type { StripeElementsOptions } from '@stripe/stripe-js'
import { toast } from 'sonner'
import { useLocale } from '@/components/providers/locale-provider'
import { getStripeInstance } from '@/lib/stripe-client'
import { nightsBetween } from '@/lib/formatters'
import { t } from '@/lib/i18n/booking-dictionary'
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
            <PaymentSection locale={locale} guest={guest} {...props} />
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

function PaymentSection(props: PaymentSectionProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [policy, setPolicy] = useState<PolicyValues>({ privacy: false, terms: false })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!stripe || !elements) return

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
        toast.error(err.title, { description: err.description })
      } else {
        toast.error(t(props.locale, 'errorPaymentFailedTitle'), {
          description:
            err instanceof Error ? err.message : t(props.locale, 'errorPaymentFailedDesc'),
        })
      }
    } finally {
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
        return_url: window.location.href,
      },
    })

    if (error) throw new Error(error.message ?? t(props.locale, 'errorInvalidCardDesc'))
    if (!confirmationToken?.id) throw new Error(t(props.locale, 'errorInvalidCardDesc'))

    return confirmationToken.id
  }

  async function submitReservation(paymentCredential: string) {
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

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as GuestyErrorBody | null
      if (body?.error?.title && body.error.description) {
        throw new ReservationError(body.error.code, body.error.title, body.error.description)
      }
      throw new ReservationError(
        'UNKNOWN',
        t(props.locale, 'errorGenericTitle'),
        t(props.locale, 'errorGenericDesc'),
      )
    }
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
        {submitting ? `${t(props.locale, 'loading')}...` : t(props.locale, 'submitInstant')}
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
