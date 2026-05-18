import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FaqSection } from '@/components/sections/faq-section'
import { Button } from '@/components/ui/button'
import { getServerLocale } from '@/lib/i18n/server'
import { getSiteImages } from '@/lib/storyblok-site-images'

export default async function InvestirPage() {
  const locale = await getServerLocale()
  const copy = INVEST_COPY[locale]
  const siteImages = await getSiteImages(locale)

  return (
    <>
      {/* Hero */}
      <div className="relative h-[442px] overflow-hidden">
        <Image
          src={siteImages.pages.investHero}
          alt={copy.heroAlt}
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
            <h1 className="text-cream text-base font-bold leading-[18px]">{copy.heroTitle}</h1>
            <p className="text-cream/80 mt-3 max-w-[505px] text-xs font-medium leading-[20px]">
              {copy.heroText}
            </p>
          </div>
        </div>
      </div>

      <main>
        {/* Section Appartements */}
        <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
          <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">{copy.apartmentsEyebrow}</p>
          <p className="text-coffee mt-1 max-w-[205px] text-base font-medium leading-[24px]">
            {copy.apartmentsTitle}
          </p>

          <div className="mt-10">
            <p className="text-coffee max-w-[408px] text-base font-bold leading-[20px]">
              {copy.apartmentsLead}
            </p>

            <div className="mt-8 max-w-[408px] space-y-4">
              {copy.apartmentsBody.map((paragraph) => (
                <p key={paragraph} className="text-coffee text-xs font-medium leading-[22px]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Section Le Modèle */}
        <section className="bg-silver">
          <div className="mx-auto grid max-w-content grid-cols-1 gap-12 px-gutter py-section md:px-gutter-md lg:grid-cols-[304px_1fr]">
            <div className="relative h-[350px] overflow-hidden rounded-lg lg:h-[468px]">
              <Image
                src={siteImages.pages.investModel}
                alt={copy.modelAlt}
                fill
                sizes="304px"
                quality={85}
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-cream text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">{copy.modelEyebrow}</p>
              <h2 className="text-cream mt-1 text-base font-medium leading-[24px]">{copy.modelTitle}</h2>

              <div className="mt-10 flex flex-col gap-8">
                {copy.modelPoints.map((point) => (
                  <div key={point.title}>
                    <h3 className="text-cream text-base font-bold leading-[20px]">{point.title}</h3>
                    <p className="text-cream mt-2 text-xs font-medium leading-[22px]">{point.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section Chiffres */}
        <section className="bg-coffee">
          <div className="mx-auto max-w-content px-gutter py-16 text-center md:px-gutter-md">
            <div className="mx-auto max-w-[735px]">
             <p className="text-cream text-base font-bold leading-[24px]">
                {copy.statsLineOne}
              </p>
              <p className="text-cream text-base font-bold leading-[24px]">
                {copy.statsLineTwo}
              </p>
            </div>

            <p className="text-cream/70 mt-4 text-xs font-medium">
              {copy.statsBody}
            </p>

            <p className="text-cream/70 mt-8 text-xs font-medium">{copy.seenOn}</p>
            <div className="mt-3 flex items-center justify-center gap-6">
              <span className="text-cream text-sm font-bold tracking-wider">AD</span>
              <div className="bg-cream/20 h-5 w-px" />
              <span className="text-cream text-sm font-bold tracking-wider">MONOCLE</span>
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
          <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">{copy.contactEyebrow}</p>
          <h2 className="text-coffee mt-1 text-base font-medium leading-[24px]">{copy.contactTitle}</h2>

          <p className="text-coffee mt-8 max-w-[728px] text-base font-bold leading-[20px]">
            {copy.contactLead}
          </p>

          <div className="mt-8 flex gap-3">
            <Button>{copy.investorDeck}</Button>
            <Button variant="outline" className="border-silver text-silver">{copy.contactButton}</Button>
          </div>
        </section>

        <FaqSection />
      </main>

      <Footer />
    </>
  )
}

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
