'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  useLocale,
  useSetLocale,
  useTranslations,
} from '@/components/providers/locale-provider'
import { setLocaleCookie } from '@/lib/actions/set-locale'
import { type InquiryLocale } from '@/types/inquiry'

interface LocaleToggleProps {
  className?: string
}

export function LocaleToggle({ className }: LocaleToggleProps) {
  const locale = useLocale() as InquiryLocale
  const setLocale = useSetLocale()
  const router = useRouter()
  const t = useTranslations('common')
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const next: InquiryLocale = locale === 'fr' ? 'en' : 'fr'
    startTransition(async () => {
      setLocale(next)
      await setLocaleCookie(next)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={`Switch to ${t('switchLocale')}`}
      className={
        className ??
        'text-coffee hover:text-coffee/70 text-xs font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-50'
      }
    >
      {t('switchLocale')}
    </button>
  )
}
