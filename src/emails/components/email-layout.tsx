import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
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

export function EmailLayout({ locale, preview, children }: EmailLayoutProps) {
  return (
    <Html lang={locale}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={brandStyle}>{translate(locale, 'common.brand')}</Text>
          </Section>

          <Section style={contentStyle}>{children}</Section>

          <Hr style={hrStyle} />

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>{translate(locale, 'common.contact')}</Text>
            <Text style={footerTextStyle}>{translate(locale, 'common.signature')}</Text>
            <Text style={footerMutedStyle}>{translate(locale, 'common.footer')}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export { colors, fonts }

const bodyStyle = {
  backgroundColor: colors.cream,
  fontFamily: fonts.sans,
  margin: 0,
  padding: '40px 16px',
}

const containerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 32px',
}

const headerStyle = {
  textAlign: 'center' as const,
  paddingBottom: '24px',
}

const brandStyle = {
  color: colors.primary,
  fontSize: '24px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase' as const,
}

const contentStyle = {
  paddingTop: '8px',
  paddingBottom: '8px',
}

const hrStyle = {
  borderColor: colors.border,
  borderWidth: '1px',
  borderStyle: 'solid',
  margin: '32px 0 16px',
}

const footerStyle = {
  paddingTop: '8px',
}

const footerTextStyle = {
  color: colors.secondary,
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '4px 0',
}

const footerMutedStyle = {
  color: colors.muted,
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '12px 0 0',
}
