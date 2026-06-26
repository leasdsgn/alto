import { StoryblokStory } from '@storyblok/react/rsc'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getServerLocale } from '@/lib/i18n/server'
import { getStoryBySlug } from '@/lib/storyblok-page'

export const metadata = {
  title: 'Conditions et termes - Alto',
  description: 'Conditions de réservation Alto.',
}

export default async function CgvPage() {
  const locale = await getServerLocale()
  const story = await getStoryBySlug('pages/cgv', locale)

  if (
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0
  ) {
    return (
      <>
        <Header variant="dark" />
        <StoryblokStory story={story} />
        <Footer />
      </>
    )
  }

  const copy = TERMS_COPY[locale]

  return (
    <>
      <Header variant="dark" />
      <main className="mx-auto w-full max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
        <div className="max-w-[720px]">
          <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Alto</p>
          <h1 className="text-coffee mt-3 text-2xl font-bold md:text-4xl">{copy.title}</h1>
          <div className="text-coffee mt-10 space-y-6 text-sm leading-[1.8]">
            {copy.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

const TERMS_COPY = {
  fr: {
    title: 'Conditions et termes',
    body: [
      'Les réservations Alto sont soumises aux disponibilités, aux tarifs affichés au moment de la réservation et aux conditions associées à chaque logement.',
      'La réservation est confirmée après paiement en ligne. Une caution Swikly peut être demandée avant l’arrivée du voyageur. Cette caution est obligatoire lorsque Alto la demande.',
      'Alto se réserve le droit d’annuler la réservation si la caution Swikly n’est pas complétée dans les délais indiqués au voyageur. Les conditions d’annulation et de remboursement applicables restent celles communiquées pendant le parcours de réservation.',
      'Pour toute question liée à une réservation, contactez Alto à l’adresse contact@alto-paris.com.',
    ],
  },
  en: {
    title: 'Terms and conditions',
    body: [
      'Alto bookings are subject to availability, the rates displayed at the time of booking, and the terms attached to each apartment.',
      'The booking is confirmed after online payment. A Swikly security deposit may be requested before the guest’s arrival. This deposit is mandatory when requested by Alto.',
      'Alto reserves the right to cancel the booking if the Swikly security deposit is not completed within the timeframe indicated to the guest. Applicable cancellation and refund terms remain those shown during the booking flow.',
      'For any booking-related question, contact Alto at contact@alto-paris.com.',
    ],
  },
} as const
