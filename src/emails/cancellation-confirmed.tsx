import { Heading, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface CancellationConfirmedProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: { title: string }
  refund?: { amount: string } | null
}

export default function CancellationConfirmedEmail({
  locale,
  guest,
  listing,
  refund,
}: CancellationConfirmedProps) {
  const preview = translate(locale, 'cancellation.subject')

  return (
    <EmailLayout locale={locale} preview={preview}>
      <Heading style={headingStyle}>{translate(locale, 'cancellation.heading')}</Heading>
      <Text style={paragraphStyle}>
        {translate(locale, 'cancellation.greeting', { firstName: guest.firstName })}
      </Text>
      <Text style={paragraphStyle}>
        {translate(locale, 'cancellation.body', { listingTitle: listing.title })}
      </Text>
      {refund ? (
        <Text style={paragraphStyle}>
          {translate(locale, 'cancellation.refund', { amount: refund.amount })}
        </Text>
      ) : null}
      <Text style={paragraphStyle}>{translate(locale, 'cancellation.invite')}</Text>
    </EmailLayout>
  )
}

CancellationConfirmedEmail.PreviewProps = {
  locale: 'fr',
  guest: { firstName: 'Camille' },
  listing: { title: 'Le Marais Terrasse' },
  refund: { amount: '1 120 EUR' },
} satisfies CancellationConfirmedProps

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
