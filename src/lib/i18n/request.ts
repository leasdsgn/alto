import { getRequestConfig } from 'next-intl/server'
import { getServerLocale } from '@/lib/i18n/server'
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES } from '@/lib/i18n/locale'

export default getRequestConfig(async () => {
  const locale = await getServerLocale()
  const messages = (await import(`../../../messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})

export { SUPPORTED_LOCALES, DEFAULT_LOCALE, LOCALE_COOKIE }
