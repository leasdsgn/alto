import Image from 'next/image'
import { Header } from '@/components/layout/header'

const HERO_STATS = [
  {
    label: '13 locations',
    type: 'images' as const,
    items: [
      { src: '/images/blog-1.jpg', alt: 'Appartement Alto à Paris' },
      { src: '/images/hero-home.jpg', alt: 'Appartement Alto à Lyon' },
      { src: '/images/blog-3.jpg', alt: 'Séjour Alto' },
    ],
  },
  {
    label: '4500+ voyageurs',
    type: 'images' as const,
    items: [
      { src: '/images/avatars/voyageur-1.png', alt: 'Voyageuse Alto' },
      { src: '/images/avatars/voyageur-2.png', alt: 'Voyageur Alto' },
      { src: '/images/avatars/voyageur-3.png', alt: 'Cliente Alto' },
    ],
  },
  {
    label: '4,9 de note moyenne',
    type: 'badges' as const,
    items: [
      { label: 'B', bgClass: 'bg-[#003580]', textClass: 'text-cream' },
      { label: 'TA', bgClass: 'bg-[#00af87]', textClass: 'text-cream' },
      { label: 'A', bgClass: 'bg-[#ff5a5f]', textClass: 'text-cream' },
    ],
  },
]

const SERVICE_CARDS = [
  {
    title: 'Self checkin',
    description: 'Arrivez quand vous voulez, et repartez quand vous voulez, comme à la maison.',
    icon: '/images/icons/checkin.svg',
  },
  {
    title: 'Ménage',
    description: 'Des standards de ménage professionnels pour des appartements immaculés.',
    icon: '/images/icons/cleaning.svg',
  },
  {
    title: 'Support 24/24',
    description: 'Nous restons joignables 24h sur 24 pour vous assister en cas de problème.',
    icon: '/images/icons/support.svg',
  },
  {
    title: 'Pas de frais cachés',
    description: 'Pas de frais de réservation cachés ni de frais de plateformes sur notre site.',
    icon: '/images/icons/wallet.svg',
  },
]

const HOUSING_CRITERIA = [
  {
    label: 'Espaces',
    text: 'Espaces de charme, singuliers, atypiques. Exit les coquilles vides.',
  },
  {
    label: 'Localisation',
    text: 'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
  },
  {
    label: 'Confort',
    text: 'Standards hôteliers. Soin des détails, équipements modernes.',
  },
  {
    label: 'Durabilité',
    text: 'Matériaux durables et sourcés. Vigilance sur l’impact des installations.',
  },
]

const FOUNDERS = [
  {
    name: 'Paul Borie',
    role: 'Head of Design & Co-Founder',
    image: '/images/about/founder-paul.jpg',
    alt: 'Portrait de Paul Borie',
  },
  {
    name: 'Mayeul Desombre',
    role: 'COO & Co-Founder',
    image: '/images/about/founder-mayeul.jpg',
    alt: 'Portrait de Mayeul Desombre',
  },
  {
    name: 'Benjamin Farhi',
    role: 'CEO & Co-Founder',
    image: '/images/about/founder-benjamin.jpg',
    alt: 'Portrait de Benjamin Farhi',
  },
]

export function AboutView() {
  return (
    <>
      <section className="from-silver to-taupe relative overflow-hidden bg-gradient-to-r pt-28 pb-14 md:pt-36 md:pb-20 lg:pt-40 lg:pb-24">
        <Header variant="light" />

        <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
          <div className="mx-auto max-w-[790px] text-center">
            <p className="text-cream text-body">
              Alto, c’est une nouvelle manière de penser l’hospitalité.
            </p>
            <h1 className="text-cream text-h3 md:text-h2 mt-6">
              Nous transformons des espaces singuliers en lieux de vie élégants, bien pensés et
              confortables. Notre mission&nbsp;: permettre aux voyageurs de vivre des séjours sans
              frictions aux plus belles adresses.
            </h1>
          </div>

          <div className="mx-auto mt-10 grid max-w-[780px] gap-3 md:grid-cols-3 md:gap-4">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-taupe flex min-h-[109px] flex-col items-center justify-center gap-3 rounded-lg px-6 py-5 text-center"
              >
                <div className="flex -space-x-4">
                  {stat.type === 'images'
                    ? stat.items.map((item) => (
                        <div
                          key={item.alt}
                          className="border-cream relative size-9 overflow-hidden rounded-full border-2"
                        >
                          <Image
                            src={item.src}
                            alt={item.alt}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                      ))
                    : stat.items.map((item) => (
                        <div
                          key={item.label}
                          className={`${item.bgClass} ${item.textClass} border-cream flex size-9 items-center justify-center rounded-full border-2 text-[11px] font-bold uppercase`}
                        >
                          {item.label}
                        </div>
                      ))}
                </div>

                <p className="text-cream text-body-xl font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="bg-cream">
        <section className="py-section md:py-section-md">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
            <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
              Le concept
            </p>

            <div className="mt-4 grid items-start gap-10 lg:grid-cols-[0.75fr_1fr] lg:gap-12">
              <div className="max-w-[390px] space-y-8">
                <h2 className="text-coffee text-h2">
                  Concilier la flexibilité de la location courte durée, avec les normes hôtellières.
                </h2>

                <div className="space-y-6">
                  <p className="text-coffee text-body-xl font-semibold">
                    Nous réunissons le meilleur des deux mondes dans des appartements qui sont à la
                    fois flexibles et pensés pour répondre à des exigences de confort élevées.
                  </p>
                  <p className="text-coffee text-body-xl font-semibold">
                    Nous choisissons des lieux que nous allons transformer avec l’idée ALTO en tête.
                    Cela nous permet d’avoir le contrôle sur la conception et de ne faire aucun
                    compromis sur la qualité des installations.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ImageHighlightCard
                  image="/images/about/concept-lounge.jpg"
                  alt="Salle à manger lumineuse Alto"
                  caption="Propreté, confort et intelligence de conception."
                />
                <ImageHighlightCard
                  image="/images/about/concept-corridor.jpg"
                  alt="Couloir d’un appartement Alto"
                  caption="Check-in et check-out autonome et flexible. Tranquillité et discrétion."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pb-section md:pb-section-md">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
            <div className="space-y-10">
              <div className="lg:max-w-[790px]">
                <h2 className="text-coffee text-h2">
                  Avez-vous déjà été surpris de la différence entre les photos et la réalité&nbsp;?
                </h2>
              </div>

              <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                <div className="order-2 grid gap-4 sm:grid-cols-2 lg:order-1">
                  <SimpleImageCard
                    image="/images/about/concept-lounge.jpg"
                    alt="Détail d’un intérieur Alto"
                  />
                  <SimpleImageCard
                    image="/images/about/concept-corridor.jpg"
                    alt="Circulation intérieure Alto"
                  />
                </div>

                <div className="order-1 max-w-[475px] space-y-6 lg:order-2 lg:justify-self-end">
                  <p className="text-coffee text-body-xl font-semibold">
                    Installations vieillissantes, problèmes d’isolation, voisins bruyants, taille du
                    logement surprenante. Vous l’avez vécu, sans doute, comme énormément de
                    voyageurs qui font confiance aux nouvelles plateformes de location courte durée.
                  </p>

                  <p className="text-coffee text-body-xl font-semibold">
                    La marque ALTO, c’est tout l’inverse. Vous allez être surpris, oui, mais dans le
                    bon sens. Nos appartements sont calibrés pour les besoins de voyageurs comme
                    vous. Vous voyagez pour vivre des expériences, pas pour gérer des problèmes de
                    logistique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-section md:pb-section-md">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
            <div className="mx-auto max-w-[790px] text-center">
              <h2 className="text-coffee text-h2">Le service ALTO</h2>
              <p className="text-taupe text-body-xl mt-2 font-semibold">
                Comme à l’hôtel, en mieux.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {SERVICE_CARDS.map((service) => (
                <div
                  key={service.title}
                  className="bg-ash/10 flex flex-col items-center rounded-lg px-7 py-8 text-center"
                >
                  <div className="relative size-12">
                    <Image src={service.icon} alt="" fill sizes="48px" className="object-contain" />
                  </div>
                  <h3 className="text-coffee text-body-sm mt-6 font-semibold">{service.title}</h3>
                  <p className="text-coffee/75 text-body-sm mt-3">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-section md:pb-section-md">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
            <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1fr] lg:gap-12">
              <div className="max-w-[570px] space-y-6">
                <h2 className="text-coffee text-h3">
                  Les logements ALTO se sont battus pour leur place.
                </h2>
                <p className="text-coffee text-body-xl font-semibold">
                  Quand nous explorons un projet de conception ALTO, nous avons une longue liste de
                  critères à respecter pour garantir notre standard de qualité.
                </p>
              </div>

              <div className="space-y-4">
                {HOUSING_CRITERIA.map((criterion) => (
                  <div key={criterion.label} className="bg-ash/10 rounded-lg px-6 py-6 md:px-8">
                    <p className="text-taupe/70 text-h6 opacity-70">{criterion.label}</p>
                    <p className="text-taupe text-h5 mt-4">{criterion.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="from-silver to-taupe py-section md:py-section-md bg-gradient-to-r">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
            <h2 className="text-cream text-h2">Passionnés par l’hospitalité</h2>

            <div className="mt-10 grid items-start gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
              <div className="max-w-[400px] space-y-6">
                <p className="text-cream text-h4">
                  Associés depuis toujours, l’équipe ALTO a toujours suivi la même ligne
                  directrice&nbsp;: imaginer l’hospitalité de demain.
                </p>

                <p className="text-cream text-body-xl font-semibold">
                  À la sortie de leurs études à l’École Hôtelière de Lausanne, Mayeul et Benjamin
                  créent ExtrasMe, une plateforme de mise en relation entre extras et professionnels
                  de l’industrie hôtelière.
                  <br />
                  <br />
                  Plus tard rejoints par Paul, les associés attirent l’attention des grands du
                  secteur et confient la gestion de leur projet à l’EHL pour se concentrer sur leur
                  nouvelle aventure.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {FOUNDERS.map((founder) => (
                  <div key={founder.name} className="space-y-4">
                    <div className="bg-cream/10 relative aspect-[229/299] overflow-hidden rounded-lg">
                      <Image
                        src={founder.image}
                        alt={founder.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-cream text-body-xl font-semibold">{founder.name}</p>
                      <p className="text-cream/70 text-body-sm mt-1">{founder.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
              <div className="bg-cream/10 border-cream/10 flex min-h-64 items-center justify-center rounded-lg border">
                <Image
                  src="/images/logo-alto-light.png"
                  alt="Logo Alto"
                  width={160}
                  height={42}
                  className="opacity-40"
                />
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <p className="text-cream text-body-xl font-semibold">
                  Le secteur de la location courte durée a lui aussi besoin de renouveau et de
                  nouvelles idées.
                  <br />
                  <br />
                  Le concept est simple&nbsp;: amener leur culture du prestige et de l’excellence à
                  un milieu aux standards de qualité parfois inconsistants.
                </p>

                <p className="text-cream text-h4">
                  L’objectif final reste le même, réinventer l’hospitalité sans compromettre
                  l’expérience des voyageurs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function ImageHighlightCard({
  image,
  alt,
  caption,
}: {
  image: string
  alt: string
  caption: string
}) {
  return (
    <div className="relative aspect-[389/614] overflow-hidden rounded-lg">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
      <div className="bg-taupe/65 absolute inset-0" />
      <div className="absolute inset-x-5 bottom-5">
        <p className="text-cream text-body-sm">{caption}</p>
      </div>
    </div>
  )
}

function SimpleImageCard({ image, alt }: { image: string; alt: string }) {
  return (
    <div className="relative aspect-[295/387] overflow-hidden rounded-lg">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 25vw"
        className="object-cover"
      />
      <div className="bg-taupe/65 absolute inset-0" />
    </div>
  )
}
