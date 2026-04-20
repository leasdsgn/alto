import { cookies, headers } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { type InquiryLocale } from '@/types/inquiry'

const LOCALE_COOKIE = 'NEXT_LOCALE'
const SUPPORTED_LOCALES: InquiryLocale[] = ['fr', 'en']
const DEFAULT_LOCALE: InquiryLocale = 'fr'

function pickLocaleFromAcceptLanguage(value: string | null): InquiryLocale | null {
  if (!value) return null
  const preferred = value.toLowerCase()
  if (preferred.startsWith('en')) return 'en'
  if (preferred.startsWith('fr')) return 'fr'
  return null
}

async function detectLocale(): Promise<InquiryLocale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as InquiryLocale)) {
    return cookieLocale as InquiryLocale
  }

  const headerList = await headers()
  const accept = headerList.get('accept-language')
  return pickLocaleFromAcceptLanguage(accept) ?? DEFAULT_LOCALE
}

export default getRequestConfig(async () => {
  const locale = await detectLocale()
  const messages = (await import(`../../../messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE }
