'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LOCALE,
  getMessagesForLocale,
  LOCALE_COOKIE,
  resolveLocale,
  type SiteMessages,
} from '@/lib/i18n/locale'
import { type InquiryLocale } from '@/types/inquiry'

interface LocaleContextValue {
  locale: InquiryLocale
  setLocale: (locale: InquiryLocale) => void
  messages: SiteMessages
}

const LocaleContext = createContext<LocaleContextValue | null>(null)
const LOCALE_EVENT = 'alto:locale-change'

function readLocaleCookie(fallbackLocale: InquiryLocale): InquiryLocale {
  if (typeof document === 'undefined') return fallbackLocale

  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`))
  return match ? resolveLocale(match[1]) : fallbackLocale
}

function writeLocaleCookie(locale: InquiryLocale): void {
  if (typeof document === 'undefined') return
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`
}

function subscribeToLocaleChange(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  window.addEventListener(LOCALE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener(LOCALE_EVENT, onStoreChange)
  }
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode
  initialLocale?: InquiryLocale
}) {
  const locale = useSyncExternalStore(
    subscribeToLocaleChange,
    () => readLocaleCookie(initialLocale),
    () => initialLocale,
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale(nextLocale) {
        writeLocaleCookie(nextLocale)
        window.dispatchEvent(new Event(LOCALE_EVENT))
      },
      messages: getMessagesForLocale(locale),
    }),
    [locale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): InquiryLocale {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }

  return context.locale
}

export function useSetLocale(): (locale: InquiryLocale) => void {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useSetLocale must be used within LocaleProvider')
  }

  return context.setLocale
}

export function useTranslations<Namespace extends keyof SiteMessages>(namespace: Namespace) {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useTranslations must be used within LocaleProvider')
  }

  return function translate<Key extends keyof SiteMessages[Namespace]>(key: Key): string {
    const entry = context.messages[namespace][key]
    return typeof entry === 'string' ? entry : ''
  }
}
