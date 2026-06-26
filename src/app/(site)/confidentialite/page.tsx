import { StoryblokStory } from '@storyblok/react/rsc'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getStoryBySlug } from '@/lib/storyblok-page'

export const metadata = {
  title: 'Politique de confidentialité - Alto',
  description: 'Politique de confidentialité Alto.',
}

export default async function ConfidentialitePage() {
  const locale = getStaticServerLocale()
  const story = await getStoryBySlug('pages/confidentialite', locale)

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

  const copy = PRIVACY_COPY[locale]

  return (
    <>
      <Header variant="dark" />
      <main className="max-w-content px-gutter py-section md:px-gutter-md md:py-section-md mx-auto w-full">
        <div className="max-w-[720px]">
          <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">Alto</p>
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

const PRIVACY_COPY = {
  fr: {
    title: 'Politique de confidentialité',
    body: [
      'Alto collecte uniquement les informations nécessaires au traitement des demandes de séjour, des réservations et des échanges avec les voyageurs.',
      'Les données peuvent inclure les informations de contact, les dates de séjour, les préférences liées à la réservation et les informations strictement utiles au suivi client.',
      'Pour toute demande d’accès, de correction ou de suppression des données, contactez Alto à l’adresse contact@alto-paris.com.',
    ],
  },
  en: {
    title: 'Privacy policy',
    body: [
      'Alto only collects the information required to process stay requests, bookings, and guest conversations.',
      'This data may include contact details, stay dates, booking preferences, and the information strictly needed for customer support.',
      'For any request to access, correct, or delete data, contact Alto at contact@alto-paris.com.',
    ],
  },
} as const
