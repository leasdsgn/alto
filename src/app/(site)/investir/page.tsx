import type { Metadata } from 'next'
import Image from 'next/image'
import { StoryblokStory } from '@storyblok/react/rsc'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FaqSection } from '@/components/sections/faq-section'
import { Button } from '@/components/ui/button'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { WHATSAPP_LINK } from '@/lib/whatsapp'

const INVESTIR_METADATA: Record<'fr' | 'en', Metadata> = {
  fr: {
    title: 'Investir avec Alto',
    description:
      'Découvrez le modèle Alto pour investir dans des appartements haut de gamme pensés pour la location courte et moyenne durée.',
  },
  en: {
    title: 'Invest with Alto',
    description:
      'Discover Alto’s model for investing in high-end apartments designed for short and mid-term rentals.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getStaticServerLocale()
  return INVESTIR_METADATA[locale]
}

export default async function InvestirPage() {
  const locale = getStaticServerLocale()
  const story = await getStoryBySlug('pages/investir', locale)

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

  const copy = INVEST_COPY[locale]

  return (
    <>
      <div className="relative h-[442px] overflow-hidden">
        <Image
          src={INVESTIR_FALLBACK_IMAGES.hero}
          alt={copy.heroAlt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="from-coffee/75 absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent" />
        <div className="from-coffee/75 absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t to-transparent" />

        <Header />

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto w-full pb-10">
            <h1 className="text-cream text-base leading-[18px] font-bold">{copy.heroTitle}</h1>
            <p className="text-cream/80 mt-3 max-w-[505px] text-xs leading-[20px] font-medium">
              {copy.heroText}
            </p>
          </div>
        </div>
      </div>

      <main>
        <section className="max-w-content px-gutter py-section md:px-gutter-md mx-auto">
          <p className="text-silver text-xs leading-[24px] font-bold tracking-[0.24px] uppercase">
            {copy.apartmentsEyebrow}
          </p>
          <p className="text-coffee mt-1 max-w-[205px] text-base leading-[24px] font-medium">
            {copy.apartmentsTitle}
          </p>

          <div className="mt-10">
            <p className="text-coffee max-w-[408px] text-base leading-[20px] font-bold">
              {copy.apartmentsLead}
            </p>

            <div className="mt-8 max-w-[408px] space-y-4">
              {copy.apartmentsBody.map((paragraph) => (
                <p key={paragraph} className="text-coffee text-xs leading-[22px] font-medium">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-silver">
          <div className="max-w-content px-gutter py-section md:px-gutter-md mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[304px_1fr]">
            <div className="relative h-[350px] overflow-hidden rounded-lg lg:h-[468px]">
              <Image
                src={INVESTIR_FALLBACK_IMAGES.model}
                alt={copy.modelAlt}
                fill
                sizes="304px"
                quality={85}
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-cream text-xs leading-[24px] font-bold tracking-[0.24px] uppercase">
                {copy.modelEyebrow}
              </p>
              <h2 className="text-cream mt-1 text-base leading-[24px] font-medium">
                {copy.modelTitle}
              </h2>

              <div className="mt-10 flex flex-col gap-8">
                {copy.modelPoints.map((point) => (
                  <div key={point.title}>
                    <h3 className="text-cream text-base leading-[20px] font-bold">{point.title}</h3>
                    <p className="text-cream mt-2 text-xs leading-[22px] font-medium">
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-coffee">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto py-16 text-center">
            <div className="mx-auto max-w-[735px]">
              <p className="text-cream text-base leading-[24px] font-bold">{copy.statsLineOne}</p>
              <p className="text-cream text-base leading-[24px] font-bold">{copy.statsLineTwo}</p>
            </div>

            <p className="text-cream/70 mt-4 text-xs font-medium">{copy.statsBody}</p>

            <p className="text-cream/70 mt-8 text-xs font-medium">{copy.seenOn}</p>
            <div className="mt-3 flex items-center justify-center gap-6">
              <span className="text-cream text-sm font-bold tracking-wider">AD</span>
              <div className="bg-cream/20 h-5 w-px" />
              <span className="text-cream text-sm font-bold tracking-wider">MONOCLE</span>
            </div>
          </div>
        </section>

        <section className="max-w-content px-gutter py-section md:px-gutter-md mx-auto">
          <p className="text-silver text-xs leading-[24px] font-bold tracking-[0.24px] uppercase">
            {copy.contactEyebrow}
          </p>
          <h2 className="text-coffee mt-1 text-base leading-[24px] font-medium">
            {copy.contactTitle}
          </h2>

          <p className="text-coffee mt-8 max-w-[728px] text-base leading-[20px] font-bold">
            {copy.contactLead}
          </p>

          <div className="mt-8 flex gap-3">
            <Button href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              {copy.investorDeck}
            </Button>
            <Button
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              className="border-silver text-silver"
            >
              {copy.contactButton}
            </Button>
          </div>
        </section>

        <FaqSection />
      </main>

      <Footer />
    </>
  )
}

const INVESTIR_FALLBACK_IMAGES = {
  hero: '/images/alto-salon.jpg',
  model: '/images/alto-salon.jpg',
} as const

const INVEST_COPY = {
  fr: {
    heroAlt: 'Investir avec Alto',
    heroTitle: 'Investir avec nous',
    heroText:
      'Un modèle d’appartements haut de gamme, ancrés dans les quartiers les plus recherchés, pensé pour conjuguer rendement et excellence esthétique.',
    apartmentsEyebrow: 'Les appartements',
    apartmentsTitle: 'Une collection d’adresses à forte valeur patrimoniale',
    apartmentsLead:
      'Nous sélectionnons des biens situés dans des emplacements premium, au cœur de villes à forte attractivité culturelle et touristique.',
    apartmentsBody: [
      'Chaque appartement est soigneusement rénové, valorisé par une direction artistique exigeante, optimisé pour la location courte et moyenne durée.',
      'Notre approche repose sur un équilibre entre rentabilité, désirabilité et pérennité du patrimoine.',
    ],
    modelAlt: 'Intérieur Alto',
    modelEyebrow: 'Le modèle',
    modelTitle: 'Un modèle éprouvé',
    modelPoints: [
      {
        title: 'Performance opérationnelle',
        description:
          'Un taux d’occupation optimisé grâce à une stratégie tarifaire dynamique et un positionnement haut de gamme différenciant.',
      },
      {
        title: 'Maîtrise des coûts',
        description:
          'Un réseau d’artisans, de partenaires et de fournisseurs permettant une gestion rigoureuse des investissements et des charges.',
      },
      {
        title: 'Expérience premium',
        description: 'Une expérience client soignée, générant récurrence et recommandations.',
      },
    ],
    statsLineOne: '12 appartements soigneusement pensés,',
    statsLineTwo: '3 villes emblématiques, déjà 480 voyageurs conquis.',
    statsBody: 'Une collection intime d’adresses où l’on se sent chez soi, naturellement.',
    seenOn: 'Vu sur :',
    contactEyebrow: 'Nous contacter',
    contactTitle: 'Échangeons sur votre projet',
    contactLead:
      'Vous souhaitez en savoir plus sur notre modèle ou étudier une opportunité d’investissement ?',
    investorDeck: 'Recevoir le dossier investisseur',
    contactButton: 'Nous contacter',
  },
  en: {
    heroAlt: 'Invest with Alto',
    heroTitle: 'Invest with us',
    heroText:
      'A premium apartment model, rooted in sought-after neighborhoods, designed to combine yield with strong aesthetic value.',
    apartmentsEyebrow: 'Apartments',
    apartmentsTitle: 'A collection of addresses with lasting property value',
    apartmentsLead:
      'We select properties in premium locations, at the heart of cities with strong cultural and travel appeal.',
    apartmentsBody: [
      'Each apartment is carefully renovated, shaped by precise art direction, and optimized for short and medium stays.',
      'Our approach balances profitability, desirability, and long-term property value.',
    ],
    modelAlt: 'Alto interior',
    modelEyebrow: 'The model',
    modelTitle: 'A proven model',
    modelPoints: [
      {
        title: 'Operational performance',
        description:
          'Optimized occupancy through dynamic pricing and a differentiated premium positioning.',
      },
      {
        title: 'Cost control',
        description:
          'A network of craftspeople, partners, and suppliers supporting disciplined investment and cost management.',
      },
      {
        title: 'Premium experience',
        description: 'A considered guest experience that drives repeat stays and recommendations.',
      },
    ],
    statsLineOne: '12 carefully designed apartments,',
    statsLineTwo: '3 landmark cities, already 480 guests hosted.',
    statsBody: 'An intimate collection of addresses where guests naturally feel at home.',
    seenOn: 'Seen in:',
    contactEyebrow: 'Contact us',
    contactTitle: 'Let’s discuss your project',
    contactLead: 'Want to learn more about our model or review an investment opportunity?',
    investorDeck: 'Receive the investor deck',
    contactButton: 'Contact us',
  },
} as const
