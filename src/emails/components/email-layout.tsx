import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Img,
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alto-virid.vercel.app'
const LOGO_URL = `${SITE_URL}/images/logo-alto-light.png`

export function EmailLayout({ locale, preview, children }: EmailLayoutProps) {
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
        <Body className="bg-coffee font-sans m-0 px-4 py-12">
          <Container className="mx-auto max-w-[600px]">
            <Section className="text-center pb-10">
              <Img
                src={LOGO_URL}
                alt="Alto"
                width="100"
                height="26"
                className="block mx-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Section>

            <Container className="bg-cream px-8 py-10">{children}</Container>

            <Section className="pt-10 text-center">
              <Text className="text-cream/80 text-[13px] leading-relaxed m-0 my-1">
                {translate(locale, 'common.contact')}
              </Text>
              <Text className="text-cream text-[13px] font-semibold tracking-wide m-0 my-1">
                {translate(locale, 'common.signature')}
              </Text>
              <Text className="text-cream/50 text-[11px] leading-normal mt-4 tracking-wide">
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
