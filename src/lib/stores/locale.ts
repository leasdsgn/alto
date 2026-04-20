import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type InquiryLocale } from '@/types/inquiry'

interface LocaleState {
  locale: InquiryLocale
  setLocale: (locale: InquiryLocale) => void
  toggle: () => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'fr',
      setLocale: (locale) => set({ locale }),
      toggle: () => set({ locale: get().locale === 'fr' ? 'en' : 'fr' }),
    }),
    { name: 'alto-locale' },
  ),
)
