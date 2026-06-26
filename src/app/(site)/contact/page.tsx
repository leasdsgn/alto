import Image from 'next/image'
import { StoryblokStory } from '@storyblok/react/rsc'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getServerLocale } from '@/lib/i18n/server'
import { getSiteImages } from '@/lib/storyblok-site-images'
import { getStoryBySlug } from '@/lib/storyblok-page'

export default async function ContactPage() {
  const locale = await getServerLocale()
  const story = await getStoryBySlug('pages/contact', locale)

  if (
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0
  ) {
    return (
      <>
        <StoryblokStory story={story} />
        <Footer />
      </>
    )
  }

  const copy = CONTACT_COPY[locale]
  const siteImages = await getSiteImages(locale)

  return (
    <>
      <div className="relative h-[442px] overflow-hidden">
        <Image
          src={siteImages.pages.contactHero}
          alt={copy.imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-coffee/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-coffee/75 to-transparent" />

        <Header />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-content px-gutter pb-10 md:px-gutter-md">
            <h1 className="text-cream text-base font-bold leading-[18px]">Contact</h1>
            <p className="text-cream/80 mt-3 max-w-[505px] text-xs font-medium leading-[20px]">
              {copy.heroText}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_304px]">
          <div>
            <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">
              {copy.formEyebrow}
            </p>
            <h2 className="text-coffee mt-1 text-base font-medium leading-[24px]">
              {copy.formTitle}
            </h2>

            <p className="text-coffee mt-6 text-xs font-medium">
              {copy.fallbackNote}
            </p>
          </div>

          <aside className="space-y-8">
            <div>
              <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Email</p>
              <a
                href="mailto:contact@alto-paris.com"
                className="text-coffee mt-2 block text-sm font-medium"
              >
                contact@alto-paris.com
              </a>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  )
}

const CONTACT_COPY = {
  fr: {
    imageAlt: 'Contactez-nous',
    heroText: 'Une question, un projet d’investissement, une réservation ? Écrivez-nous.',
    formEyebrow: 'Formulaire',
    formTitle: 'Envoyez-nous un message',
    fallbackNote: 'Le formulaire est en cours de migration vers le CMS.',
  },
  en: {
    imageAlt: 'Contact us',
    heroText: 'A question, an investment project, a booking? Write to us.',
    formEyebrow: 'Form',
    formTitle: 'Send us a message',
    fallbackNote: 'The form is being migrated to the CMS.',
  },
} as const
