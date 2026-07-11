'use client'

import { useEffect, useState } from 'react'
import { ApartmentBooking } from '@/components/apartment/booking'
import { useLocale } from '@/components/providers/locale-provider'
import { useSearchStore } from '@/lib/stores/search'
import { formatDateShort } from '@/lib/format-date'

interface MobileBookingBarProps {
  price: number | null
  slug: string
  listingId?: string
  capacity?: number
  minNights?: number
  maxNights?: number
  initialShouldVerifyQuote?: boolean
}

export function MobileBookingBar(props: MobileBookingBarProps) {
  const locale = useLocale()
  const { dates, guests } = useSearchStore()
  const [isOpen, setIsOpen] = useState(false)
  const copy = MOBILE_BOOKING_COPY[locale]
  const dateLabel = `${formatDateShort(dates.start, locale)} - ${formatDateShort(dates.end, locale)}`

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  return (
    <>
      <div className="bg-cream/95 border-divider fixed inset-x-0 bottom-0 z-40 border-t p-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 text-left"
          onClick={() => setIsOpen(true)}
        >
          <span className="min-w-0">
            <span className="text-coffee block text-sm font-semibold">{dateLabel}</span>
            <span className="text-taupe mt-0.5 block text-xs">
              {guests} {guests > 1 ? copy.guests : copy.guest}
            </span>
          </span>

          <span className="bg-coffee text-cream shrink-0 rounded-full px-5 py-3 text-sm font-semibold">
            {copy.cta}
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={copy.dialogLabel}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label={copy.close}
            onClick={() => setIsOpen(false)}
          />

          <div className="bg-cream absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl px-4 pt-4 pb-6 shadow-[0_-16px_48px_rgba(48,26,10,0.18)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-coffee text-sm font-semibold">{copy.title}</p>
              <button
                type="button"
                className="border-divider text-coffee flex size-9 items-center justify-center rounded-full border"
                aria-label={copy.close}
                onClick={() => setIsOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mx-auto max-w-[498px]">
              <ApartmentBooking {...props} initialShouldVerifyQuote variant="mobileSheet" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

const MOBILE_BOOKING_COPY = {
  fr: {
    cta: 'Dates et tarif',
    title: 'Choisir les dates',
    guest: 'voyageur',
    guests: 'voyageurs',
    close: 'Fermer',
    dialogLabel: 'Réservation',
  },
  en: {
    cta: 'Dates and price',
    title: 'Choose dates',
    guest: 'guest',
    guests: 'guests',
    close: 'Close',
    dialogLabel: 'Booking',
  },
} as const

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}
