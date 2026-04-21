'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { LOCALE_COOKIE, SUPPORTED_LOCALES } from '@/lib/i18n/locale'
import { type InquiryLocale } from '@/types/inquiry'

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export async function setLocaleCookie(locale: InquiryLocale): Promise<void> {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: ${locale}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: ONE_YEAR_SECONDS,
    path: '/',
    sameSite: 'lax',
  })

  revalidatePath('/', 'layout')
}
