import { Heading, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { DetailsCard } from './components/details-card'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface BookingConfirmationProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: { title: string; image?: string; slug?: string }
  reservation: {
    checkIn: string
    checkOut: string
    guests: number
    nights: number
    total: string
  }
  cancelUrl?: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alto-virid.vercel.app'

export default function BookingConfirmationEmail({
  locale,
  guest,
  listing,
  reservation,
  cancelUrl,
}: BookingConfirmationProps) {
  const preview = translate(locale, 'confirmation.subject')
  const nightsPlural = reservation.nights > 1 ? 's' : ''
  const cta = listing.slug
    ? {
        label: locale === 'fr' ? 'Voir ma réservation' : 'View my booking',
        href: `${SITE_URL}/appartements/${listing.slug}`,
      }
    : undefined
  const secondaryCta = cancelUrl
    ? {
        label: locale === 'fr' ? 'Annuler ma réservation' : 'Cancel my booking',
        href: cancelUrl,
      }
    : undefined

  return (
    <EmailLayout
      locale={locale}
      preview={preview}
      heroImage={listing.image}
      heroAlt={listing.title}
      cta={cta}
      secondaryCta={secondaryCta}
    >
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
  listing: {
    title: 'Le Marais Terrasse',
    image: 'https://alto-virid.vercel.app/images/alto-salon.jpg',
    slug: 'le-marais-terrasse',
  },
  reservation: {
    checkIn: '28 avril 2026',
    checkOut: '2 mai 2026',
    guests: 2,
    nights: 4,
    total: '1 120 EUR',
  },
  cancelUrl: 'https://alto-virid.vercel.app/annulation?token=demo',
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
