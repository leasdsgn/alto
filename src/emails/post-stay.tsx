import { Heading, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface PostStayProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: { title: string }
}

export default function PostStayEmail({ locale, guest, listing }: PostStayProps) {
  const preview = translate(locale, 'postStay.subject')

  return (
    <EmailLayout locale={locale} preview={preview}>
      <Heading style={headingStyle}>{translate(locale, 'postStay.heading')}</Heading>
      <Text style={paragraphStyle}>
        {translate(locale, 'postStay.greeting', { firstName: guest.firstName })}
      </Text>
      <Text style={paragraphStyle}>
        {translate(locale, 'postStay.body', { listingTitle: listing.title })}
      </Text>
      <Text style={paragraphStyle}>{translate(locale, 'postStay.reviewCta')}</Text>
      <Text style={paragraphStyle}>{translate(locale, 'postStay.invite')}</Text>
    </EmailLayout>
  )
}

PostStayEmail.PreviewProps = {
  locale: 'fr',
  guest: { firstName: 'Camille' },
  listing: { title: 'Le Marais Terrasse' },
} satisfies PostStayProps

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
