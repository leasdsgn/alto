import { Heading, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface InquiryRefusedProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: { title: string }
}

export default function InquiryRefusedEmail({
  locale,
  guest,
  listing,
}: InquiryRefusedProps) {
  const preview = translate(locale, 'inquiryRefused.subject')

  return (
    <EmailLayout locale={locale} preview={preview}>
      <Heading style={headingStyle}>{translate(locale, 'inquiryRefused.heading')}</Heading>
      <Text style={paragraphStyle}>
        {translate(locale, 'inquiryRefused.greeting', { firstName: guest.firstName })}
      </Text>
      <Text style={paragraphStyle}>
        {translate(locale, 'inquiryRefused.body', { listingTitle: listing.title })}
      </Text>
      <Text style={paragraphStyle}>{translate(locale, 'inquiryRefused.suggestion')}</Text>
    </EmailLayout>
  )
}

InquiryRefusedEmail.PreviewProps = {
  locale: 'fr',
  guest: { firstName: 'Camille' },
  listing: { title: 'Le Marais Terrasse' },
} satisfies InquiryRefusedProps

const headingStyle = {
  color: colors.primary,
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: '1.3',
  margin: '0 0 24px',
}

const paragraphStyle = {
  color: colors.primary,
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
