import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { Agentation } from 'agentation'
import { Toaster } from 'sonner'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { LocaleProvider } from '@/components/providers/locale-provider'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { LenisProvider } from '@/components/providers/lenis-provider'
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
  return (
    <html lang="fr" className={`${manrope.className} h-full antialiased`}>
      <body
        className="bg-cream text-coffee mx-auto flex min-h-full max-w-site flex-col"
        suppressHydrationWarning
      >
        <LocaleProvider>
          <LenisProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
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
  )
}
