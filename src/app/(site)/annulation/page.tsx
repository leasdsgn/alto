import type { Metadata } from 'next'
import { StoryblokStory } from '@storyblok/react/rsc'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { defineSeoMetadata } from '@/lib/seo'

const CANCELLATION_METADATA: Record<'fr' | 'en', { title: string; description: string }> = {
  fr: {
    title: 'Politique d’annulation - Alto',
    description: 'Politique d’annulation Alto.',
  },
  en: {
    title: 'Cancellation policy - Alto',
    description: 'Alto cancellation policy.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getStaticServerLocale()
  return defineSeoMetadata({
    ...CANCELLATION_METADATA[locale],
    path: '/annulation',
    image: '/images/appartements-hero.webp',
  })
}

export default async function AnnulationPage() {
  const locale = getStaticServerLocale()
  const story = await getStoryBySlug('pages/annulation', locale)

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

  const copy = CANCELLATION_COPY[locale]

  return (
    <>
      <Header variant="dark" />
      <main className="max-w-content px-gutter py-section md:px-gutter-md md:py-section-md mx-auto w-full">
        <div className="max-w-[720px]">
          <p className="text-silver font-display text-xs tracking-[0.24px] italic">Alto</p>
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

const CANCELLATION_COPY = {
  fr: {
    title: 'Politique d’annulation',
    body: [
      'Les conditions d’annulation applicables sont celles communiquées au moment de la réservation.',
      'Toute demande d’annulation doit être adressée directement à Alto ou traitée depuis les outils de gestion Guesty utilisés par Alto.',
      'Les remboursements éventuels, litiges, refus bancaires et ajustements de paiement sont gérés hors du site Alto, selon les règles applicables à la réservation et les outils utilisés par Alto.',
      'Pour toute question liée à une réservation, contactez Alto à l’adresse contact@alto-paris.com.',
    ],
  },
  en: {
    title: 'Cancellation policy',
    body: [
      'The applicable cancellation terms are the ones shown at the time of booking.',
      'Any cancellation request must be sent directly to Alto or handled from the Guesty management tools used by Alto.',
      'Any refunds, disputes, bank declines, and payment adjustments are handled outside the Alto website, according to the rules attached to the booking and the tools used by Alto.',
      'For any booking-related question, contact Alto at contact@alto-paris.com.',
    ],
  },
} as const
