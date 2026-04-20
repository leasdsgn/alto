import { Heading, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { DetailsCard } from './components/details-card'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface InquiryConfirmedProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: { title: string }
  reservation: {
    checkIn: string
    checkOut: string
    guests: number
    total: string
  }
}

export default function InquiryConfirmedEmail({
  locale,
  guest,
  listing,
  reservation,
}: InquiryConfirmedProps) {
  const preview = translate(locale, 'inquiryConfirmed.subject')

  return (
    <EmailLayout locale={locale} preview={preview}>
      <Heading style={headingStyle}>{translate(locale, 'inquiryConfirmed.heading')}</Heading>
      <Text style={paragraphStyle}>
        {translate(locale, 'inquiryConfirmed.greeting', { firstName: guest.firstName })}
      </Text>
      <Text style={paragraphStyle}>
        {translate(locale, 'inquiryConfirmed.body', {
          listingTitle: listing.title,
          amount: reservation.total,
        })}
      </Text>

      <DetailsCard
        title={translate(locale, 'inquiryConfirmed.detailsTitle')}
        items={[
          { label: translate(locale, 'inquiryConfirmed.checkIn'), value: reservation.checkIn },
          { label: translate(locale, 'inquiryConfirmed.checkOut'), value: reservation.checkOut },
          {
            label: translate(locale, 'inquiryConfirmed.guests'),
            value: String(reservation.guests),
          },
          { label: translate(locale, 'inquiryConfirmed.total'), value: reservation.total },
        ]}
      />

      <Text style={paragraphStyle}>{translate(locale, 'inquiryConfirmed.nextSteps')}</Text>
    </EmailLayout>
  )
}

InquiryConfirmedEmail.PreviewProps = {
  locale: 'fr',
  guest: { firstName: 'Camille' },
  listing: { title: 'Le Marais Terrasse' },
  reservation: {
    checkIn: '28 avril 2026',
    checkOut: '2 mai 2026',
    guests: 2,
    total: '1 120 EUR',
  },
} satisfies InquiryConfirmedProps

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
