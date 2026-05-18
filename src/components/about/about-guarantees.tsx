'use client'

import Image from 'next/image'
import { useId, useState } from 'react'
import { useLocale } from '@/components/providers/locale-provider'

interface AboutGuaranteesProps {
  image: string
}

export function AboutGuarantees({ image }: AboutGuaranteesProps) {
  const locale = useLocale()
  const copy = GUARANTEES_COPY[locale]
  const guarantees = copy.items
  const [activeIndex, setActiveIndex] = useState(0)
  const activeGuarantee = guarantees[activeIndex]
  const tabsetId = useId()
  const panelId = `${tabsetId}-panel`

  return (
    <section className="pb-14 md:pb-20 lg:pb-24">
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto grid gap-10 xl:grid-cols-[367px_367px_1fr] xl:items-start xl:gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-coffee text-h4">{copy.title}</h2>
            <p className="text-coffee text-body">{copy.description}</p>
          </div>

          <div role="tablist" aria-label={copy.ariaLabel} className="space-y-2">
            {guarantees.map((guarantee, index) => {
              const isActive = index === activeIndex
              const tabId = `${tabsetId}-tab-${index}`

              return (
                <button
                  key={guarantee.label}
                  id={tabId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={panelId}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full rounded-sm px-6 py-3 text-left transition-colors ${
                    isActive ? 'bg-ash/50 text-cream' : 'bg-ash/10 text-ash'
                  }`}
                >
                  <span className="text-h4 font-medium tracking-[-0.24px]">{guarantee.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-lg xl:min-h-[550px]">
          <Image
            src={image}
            alt={copy.imageAlt}
            fill
            sizes="(max-width: 1280px) 100vw, 367px"
            className="object-cover"
          />
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${tabsetId}-tab-${activeIndex}`}
          className="space-y-6 xl:pt-2"
        >
          <h3 className="text-coffee text-h4">{activeGuarantee.title}</h3>

          <div className="space-y-4">
            {activeGuarantee.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-coffee text-body">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const GUARANTEES_COPY = {
  fr: {
    title: 'Les garanties Alto',
    description:
      'Concevoir un lieu de vie Alto ne s’improvise pas. Nous suivons des principes fondateurs précis et ne dérogeons jamais à la règle.',
    ariaLabel: 'Garanties Alto',
    imageAlt: 'Visuel des garanties Alto',
    items: [
      {
        label: 'Espaces',
        title: 'Espaces de charme, singuliers, atypiques, et bien pensés.',
        paragraphs: [
          'Chaque lieu possède sa propre identité, son rythme et ses particularités.',
          'Alto sélectionne et transforme des espaces avec une attention particulière portée aux volumes, à la circulation, à la lumière et aux usages afin de créer des environnements équilibrés, chaleureux et naturellement agréables à habiter.',
        ],
      },
      {
        label: 'Localisation',
        title: 'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
        paragraphs: [
          'Au cœur des centres-villes vivants comme dans des lieux plus confidentiels, chaque adresse est choisie pour la qualité de son environnement, sa cohérence architecturale et son ancrage local.',
          'Alto privilégie des emplacements qui permettent de découvrir une ville avec fluidité, proximité et liberté de mouvement.',
        ],
      },
      {
        label: 'Confort',
        title: 'Standards hôteliers. Soin des détails, équipements modernes.',
        paragraphs: [
          'Chaque espace est pensé pour offrir une expérience simple, confortable et cohérente.',
          'Literie de qualité, équipements modernes, autonomie d’usage, arrivée fluide et attention portée aux détails du quotidien participent à créer un cadre rassurant, fonctionnel et agréable à vivre dès les premiers instants.',
        ],
      },
      {
        label: 'Durabilité',
        title: 'Matériaux durables et sourcés. Vigilance sur l’impact des installations.',
        paragraphs: [
          'Les choix d’aménagement et de rénovation s’inscrivent dans une logique de consommation raisonnée.',
          'Alto privilégie des matériaux durables, des équipements réemployés lorsque cela est pertinent, ainsi que des solutions techniques visant à améliorer l’efficacité énergétique et la qualité des espaces dans le temps.',
        ],
      },
    ],
  },
  en: {
    title: 'The Alto guarantees',
    description:
      'Designing an Alto place is never improvised. Every address follows a clear set of principles.',
    ariaLabel: 'Alto guarantees',
    imageAlt: 'Alto guarantee visual',
    items: [
      {
        label: 'Spaces',
        title: 'Charming, distinctive, atypical, and carefully designed spaces.',
        paragraphs: [
          'Every place has its own identity, pace, and details.',
          'Alto selects and transforms spaces with close attention to volumes, circulation, light, and everyday use so each apartment feels balanced and comfortable.',
        ],
      },
      {
        label: 'Location',
        title: 'Good addresses. At the heart of the action or away from the expected path.',
        paragraphs: [
          'From lively city centers to more discreet locations, each address is chosen for its surroundings, architectural coherence, and local connection.',
          'Alto favors places that make it easy to move through the city and experience it freely.',
        ],
      },
      {
        label: 'Comfort',
        title: 'Hotel standards. Attention to detail and modern amenities.',
        paragraphs: [
          'Every space is designed to provide a simple, comfortable, coherent experience.',
          'Quality bedding, modern amenities, autonomous access, and everyday details create a reassuring setting from the moment guests arrive.',
        ],
      },
      {
        label: 'Sustainability',
        title: 'Durable, sourced materials. Careful attention to installation impact.',
        paragraphs: [
          'Renovation and furnishing choices follow a considered approach to consumption.',
          'Alto favors durable materials, reused equipment when relevant, and technical solutions that improve energy efficiency and long-term quality.',
        ],
      },
    ],
  },
} as const
