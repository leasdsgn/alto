import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { Agentation } from 'agentation'
import { Toaster } from 'sonner'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { LocaleProvider } from '@/components/providers/locale-provider'
import { StoryblokProvider } from '@/components/providers/storyblok-provider'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { LenisProvider } from '@/components/providers/lenis-provider'
import { getServerLocale } from '@/lib/i18n/server'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Alto - Location courte durée haut de gamme',
  description: 'Appartements de luxe en location courte durée à Paris et Lyon.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getServerLocale()

  return (
    <StoryblokProvider>
      <html lang={locale} className={`${manrope.className} h-full antialiased`}>
        <head>
          <link rel="icon" href="/favicon.ico?v=alto-arch-3" sizes="any" />
          <link rel="shortcut icon" href="/favicon.ico?v=alto-arch-3" />
          <link rel="apple-touch-icon" href="/apple-icon.png?v=alto-arch-3" />
        </head>
        <body
          className="text-coffee flex min-h-full flex-col"
          style={{ background: 'var(--Floral-white, #FFFFF8)' }}
          suppressHydrationWarning
        >
          <LocaleProvider>
            <LenisProvider>
              <I18nProvider>{children}</I18nProvider>
            </LenisProvider>
          </LocaleProvider>
          <CustomCursor />
          <Toaster
            position="top-center"
            theme="light"
            toastOptions={{
              classNames: {
                toast: 'bg-cream border border-divider text-coffee',
                title: 'text-coffee font-semibold',
                description: 'text-taupe',
              },
            }}
          />
          {process.env.NODE_ENV === 'development' && <Agentation />}
        </body>
      </html>
    </StoryblokProvider>
  )
}
