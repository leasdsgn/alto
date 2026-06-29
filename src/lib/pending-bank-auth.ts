import type { InquiryLocale } from '@/types/inquiry'

export const PENDING_BANK_AUTH_STORAGE_KEY = 'alto:pending-bank-auth'

export interface PendingBankAuthBooking {
  listingTitle: string
  checkIn: string
  checkOut: string
  guestsCount: number
  amountCents: number
  currency: string
}

export interface PendingBankAuthState {
  reservationId: string
  paymentId: string
  clientSecret: string | null
  connectedAccountId: string | null
  locale: InquiryLocale
  returnTo: string
  booking?: PendingBankAuthBooking
  createdAt: number
}

const MAX_PENDING_AUTH_AGE_MS = 60 * 60 * 1000

export function savePendingBankAuth(state: Omit<PendingBankAuthState, 'createdAt'>) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    PENDING_BANK_AUTH_STORAGE_KEY,
    JSON.stringify({ ...state, createdAt: Date.now() }),
  )
}

export function readPendingBankAuth(): PendingBankAuthState | null {
  if (typeof window === 'undefined') return null

  const raw = window.sessionStorage.getItem(PENDING_BANK_AUTH_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<PendingBankAuthState>
    if (
      typeof parsed.reservationId !== 'string' ||
      typeof parsed.paymentId !== 'string' ||
      typeof parsed.locale !== 'string' ||
      typeof parsed.returnTo !== 'string' ||
      typeof parsed.createdAt !== 'number'
    ) {
      clearPendingBankAuth()
      return null
    }

    if (Date.now() - parsed.createdAt > MAX_PENDING_AUTH_AGE_MS) {
      clearPendingBankAuth()
      return null
    }

    return {
      reservationId: parsed.reservationId,
      paymentId: parsed.paymentId,
      clientSecret: typeof parsed.clientSecret === 'string' ? parsed.clientSecret : null,
      connectedAccountId:
        typeof parsed.connectedAccountId === 'string' ? parsed.connectedAccountId : null,
      locale: parsed.locale === 'en' ? 'en' : 'fr',
      returnTo: parsed.returnTo,
      booking: parsePendingBooking(parsed.booking),
      createdAt: parsed.createdAt,
    }
  } catch {
    clearPendingBankAuth()
    return null
  }
}

export function clearPendingBankAuth() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(PENDING_BANK_AUTH_STORAGE_KEY)
}

function parsePendingBooking(value: unknown): PendingBankAuthBooking | undefined {
  if (!value || typeof value !== 'object') return undefined

  const booking = value as Partial<PendingBankAuthBooking>
  if (
    typeof booking.listingTitle !== 'string' ||
    typeof booking.checkIn !== 'string' ||
    typeof booking.checkOut !== 'string' ||
    typeof booking.guestsCount !== 'number' ||
    typeof booking.amountCents !== 'number' ||
    typeof booking.currency !== 'string'
  ) {
    return undefined
  }

  return {
    listingTitle: booking.listingTitle,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guestsCount: booking.guestsCount,
    amountCents: booking.amountCents,
    currency: booking.currency,
  }
}
