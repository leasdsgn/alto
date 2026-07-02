import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { Toaster } from 'sonner'
import { DevelopmentAgentation } from '@/components/providers/development-agentation'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { LocaleProvider } from '@/components/providers/locale-provider'
import { StoryblokProvider } from '@/components/providers/storyblok-provider'
import { StoryblokGlobalsProvider } from '@/components/providers/storyblok-globals-provider'
import { JsonLd } from '@/components/seo/json-ld'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { LenisProvider } from '@/components/providers/lenis-provider'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from '@/lib/seo'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'Alto - Location courte durée haut de gamme',
    template: `%s | ${SITE_NAME}`,
  },
  description: 'Appartements de luxe en location courte durée à Paris et Lyon.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Alto - Location courte durée haut de gamme',
    description: 'Appartements de luxe en location courte durée à Paris et Lyon.',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE) }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alto - Location courte durée haut de gamme',
    description: 'Appartements de luxe en location courte durée à Paris et Lyon.',
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = getStaticServerLocale()
  const globals = await getStoryblokGlobals(locale)

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
          <JsonLd data={[buildOrganizationJsonLd(), buildWebsiteJsonLd()]} />
          <LocaleProvider>
            <LenisProvider>
              <I18nProvider>
                <StoryblokGlobalsProvider value={globals}>{children}</StoryblokGlobalsProvider>
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
          <DevelopmentAgentation />
        </body>
      </html>
    </StoryblokProvider>
  )
}
