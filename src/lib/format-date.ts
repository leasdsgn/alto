import type { DateValue } from '@internationalized/date'
import type { InquiryLocale } from '@/types/inquiry'

const MONTHS = {
  fr: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
} as const

export function formatDate(date: DateValue, locale: InquiryLocale = 'fr'): string {
  return formatDateShort(date, locale)
}

export function formatDateShort(date: DateValue, locale: InquiryLocale = 'fr'): string {
  const month = MONTHS[locale][date.month - 1]
  return locale === 'en'
    ? `${month} ${date.day}, ${date.year}`
    : `${date.day} ${month} ${date.year}`
}
