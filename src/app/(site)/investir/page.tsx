import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FaqSection } from '@/components/sections/faq-section'
import { Button } from '@/components/ui/button'
import { getSiteImages } from '@/lib/storyblok-site-images'

const MODEL_POINTS = [
  {
    title: 'Performance opérationnelle',
    description: "Un taux d'occupation optimisé grâce à une stratégie tarifaire dynamique et un positionnement haut de gamme différenciant.",
  },
  {
    title: 'Maîtrise des coûts',
    description: "Un réseau d'artisans, de partenaires et de fournisseurs permettant une gestion rigoureuse des investissements et des charges.",
  },
  {
    title: 'Expérience premium',
    description: 'Une expérience client soignée, générant récurrence et recommandations.',
  },
]

export default async function InvestirPage() {
  const siteImages = await getSiteImages()

  return (
    <>
      {/* Hero */}
      <div className="relative h-[442px] overflow-hidden">
        <Image
          src={siteImages.pages.investHero}
          alt="Investir avec Alto"
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
            <h1 className="text-cream text-base font-bold leading-[18px]">Investir avec nous</h1>
            <p className="text-cream/80 mt-3 max-w-[505px] text-xs font-medium leading-[20px]">
              Un modèle d'appartements haut de gamme, ancrés dans les quartiers les plus recherchés, pensé pour conjuguer rendement et excellence esthétique.
            </p>
          </div>
        </div>
      </div>

      <main>
        {/* Section Appartements */}
        <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
          <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">Les appartements</p>
          <p className="text-coffee mt-1 max-w-[205px] text-base font-medium leading-[24px]">
            Une collection d'adresses à forte valeur patrimoniale
          </p>

          <div className="mt-10">
            <p className="text-coffee max-w-[408px] text-base font-bold leading-[20px]">
              Nous sélectionnons des biens situés dans des emplacements premium, au cœur de villes à forte attractivité culturelle et touristique.
            </p>

            <div className="mt-8 max-w-[408px] space-y-4">
              <p className="text-coffee text-xs font-medium leading-[22px]">
                Chaque appartement est soigneusement rénové, valorisé par une direction artistique exigeante, optimisé pour la location courte et moyenne durée.
              </p>
              <p className="text-coffee text-xs font-medium leading-[22px]">
                Notre approche repose sur un équilibre entre rentabilité, désirabilité et pérennité du patrimoine.
              </p>
            </div>
          </div>
        </section>

        {/* Section Le Modèle */}
        <section className="bg-silver">
          <div className="mx-auto grid max-w-content grid-cols-1 gap-12 px-gutter py-section md:px-gutter-md lg:grid-cols-[304px_1fr]">
            <div className="relative h-[350px] overflow-hidden rounded-lg lg:h-[468px]">
              <Image
                src={siteImages.pages.investModel}
                alt="Intérieur Alto"
                fill
                sizes="304px"
                quality={85}
                className="object-cover"
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-cream text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">Le modèle</p>
              <h2 className="text-cream mt-1 text-base font-medium leading-[24px]">Un modèle éprouvé</h2>

              <div className="mt-10 flex flex-col gap-8">
                {MODEL_POINTS.map((point) => (
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
                12 appartements soigneusement pensés,
              </p>
              <p className="text-cream text-base font-bold leading-[24px]">
                3 villes emblématiques, déjà 480 voyageurs conquis.
              </p>
            </div>

            <p className="text-cream/70 mt-4 text-xs font-medium">
              Une collection intime d'adresses où l'on se sent chez soi, naturellement.
            </p>

            <p className="text-cream/70 mt-8 text-xs font-medium">Vu sur :</p>
            <div className="mt-3 flex items-center justify-center gap-6">
              <span className="text-cream text-sm font-bold tracking-wider">AD</span>
              <div className="bg-cream/20 h-5 w-px" />
              <span className="text-cream text-sm font-bold tracking-wider">MONOCLE</span>
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
          <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">Nous contacter</p>
          <h2 className="text-coffee mt-1 text-base font-medium leading-[24px]">Échangeons sur votre projet</h2>

          <p className="text-coffee mt-8 max-w-[728px] text-base font-bold leading-[20px]">
            Vous souhaitez en savoir plus sur notre modèle ou étudier une opportunité d'investissement ?
          </p>

          <div className="mt-8 flex gap-3">
            <Button>Recevoir le dossier investisseur</Button>
            <Button variant="outline" className="border-silver text-silver">Nous contacter</Button>
          </div>
        </section>

        <FaqSection />
      </main>

      <Footer />
    </>
  )
}
