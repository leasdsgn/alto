import { Heading, Text } from '@react-email/components'
import { EmailLayout, colors } from './components/email-layout'
import { DetailsCard } from './components/details-card'
import { translate } from '@/lib/i18n/email-dictionary'
import { type InquiryLocale } from '@/types/inquiry'

export interface PreArrivalProps {
  locale: InquiryLocale
  guest: { firstName: string }
  listing: {
    title: string
    address?: string
    accessCode?: string
    wifiName?: string
    wifiPassword?: string
    instructions?: string
  }
}

export default function PreArrivalEmail({ locale, guest, listing }: PreArrivalProps) {
  const preview = translate(locale, 'preArrival.subject')
  const items = [
    listing.address && { label: translate(locale, 'preArrival.address'), value: listing.address },
    listing.accessCode && {
      label: translate(locale, 'preArrival.accessCode'),
      value: listing.accessCode,
    },
    (listing.wifiName || listing.wifiPassword) && {
      label: translate(locale, 'preArrival.wifi'),
      value: [listing.wifiName, listing.wifiPassword].filter(Boolean).join(' / '),
    },
    { label: '', value: translate(locale, 'preArrival.checkInTime') },
    { label: '', value: translate(locale, 'preArrival.checkOutTime') },
  ].filter((item): item is { label: string; value: string } => Boolean(item))

  return (
    <EmailLayout locale={locale} preview={preview}>
      <Heading style={headingStyle}>{translate(locale, 'preArrival.heading')}</Heading>
      <Text style={paragraphStyle}>
        {translate(locale, 'preArrival.greeting', { firstName: guest.firstName })}
      </Text>
      <Text style={paragraphStyle}>
        {translate(locale, 'preArrival.body', { listingTitle: listing.title })}
      </Text>

      <DetailsCard title={translate(locale, 'preArrival.instructions')} items={items} />
    </EmailLayout>
  )
}

PreArrivalEmail.PreviewProps = {
  locale: 'fr',
  guest: { firstName: 'Camille' },
  listing: {
    title: 'Le Marais Terrasse',
    address: '12 rue des Francs-Bourgeois, 75003 Paris',
    accessCode: '4578',
    wifiName: 'Alto-Marais',
    wifiPassword: 'bienvenue2026',
    instructions: 'Entrée par la cour intérieure, digicode à gauche.',
  },
} satisfies PreArrivalProps

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
