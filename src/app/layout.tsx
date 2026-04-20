import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Agentation } from 'agentation'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { LenisProvider } from '@/components/providers/lenis-provider'
import { StoryblokProvider } from '@/components/providers/storyblok-provider'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Alto - Location courte duree haut de gamme',
  description: 'Appartements de luxe en location courte durée à Paris et Lyon.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${manrope.className} h-full antialiased`}>
      <body
        className="bg-cream text-coffee mx-auto flex min-h-full max-w-site flex-col"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LenisProvider>
            <I18nProvider>
              <StoryblokProvider>{children}</StoryblokProvider>
            </I18nProvider>
          </LenisProvider>
        </NextIntlClientProvider>
        <CustomCursor />
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
