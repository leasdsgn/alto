'use client'

import { I18nProvider as ReactAriaI18nProvider } from 'react-aria-components'
import type { ReactNode } from 'react'

export function I18nProvider({ children }: { children: ReactNode }) {
  return <ReactAriaI18nProvider locale="fr-FR">{children}</ReactAriaI18nProvider>
}
