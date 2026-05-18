'use client'

import { formatCurrency, formatDate } from '@/lib/formatters'
import { t } from '@/lib/i18n/booking-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

interface QuoteSummaryProps {
  locale: InquiryLocale
  listingTitle: string
  checkIn: string
  checkOut: string
  guestsCount: number
  nights: number
  amountCents: number
  currency: string
}

export function QuoteSummary({
  locale,
  listingTitle,
  checkIn,
  checkOut,
  guestsCount,
  nights,
  amountCents,
  currency,
}: QuoteSummaryProps) {
  const total = formatCurrency(amountCents, currency, locale)
  const nightsLabel = nights > 1 ? t(locale, 'nightsPlural') : t(locale, 'nights')
  const guestsLabel = guestsCount > 1 ? t(locale, 'guestsPlural') : t(locale, 'guests')

  return (
    <aside className="bg-cream border-divider self-start rounded-xl border p-6">
      <h2 className="text-coffee mb-5 text-lg font-semibold">{listingTitle}</h2>

      <dl className="space-y-3 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-taupe">{t(locale, 'checkIn')}</dt>
          <dd className="text-coffee font-medium">{formatDate(checkIn, locale)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-taupe">{t(locale, 'checkOut')}</dt>
          <dd className="text-coffee font-medium">{formatDate(checkOut, locale)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-taupe">
            {nights} {nightsLabel}
          </dt>
          <dd className="text-coffee font-medium">
            {guestsCount} {guestsLabel}
          </dd>
        </div>
      </dl>

      <hr className="border-divider my-5" />

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-coffee text-base font-semibold uppercase tracking-[0.08em]">
          {t(locale, 'total')}
        </span>
        <span className="text-coffee text-2xl font-bold tabular-nums">{total}</span>
      </div>
    </aside>
  )
}
