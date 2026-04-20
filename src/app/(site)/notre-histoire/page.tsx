import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

const VALUES = [
  {
    number: '01',
    title: 'Exigence',
    text: "Chaque appartement est sélectionné, rénové et meublé avec la même rigueur. Rien n'est laissé au hasard.",
  },
  {
    number: '02',
    title: 'Ancrage',
    text: "Nous choisissons des quartiers vivants, chargés d'histoire. Des adresses où l'on revient.",
  },
  {
    number: '03',
    title: 'Discrétion',
    text: "Un service présent quand il faut, invisible le reste du temps. L'hospitalité sans l'intrusion.",
  },
]

const MILESTONES = [
  { year: '2021', text: 'Premier appartement à Paris, Le Marais.' },
  { year: '2022', text: "Ouverture de trois nouvelles adresses. L'identité Alto prend forme." },
  { year: '2023', text: 'Expansion à Lyon. 480 voyageurs accueillis.' },
  { year: '2024', text: 'Lancement de la plateforme de réservation directe.' },
]

export default function NotreHistoirePage() {
  return (
    <>
      <div className="relative h-[442px] overflow-hidden">
        <Image
          src="/images/alto-salon.jpg"
          alt="Notre histoire"
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
            <h1 className="text-cream text-base font-bold leading-[18px]">Notre histoire</h1>
            <p className="text-cream/80 mt-3 max-w-[505px] text-xs font-medium leading-[20px]">
              Alto est ne d'une conviction simple : on peut voyager autrement, sans compromis entre confort, esthetique et authenticite.
            </p>
          </div>
        </div>
      </div>

      <main>
        <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
          <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">L'origine</p>
          <h2 className="text-coffee mt-1 max-w-[408px] text-base font-medium leading-[24px]">
            Des appartements qui racontent quelque chose
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="max-w-[408px] space-y-4">
              <p className="text-coffee text-base font-bold leading-[20px]">
                Alto est parti d'un constat : les locations courte duree oscillent entre le standardise et l'approximatif.
              </p>
              <p className="text-coffee text-xs font-medium leading-[22px]">
                Nous avons voulu creer un entre-deux. Des lieux ou l'on se sent chez soi, avec l'attention d'un hotel. Des interieurs penses, pas decores. Des quartiers choisis, pas subis.
              </p>
              <p className="text-coffee text-xs font-medium leading-[22px]">
                Chaque appartement de la collection est une adresse a part entiere, avec son caractere, son histoire, sa lumiere.
              </p>
            </div>

            <div className="relative h-[350px] overflow-hidden rounded-lg">
              <Image
                src="/images/alto-salon.jpg"
                alt="Interieur Alto"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={85}
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-coffee">
          <div className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
            <p className="text-cream/40 text-xs font-bold uppercase tracking-[0.24px]">Nos valeurs</p>
            <h2 className="text-cream mt-4 text-xl font-bold leading-[1.4] tracking-[-0.4px] md:text-h5 md:tracking-[-0.44px]">
              Ce qui nous guide
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3">
              {VALUES.map((value) => (
                <div key={value.title}>
                  <span className="text-cream/30 text-xs font-bold tabular-nums">{value.number}</span>
                  <h3 className="text-cream mt-2 text-sm font-bold">{value.title}</h3>
                  <p className="text-cream/60 mt-2 text-xs leading-[1.7]">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
          <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">Parcours</p>
          <h2 className="text-coffee mt-1 text-base font-medium leading-[24px]">
            Les etapes qui nous ont construits
          </h2>

          <div className="mt-10 space-y-8">
            {MILESTONES.map((m) => (
              <div key={m.year} className="flex gap-6">
                <span className="text-silver w-12 shrink-0 text-sm font-bold tabular-nums">{m.year}</span>
                <div className="border-divider flex-1 border-t pt-4">
                  <p className="text-coffee text-xs font-medium leading-[22px]">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-sand">
          <div className="mx-auto max-w-content px-gutter py-section text-center md:px-gutter-md">
            <h2 className="text-coffee text-xl font-bold leading-[1.4] tracking-[-0.4px]">
              Envie de decouvrir nos adresses ?
            </h2>
            <p className="text-taupe mx-auto mt-3 max-w-[400px] text-xs font-medium leading-[22px]">
              Parcourez notre collection d'appartements a Paris et Lyon.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button href="/appartements">Voir les appartements</Button>
              <Button href="/contact" variant="outline" className="border-coffee text-coffee">Nous contacter</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
