import { type InquiryLocale } from '@/types/inquiry'

const intlLocale: Record<InquiryLocale, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
}

export function formatDate(isoDate: string, locale: InquiryLocale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate))
}

export function formatCurrency(
  amountCents: number,
  currency: string,
  locale: InquiryLocale,
): string {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amountCents / 100)
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}
