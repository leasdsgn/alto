import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import { type ReactNode } from 'react'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

interface EmailLayoutProps {
  locale: InquiryLocale
  preview: string
  children: ReactNode
  heroImage?: string
  heroAlt?: string
  cta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

const colors = {
  cream: '#fff8f0',
  primary: '#2f1a09',
  secondary: '#59463c',
  muted: '#aca29d',
  border: '#e8dfd3',
}

const fonts = {
  sans: "'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif",
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alto-collection.com'
const LOGO_URL = `${SITE_URL}/images/logo-alto-light.png`

export function EmailLayout({
  locale,
  preview,
  children,
  heroImage,
  heroAlt,
  cta,
  secondaryCta,
}: EmailLayoutProps) {
  return (
    <Html lang={locale}>
      <Head>
        <Font
          fontFamily="Manrope"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.gstatic.com/s/manrope/v15/xn7_YHE41ni1AdIRggexSg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Manrope"
          fallbackFontFamily={['Helvetica', 'Arial', 'sans-serif']}
          webFont={{
            url: 'https://fonts.gstatic.com/s/manrope/v15/xn7gYHE41ni1AdIRggOxSg.woff2',
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                cream: '#fff8f0',
                coffee: '#2f1a09',
                taupe: '#59463c',
                silver: '#aca29d',
                divider: '#e8dfd3',
              },
              fontFamily: {
                sans: ['Manrope', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
              },
            },
          },
        }}
      >
        <Body
          className="bg-coffee m-0 px-4 py-12 font-sans"
          style={{
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
          }}
        >
          <Container className="mx-auto max-w-[600px]">
            <Section className="pb-10 text-center">
              <Img
                src={LOGO_URL}
                alt="Alto"
                width="100"
                height="26"
                className="mx-auto block"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Section>

            {heroImage ? (
              <Section className="m-0 p-0">
                <Img
                  src={heroImage}
                  alt={heroAlt ?? ''}
                  width="600"
                  height="340"
                  className="block w-full"
                  style={{ display: 'block', objectFit: 'cover' }}
                />
              </Section>
            ) : null}

            <Container className="bg-cream px-8 py-10">
              {children}

              {cta ? (
                <Section className="pt-8 text-center">
                  <Button
                    href={cta.href}
                    className="bg-coffee text-cream inline-block px-8 py-4 text-[13px] font-semibold tracking-[0.12em] uppercase no-underline"
                  >
                    {cta.label}
                  </Button>
                </Section>
              ) : null}

              {secondaryCta ? (
                <Section className="pt-4 text-center">
                  <Link
                    href={secondaryCta.href}
                    style={{
                      color: colors.secondary,
                      fontSize: '13px',
                      textDecoration: 'underline',
                    }}
                  >
                    {secondaryCta.label}
                  </Link>
                </Section>
              ) : null}
            </Container>

            <Section className="pt-10 text-center">
              <Text className="text-cream/80 m-0 my-1 text-[13px] leading-relaxed">
                {translate(locale, 'common.contact')}
              </Text>
              <Text className="text-cream m-0 my-1 text-[13px] font-semibold tracking-wide">
                {translate(locale, 'common.signature')}
              </Text>
              <Text className="text-cream/50 mt-4 text-[11px] leading-normal tracking-wide">
                {translate(locale, 'common.footer')}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export { colors, fonts }
