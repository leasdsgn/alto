'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, nightsBetween } from '@/lib/formatters'
import { t } from '@/lib/i18n/booking-dictionary'
import type { InquiryLocale } from '@/types/inquiry'

export interface BookingConfirmationDetails {
  listingTitle: string
  checkIn: string
  checkOut: string
  guestsCount: number
  amountCents: number
  currency: string
  reservationId?: string
  confirmationCode?: string
}

interface BookingConfirmationModalProps {
  locale: InquiryLocale
  details: BookingConfirmationDetails
}

export function BookingConfirmationModal({ locale, details }: BookingConfirmationModalProps) {
  const nights = nightsBetween(details.checkIn, details.checkOut)
  const nightsLabel = nights > 1 ? t(locale, 'nightsPlural') : t(locale, 'nights')
  const guestsLabel = details.guestsCount > 1 ? t(locale, 'guestsPlural') : t(locale, 'guests')
  const reference = details.confirmationCode ?? details.reservationId

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    const timeouts: number[] = []

    void import('canvas-confetti').then(({ default: confetti }) => {
      if (cancelled) return

      const colors = ['#78ff47', '#fffff8', '#f3f3ed', '#aba39e', '#301a0a']

      confetti({
        particleCount: 72,
        spread: 70,
        startVelocity: 36,
        scalar: 0.85,
        origin: { y: 0.18 },
        colors,
        disableForReducedMotion: true,
      })

      timeouts.push(
        window.setTimeout(() => {
          confetti({
            particleCount: 34,
            angle: 60,
            spread: 55,
            startVelocity: 34,
            scalar: 0.75,
            origin: { x: 0, y: 0.24 },
            colors,
            disableForReducedMotion: true,
          })
        }, 120),
      )

      timeouts.push(
        window.setTimeout(() => {
          confetti({
            particleCount: 34,
            angle: 120,
            spread: 55,
            startVelocity: 34,
            scalar: 0.75,
            origin: { x: 1, y: 0.24 },
            colors,
            disableForReducedMotion: true,
          })
        }, 180),
      )
    })

    return () => {
      cancelled = true
      for (const timeout of timeouts) window.clearTimeout(timeout)
    }
  }, [])

  return (
    <div
      className="bg-coffee/35 fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-confirmation-title"
    >
      <div className="bg-cream border-divider relative w-full max-w-xl overflow-hidden rounded-xl border p-6 shadow-2xl md:p-8">
        <div className="bg-coffee pointer-events-none absolute inset-x-0 top-0 h-24" />

        <div className="relative pt-16">
          <div className="bg-signal text-coffee mb-5 flex h-12 w-12 items-center justify-center rounded-full">
            <CheckIcon />
          </div>

          <p className="text-taupe text-caption mb-2 uppercase">{t(locale, 'stayDetails')}</p>
          <h2 id="booking-confirmation-title" className="text-coffee text-2xl font-semibold">
            {t(locale, 'bookingSuccess')}
          </h2>
          <p className="text-taupe mt-3 text-sm leading-relaxed">
            {t(locale, 'bookingConfirmedDesc')}
          </p>

          <dl className="border-divider mt-6 space-y-3 rounded-lg border p-4 text-sm">
            <ConfirmationRow label={t(locale, 'apartment')} value={details.listingTitle} />
            <ConfirmationRow
              label={t(locale, 'checkIn')}
              value={formatDate(details.checkIn, locale)}
            />
            <ConfirmationRow
              label={t(locale, 'checkOut')}
              value={formatDate(details.checkOut, locale)}
            />
            <ConfirmationRow
              label={`${nights} ${nightsLabel}`}
              value={`${details.guestsCount} ${guestsLabel}`}
            />
            <ConfirmationRow
              label={t(locale, 'total')}
              value={formatCurrency(details.amountCents, details.currency, locale)}
            />
            {reference ? (
              <ConfirmationRow label={t(locale, 'reservationReference')} value={reference} />
            ) : null}
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="bg-coffee text-cream hover:bg-coffee/90 inline-flex min-h-12 flex-1 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors"
            >
              {t(locale, 'bookingHomeCta')}
            </Link>
            <Link
              href="/appartements"
              className="border-coffee text-coffee hover:bg-sand inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border px-5 text-sm font-semibold transition-colors"
            >
              {t(locale, 'bookingApartmentsCta')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfirmationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-taupe">{label}</dt>
      <dd className="text-coffee text-right font-medium">{value}</dd>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="m6 12.5 4 4L18.5 8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
