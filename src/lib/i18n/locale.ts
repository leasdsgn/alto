import enMessages from '../../../messages/en.json'
import frMessages from '../../../messages/fr.json'
import { type InquiryLocale } from '@/types/inquiry'

export const LOCALE_COOKIE = 'NEXT_LOCALE'
export const SUPPORTED_LOCALES: InquiryLocale[] = ['fr', 'en']
export const DEFAULT_LOCALE: InquiryLocale = 'fr'

const messagesByLocale = {
  fr: frMessages,
  en: enMessages,
} as const

export type SiteMessages = typeof frMessages

export function isSupportedLocale(value: string | null | undefined): value is InquiryLocale {
  return value === 'fr' || value === 'en'
}

export function resolveLocale(value: string | null | undefined): InquiryLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE
}

export function getMessagesForLocale(locale: InquiryLocale): SiteMessages {
  return messagesByLocale[locale]
}
