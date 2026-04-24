'use client'

import { I18nProvider as ReactAriaI18nProvider } from 'react-aria-components'
import type { ReactNode } from 'react'
import { useLocale } from '@/components/providers/locale-provider'

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useLocale()

  return (
    <ReactAriaI18nProvider locale={locale === 'en' ? 'en-US' : 'fr-FR'}>
      {children}
    </ReactAriaI18nProvider>
  )
}
