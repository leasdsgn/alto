import { type InquiryLocale } from '@/types/inquiry'

export const emailDictionary = {
  fr: {
    common: {
      brand: 'Alto',
      signature: "L'équipe Alto",
      contact: 'Une question ? Répondez à cet email.',
      footer: 'Vous recevez cet email suite à une réservation sur alto.fr',
    },
    confirmation: {
      subject: 'Votre réservation est confirmée',
      heading: 'Réservation confirmée',
      greeting: 'Bonjour {{firstName}},',
      body: 'Nous avons le plaisir de confirmer votre réservation de {{nights}} nuit{{nightsPlural}} au {{listingTitle}}.',
      detailsTitle: 'Détails du séjour',
      checkIn: 'Arrivée',
      checkOut: 'Départ',
      guests: 'Voyageurs',
      total: 'Total payé',
      nextSteps: 'Vous recevrez les instructions d\'arrivée trois jours avant votre check-in.',
    },
    inquiryReceived: {
      subject: 'Votre demande de réservation a été reçue',
      heading: 'Demande en cours de traitement',
      greeting: 'Bonjour {{firstName}},',
      body: 'Nous avons bien reçu votre demande de réservation pour le {{listingTitle}}. Notre équipe la validera sous 24 heures.',
      detailsTitle: 'Votre demande',
      checkIn: 'Arrivée souhaitée',
      checkOut: 'Départ souhaité',
      guests: 'Voyageurs',
      estimatedTotal: 'Montant estimé',
      note: 'Aucune somme n\'a été débitée. Votre carte sera uniquement utilisée si votre demande est validée.',
    },
    inquiryConfirmed: {
      subject: 'Votre demande est validée, votre séjour est réservé',
      heading: 'Demande validée',
      greeting: 'Bonjour {{firstName}},',
      body: 'Bonne nouvelle. Votre demande pour le {{listingTitle}} a été validée et le paiement de {{amount}} a été prélevé sur votre carte.',
      detailsTitle: 'Détails du séjour',
      checkIn: 'Arrivée',
      checkOut: 'Départ',
      guests: 'Voyageurs',
      total: 'Total payé',
      nextSteps: 'Vous recevrez les instructions d\'arrivée trois jours avant votre check-in.',
    },
    inquiryRefused: {
      subject: 'Votre demande de réservation n\'a pas pu être validée',
      heading: 'Demande non validée',
      greeting: 'Bonjour {{firstName}},',
      body: 'Nous sommes au regret de ne pas pouvoir confirmer votre demande pour le {{listingTitle}} sur les dates demandées. Aucune somme n\'a été débitée de votre carte.',
      suggestion: 'N\'hésitez pas à consulter nos autres appartements disponibles sur alto.fr.',
    },
    preArrival: {
      subject: 'Votre arrivée approche',
      heading: 'Informations pour votre arrivée',
      greeting: 'Bonjour {{firstName}},',
      body: 'Votre séjour au {{listingTitle}} commence dans quelques jours. Voici les informations pratiques pour votre arrivée.',
      address: 'Adresse',
      accessCode: 'Code d\'accès',
      wifi: 'WiFi',
      checkInTime: 'Check-in à partir de 15h',
      checkOutTime: 'Check-out avant 11h',
      instructions: 'Instructions',
    },
    postStay: {
      subject: 'Merci pour votre séjour',
      heading: 'Merci pour votre visite',
      greeting: 'Bonjour {{firstName}},',
      body: 'Nous espérons que votre séjour au {{listingTitle}} a été à la hauteur de vos attentes. Ce fut un plaisir de vous accueillir.',
      reviewCta: 'Partager votre avis nous aiderait beaucoup.',
      invite: 'Nous serions ravis de vous accueillir à nouveau.',
    },
  },
  en: {
    common: {
      brand: 'Alto',
      signature: 'The Alto team',
      contact: 'Any question? Simply reply to this email.',
      footer: 'You are receiving this email following a booking on alto.fr',
    },
    confirmation: {
      subject: 'Your booking is confirmed',
      heading: 'Booking confirmed',
      greeting: 'Hi {{firstName}},',
      body: 'We are pleased to confirm your booking of {{nights}} night{{nightsPlural}} at {{listingTitle}}.',
      detailsTitle: 'Stay details',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guests: 'Guests',
      total: 'Total paid',
      nextSteps: 'You will receive check-in instructions three days before arrival.',
    },
    inquiryReceived: {
      subject: 'Your booking request has been received',
      heading: 'Request being processed',
      greeting: 'Hi {{firstName}},',
      body: 'We have received your booking request for {{listingTitle}}. Our team will review it within 24 hours.',
      detailsTitle: 'Your request',
      checkIn: 'Requested check-in',
      checkOut: 'Requested check-out',
      guests: 'Guests',
      estimatedTotal: 'Estimated amount',
      note: 'No amount has been charged yet. Your card will only be used if your request is approved.',
    },
    inquiryConfirmed: {
      subject: 'Request approved, your stay is booked',
      heading: 'Request approved',
      greeting: 'Hi {{firstName}},',
      body: 'Good news. Your request for {{listingTitle}} has been approved and {{amount}} has been charged to your card.',
      detailsTitle: 'Stay details',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      guests: 'Guests',
      total: 'Total paid',
      nextSteps: 'You will receive check-in instructions three days before arrival.',
    },
    inquiryRefused: {
      subject: 'Your booking request could not be approved',
      heading: 'Request not approved',
      greeting: 'Hi {{firstName}},',
      body: 'We are sorry to inform you that we could not confirm your request for {{listingTitle}} on the requested dates. No amount has been charged to your card.',
      suggestion: 'Feel free to browse our other available apartments on alto.fr.',
    },
    preArrival: {
      subject: 'Your stay is coming up',
      heading: 'Arrival information',
      greeting: 'Hi {{firstName}},',
      body: 'Your stay at {{listingTitle}} is a few days away. Here is the practical information for your arrival.',
      address: 'Address',
      accessCode: 'Access code',
      wifi: 'WiFi',
      checkInTime: 'Check-in from 3 PM',
      checkOutTime: 'Check-out before 11 AM',
      instructions: 'Instructions',
    },
    postStay: {
      subject: 'Thank you for your stay',
      heading: 'Thanks for visiting',
      greeting: 'Hi {{firstName}},',
      body: 'We hope your stay at {{listingTitle}} met your expectations. It was a pleasure to host you.',
      reviewCta: 'Sharing your experience would help us a lot.',
      invite: 'We would be delighted to welcome you back.',
    },
  },
} as const

type Dictionary = typeof emailDictionary.fr

export type EmailKey =
  | `common.${keyof Dictionary['common']}`
  | `confirmation.${keyof Dictionary['confirmation']}`
  | `inquiryReceived.${keyof Dictionary['inquiryReceived']}`
  | `inquiryConfirmed.${keyof Dictionary['inquiryConfirmed']}`
  | `inquiryRefused.${keyof Dictionary['inquiryRefused']}`
  | `preArrival.${keyof Dictionary['preArrival']}`
  | `postStay.${keyof Dictionary['postStay']}`

export function translate(
  locale: InquiryLocale,
  key: EmailKey,
  vars?: Record<string, string | number>,
): string {
  const [section, field] = key.split('.') as [keyof Dictionary, string]
  const dict = emailDictionary[locale][section] as Record<string, string>
  const raw = dict[field] ?? ''

  if (!vars) return raw
  return raw.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : '',
  )
}
