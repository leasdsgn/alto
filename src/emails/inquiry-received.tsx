import { Heading, Section, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { DetailsCard } from './components/details-card'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface InquiryReceivedProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: { title: string }
  reservation: {
    checkIn: string
    checkOut: string
    guests: number
    estimatedTotal: string
  }
}

export default function InquiryReceivedEmail({
  locale,
  guest,
  listing,
  reservation,
}: InquiryReceivedProps) {
  const preview = translate(locale, 'inquiryReceived.subject')

  return (
    <EmailLayout locale={locale} preview={preview}>
      <Heading style={headingStyle}>{translate(locale, 'inquiryReceived.heading')}</Heading>
      <Text style={paragraphStyle}>
        {translate(locale, 'inquiryReceived.greeting', { firstName: guest.firstName })}
      </Text>
      <Text style={paragraphStyle}>
        {translate(locale, 'inquiryReceived.body', { listingTitle: listing.title })}
      </Text>

      <DetailsCard
        title={translate(locale, 'inquiryReceived.detailsTitle')}
        items={[
          { label: translate(locale, 'inquiryReceived.checkIn'), value: reservation.checkIn },
          { label: translate(locale, 'inquiryReceived.checkOut'), value: reservation.checkOut },
          {
            label: translate(locale, 'inquiryReceived.guests'),
            value: String(reservation.guests),
          },
          {
            label: translate(locale, 'inquiryReceived.estimatedTotal'),
            value: reservation.estimatedTotal,
          },
        ]}
      />

      <Section style={noteStyle}>
        <Text style={noteTextStyle}>{translate(locale, 'inquiryReceived.note')}</Text>
      </Section>
    </EmailLayout>
  )
}

InquiryReceivedEmail.PreviewProps = {
  locale: 'fr',
  guest: { firstName: 'Camille' },
  listing: { title: 'Le Marais Terrasse' },
  reservation: {
    checkIn: '28 avril 2026',
    checkOut: '2 mai 2026',
    guests: 2,
    estimatedTotal: '1 120 EUR',
  },
} satisfies InquiryReceivedProps

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

const noteStyle = {
  backgroundColor: colors.cream,
  borderLeft: `3px solid ${colors.primary}`,
  padding: '12px 16px',
  margin: '16px 0',
}

const noteTextStyle = {
  color: colors.secondary,
  fontSize: '14px',
  lineHeight: '1.5',
  margin: 0,
  fontStyle: 'italic' as const,
}
