import { cookies, headers } from 'next/headers'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
  resolveLocale,
} from '@/lib/i18n/locale'
import { type InquiryLocale } from '@/types/inquiry'

function pickLocaleFromAcceptLanguage(value: string | null): InquiryLocale | null {
  if (!value) return null

  const candidates = value
    .split(',')
    .map((entry) => entry.trim().split(';')[0]?.toLowerCase())
    .filter(Boolean)

  for (const candidate of candidates) {
    const locale = candidate?.split('-')[0]
    if (SUPPORTED_LOCALES.includes(locale as InquiryLocale)) {
      return locale as InquiryLocale
    }
  }

  return null
}

export async function getServerLocale(): Promise<InquiryLocale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value

  if (cookieLocale) {
    return resolveLocale(cookieLocale)
  }

  const headerList = await headers()
  return pickLocaleFromAcceptLanguage(headerList.get('accept-language')) ?? DEFAULT_LOCALE
}
