'use client'

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

const confetti = [
  { left: '12%', top: '18%', rotate: -18, color: '#78ff47' },
  { left: '22%', top: '10%', rotate: 24, color: '#f3f3ed' },
  { left: '34%', top: '20%', rotate: 48, color: '#aba39e' },
  { left: '64%', top: '12%', rotate: -28, color: '#78ff47' },
  { left: '78%', top: '22%', rotate: 18, color: '#fffff8' },
  { left: '86%', top: '14%', rotate: -42, color: '#aba39e' },
] as const

export function BookingConfirmationModal({ locale, details }: BookingConfirmationModalProps) {
  const nights = nightsBetween(details.checkIn, details.checkOut)
  const nightsLabel = nights > 1 ? t(locale, 'nightsPlural') : t(locale, 'nights')
  const guestsLabel = details.guestsCount > 1 ? t(locale, 'guestsPlural') : t(locale, 'guests')
  const reference = details.confirmationCode ?? details.reservationId

  return (
    <div
      className="bg-coffee/35 fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-confirmation-title"
    >
      <div className="bg-cream border-divider relative w-full max-w-xl overflow-hidden rounded-xl border p-6 shadow-2xl md:p-8">
        <div className="bg-coffee pointer-events-none absolute inset-x-0 top-0 h-24 overflow-hidden">
          {confetti.map((piece, index) => (
            <span
              key={`${piece.left}-${piece.top}-${index}`}
              className="absolute h-3 w-1.5 rounded-full opacity-90"
              style={{
                left: piece.left,
                top: piece.top,
                transform: `rotate(${piece.rotate}deg)`,
                backgroundColor: piece.color,
              }}
            />
          ))}
        </div>

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
