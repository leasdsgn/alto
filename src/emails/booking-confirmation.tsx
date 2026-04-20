import { Heading, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { DetailsCard } from './components/details-card'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface BookingConfirmationProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: { title: string }
  reservation: {
    checkIn: string
    checkOut: string
    guests: number
    nights: number
    total: string
  }
}

export default function BookingConfirmationEmail({
  locale,
  guest,
  listing,
  reservation,
}: BookingConfirmationProps) {
  const preview = translate(locale, 'confirmation.subject')
  const nightsPlural = reservation.nights > 1 ? 's' : ''

  return (
    <EmailLayout locale={locale} preview={preview}>
      <Heading style={headingStyle}>{translate(locale, 'confirmation.heading')}</Heading>
      <Text style={paragraphStyle}>
        {translate(locale, 'confirmation.greeting', { firstName: guest.firstName })}
      </Text>
      <Text style={paragraphStyle}>
        {translate(locale, 'confirmation.body', {
          nights: reservation.nights,
          nightsPlural,
          listingTitle: listing.title,
        })}
      </Text>

      <DetailsCard
        title={translate(locale, 'confirmation.detailsTitle')}
        items={[
          { label: translate(locale, 'confirmation.checkIn'), value: reservation.checkIn },
          { label: translate(locale, 'confirmation.checkOut'), value: reservation.checkOut },
          { label: translate(locale, 'confirmation.guests'), value: String(reservation.guests) },
          { label: translate(locale, 'confirmation.total'), value: reservation.total },
        ]}
      />

      <Text style={paragraphStyle}>{translate(locale, 'confirmation.nextSteps')}</Text>
    </EmailLayout>
  )
}

BookingConfirmationEmail.PreviewProps = {
  locale: 'fr',
  guest: { firstName: 'Camille' },
  listing: { title: 'Le Marais Terrasse' },
  reservation: {
    checkIn: '28 avril 2026',
    checkOut: '2 mai 2026',
    guests: 2,
    nights: 4,
    total: '1 120 EUR',
  },
} satisfies BookingConfirmationProps

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
