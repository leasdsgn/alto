'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AboutGuarantees } from '@/components/about/about-guarantees'
import { Header } from '@/components/layout/header'
import { useLocale } from '@/components/providers/locale-provider'
import { BrandKickerText } from '@/components/ui/brand-kicker-text'
import type { SiteImages } from '@/lib/storyblok-site-images'

interface AboutViewProps {
  siteImages: SiteImages
}

const ABOUT_HERO_IMAGE = '/images/about/about-hero.webp'

export function AboutView({ siteImages }: AboutViewProps) {
  const locale = useLocale()
  const copy = ABOUT_VIEW_COPY[locale]
  const heroImage = getAboutHeroImage(siteImages.about.conceptLounge)

  const heroStats = [
    {
      label: copy.stats.locations,
      type: 'avatars' as const,
      items: [
        { src: siteImages.shared.locationAvatars[0], alt: copy.stats.locationAlts[0] },
        { src: siteImages.shared.locationAvatars[1], alt: copy.stats.locationAlts[1] },
        { src: siteImages.shared.locationAvatars[2], alt: copy.stats.locationAlts[2] },
      ],
    },
    {
      label: copy.stats.travelers,
      type: 'avatars' as const,
      items: [
        { src: siteImages.shared.travelerAvatars[0], alt: copy.stats.travelerAlts[0] },
        { src: siteImages.shared.travelerAvatars[1], alt: copy.stats.travelerAlts[1] },
        { src: siteImages.shared.travelerAvatars[2], alt: copy.stats.travelerAlts[2] },
      ],
    },
    {
      label: copy.stats.rating,
      type: 'platforms' as const,
      items: [
        { label: 'B', className: 'bg-[#003580] text-cream' },
        { label: 'TA', className: 'bg-[#00AF87] text-cream' },
        { label: 'A', className: 'bg-[#FF5A5F] text-cream' },
      ],
    },
  ]

  const founders = [
    {
      name: 'Paul Borie',
      role: copy.team.founders.paul.role,
      image: siteImages.about.founders.paul,
      alt: copy.team.founders.paul.alt,
    },
    {
      name: 'Mayeul Desombre',
      role: copy.team.founders.mayeul.role,
      image: siteImages.about.founders.mayeul,
      alt: copy.team.founders.mayeul.alt,
    },
    {
      name: 'Benjamin Farhi',
      role: copy.team.founders.benjamin.role,
      image: siteImages.about.founders.benjamin,
      alt: copy.team.founders.benjamin.alt,
    },
  ]

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #948174 0%, #625143 100%)' }}
      >
        <Header variant="light" />

        <div className="grid min-h-[758px] lg:grid-cols-[minmax(520px,720px)_1fr]">
          <div className="relative min-h-[360px] overflow-hidden lg:min-h-[758px]">
            <Image
              src={heroImage}
              alt={copy.hero.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover"
            />
          </div>

          <div className="px-gutter md:px-gutter-md flex items-center pt-28 pb-12 md:pt-36 md:pb-16">
            <div className="max-w-[586px]">
              <p className="text-cream text-body">
                <BrandKickerText value={copy.hero.kicker} />
              </p>
              <h1 className="text-cream text-h3 md:text-h2 mt-6">{copy.hero.title}</h1>
              <p className="text-cream/90 text-body mt-8 max-w-[477px]">{copy.hero.body}</p>

              <div className="mt-12 grid gap-3 md:max-w-[567px] md:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-taupe flex min-h-20 flex-col items-center justify-center gap-2 rounded-lg px-4 py-4 text-center"
                  >
                    <div className="flex -space-x-2">
                      {stat.type === 'avatars'
                        ? stat.items.map((item) => (
                            <div
                              key={item.alt}
                              className="border-cream relative size-6 overflow-hidden rounded-full border"
                            >
                              <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                sizes="24px"
                                className="object-cover"
                              />
                            </div>
                          ))
                        : stat.items.map((item) => (
                            <div
                              key={item.label}
                              className={`${item.className} border-cream flex size-6 items-center justify-center rounded-full border text-[9px] font-bold uppercase`}
                            >
                              {item.label}
                            </div>
                          ))}
                    </div>

                    <p className="text-cream text-body whitespace-nowrap">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-cream">
        <section className="py-14 md:py-20 lg:py-24">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto grid items-start gap-8 lg:grid-cols-2">
            <h2 className="text-coffee text-h3 md:text-h2 max-w-[598px]">{copy.reality.title}</h2>

            <div className="max-w-[598px] space-y-4">
              {copy.reality.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-coffee text-body">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20 lg:py-24">
          <div className="bg-ash/10">
            <div className="max-w-content px-gutter md:px-gutter-md mx-auto py-14 md:py-20">
              <div className="grid items-end gap-8 lg:grid-cols-[310px_1fr] lg:gap-12">
                <h2 className="text-coffee text-h3">{copy.service.title}</h2>
                <p className="text-coffee text-body-xl max-w-[801px] font-semibold">
                  {copy.service.body}
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {copy.service.cards.map((service) => (
                  <ServiceCard key={service.title} {...service} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pb-14 md:pb-20 lg:pb-24">
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto grid gap-10 xl:grid-cols-[minmax(0,1fr)_385px] xl:gap-12">
            <div className="flex flex-col gap-10 xl:min-h-[550px] xl:justify-between">
              <h2 className="text-coffee text-h3 md:text-h2 max-w-[691px]">{copy.concept.title}</h2>

              <div className="grid gap-8 md:grid-cols-2">
                {copy.concept.points.map((point) => (
                  <ConceptPoint key={point.title} {...point} />
                ))}
              </div>
            </div>

            <div className="relative min-h-[360px] overflow-hidden rounded-lg xl:min-h-[550px]">
              <Image
                src={siteImages.about.conceptChair}
                alt={copy.concept.imageAlt}
                fill
                sizes="(max-width: 1280px) 100vw, 385px"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <AboutGuarantees image={siteImages.about.conceptCorridor} />

        <section
          className="py-14 md:py-20 lg:py-24"
          style={{ background: 'linear-gradient(90deg, #948174 0%, #625143 100%)' }}
        >
          <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
            <p className="text-cream/80 text-overline tracking-[0.24px] uppercase">
              {copy.team.eyebrow}
            </p>
            <h2 className="text-cream text-h3 md:text-h2 mt-3">{copy.team.title}</h2>

            <div className="mt-10 grid gap-10 xl:grid-cols-[395px_1fr] xl:items-end">
              <div className="flex h-full flex-col justify-between gap-8">
                <p className="text-cream text-h4">{copy.team.body}</p>

                <Link
                  href="/contact"
                  className="border-cream text-cream hover:bg-cream hover:text-coffee inline-flex h-[50px] items-center justify-center self-start rounded-full border px-8 text-sm leading-[1.5] transition-colors"
                >
                  {copy.team.link}
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {founders.map((founder) => (
                  <FounderCard key={founder.name} {...founder} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

function getAboutHeroImage(value: string) {
  if (!value || value.includes('concept-lounge')) return ABOUT_HERO_IMAGE
  return value
}

const ABOUT_VIEW_COPY = {
  fr: {
    hero: {
      imageAlt: 'Salle à manger Alto',
      kicker: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
      title: 'Nous transformons des espaces singuliers en lieux de vie designés et bien pensés.',
      body: 'Notre mission : offrir aux voyageurs une expérience digne des plus grands hôtels, avec la flexibilité et la liberté d’une location personnelle.',
    },
    stats: {
      locations: '13 locations',
      travelers: '4 500+ voyageurs',
      rating: '4,9 de note moyenne',
      locationAlts: ['Appartement Alto à Paris', 'Appartement Alto à Lyon', 'Séjour Alto'],
      travelerAlts: ['Voyageuse Alto', 'Voyageur Alto', 'Cliente Alto'],
    },
    reality: {
      title: 'Avez-vous déjà été surpris par la différence entre les photos et la réalité ?',
      paragraphs: [
        'Installations vieillissantes, problèmes d’isolation, voisins bruyants, taille du logement surprenante. Vous l’avez vécu, sans doute, comme énormément de voyageurs qui font confiance aux nouvelles plateformes de location courte durée.',
        'En choisissant un logement ALTO vous allez être surpris, oui, mais dans le bon sens du terme.',
      ],
    },
    service: {
      title: 'Le service ALTO',
      body: 'Nos appartements sont calibrés pour les besoins de voyageurs comme vous. Vous voyagez pour vivre des expériences, pas pour gérer des problèmes de logistique.',
      cards: [
        {
          title: 'Self check-in',
          description:
            'Arrivez quand vous voulez, et repartez quand vous voulez, comme à la maison.',
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
          description:
            'Pas de frais de réservation cachés ni de frais de plateforme sur notre site.',
          icon: '/images/icons/wallet.svg',
        },
      ],
    },
    concept: {
      title: 'Concilier la flexibilité de la location courte durée, avec les normes hôtelières.',
      imageAlt: 'Intérieur Alto',
      points: [
        {
          title: 'Qualité et design',
          description:
            'Nous réunissons le meilleur des deux mondes dans des appartements qui sont à la fois flexibles et qui répondent à des exigences de confort élevées.',
        },
        {
          title: 'Sans compromis',
          description:
            'Tout est pensé avec soin pour accueillir dans les meilleures conditions, sans retenue sur les moyens.',
        },
      ],
    },
    team: {
      eyebrow: 'Meet the team',
      title: 'Passionnés par l’hospitalité',
      body: 'Associés depuis toujours, l’équipe ALTO a toujours suivi la même ligne directrice : imaginer l’hospitalité de demain.',
      link: 'En savoir plus',
      founders: {
        paul: {
          role: 'Head of Design & Co-Founder',
          alt: 'Portrait de Paul Borie',
        },
        mayeul: {
          role: 'COO & Co-Founder',
          alt: 'Portrait de Mayeul Desombre',
        },
        benjamin: {
          role: 'CEO & Co-Founder',
          alt: 'Portrait de Benjamin Farhi',
        },
      },
    },
  },
  en: {
    hero: {
      imageAlt: 'Alto dining room',
      kicker: 'Alto is a new way to think about hospitality.',
      title: 'We turn distinctive spaces into considered, well-designed places to stay.',
      body: 'Our mission: giving travelers a hotel-level experience with the flexibility and freedom of a private rental.',
    },
    stats: {
      locations: '13 locations',
      travelers: '4,500+ guests',
      rating: '4.9 average rating',
      locationAlts: ['Alto apartment in Paris', 'Alto apartment in Lyon', 'Alto stay'],
      travelerAlts: ['Alto guest', 'Alto traveler', 'Alto customer'],
    },
    reality: {
      title: 'Have you ever been surprised by the gap between the photos and reality?',
      paragraphs: [
        'Ageing fixtures, poor insulation, noisy neighbors, unexpected apartment sizes. Many travelers have had that experience when booking short-stay rentals.',
        'With ALTO, the surprise should go the other way: the apartment feels better than expected.',
      ],
    },
    service: {
      title: 'The ALTO service',
      body: 'Our apartments are calibrated for travelers who want to enjoy the city, not manage logistics.',
      cards: [
        {
          title: 'Self check-in',
          description: 'Arrive when you want, leave when you want, just like at home.',
          icon: '/images/icons/checkin.svg',
        },
        {
          title: 'Cleaning',
          description: 'Professional cleaning standards for spotless apartments.',
          icon: '/images/icons/cleaning.svg',
        },
        {
          title: '24/7 support',
          description: 'We remain reachable around the clock if you need help.',
          icon: '/images/icons/support.svg',
        },
        {
          title: 'No hidden fees',
          description: 'No hidden booking fees or platform fees when booking through our site.',
          icon: '/images/icons/wallet.svg',
        },
      ],
    },
    concept: {
      title: 'Combining short-stay flexibility with hotel standards.',
      imageAlt: 'Alto interior',
      points: [
        {
          title: 'Quality and design',
          description:
            'We combine flexibility with a high level of comfort in apartments designed for real daily use.',
        },
        {
          title: 'No compromise',
          description:
            'Every choice is made with care so guests can arrive in the right conditions from the first minute.',
        },
      ],
    },
    team: {
      eyebrow: 'Meet the team',
      title: 'Driven by hospitality',
      body: 'The ALTO team follows one clear direction: imagining what hospitality can become.',
      link: 'Learn more',
      founders: {
        paul: {
          role: 'Head of Design & Co-Founder',
          alt: 'Portrait of Paul Borie',
        },
        mayeul: {
          role: 'COO & Co-Founder',
          alt: 'Portrait of Mayeul Desombre',
        },
        benjamin: {
          role: 'CEO & Co-Founder',
          alt: 'Portrait of Benjamin Farhi',
        },
      },
    },
  },
} as const

function ServiceCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div
      className="flex flex-col items-center rounded-lg px-7 py-8 text-center"
      style={{ background: 'linear-gradient(90deg, #948174 0%, #625143 100%)' }}
    >
      <div className="relative size-12">
        <Image src={icon} alt="" fill sizes="48px" className="object-contain brightness-0 invert" />
      </div>
      <h3 className="text-cream text-body-xl mt-5 font-semibold">{title}</h3>
      <p className="text-cream/85 text-body-sm mt-3">{description}</p>
    </div>
  )
}

function ConceptPoint({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-ash/10 flex size-12 items-center justify-center rounded-full">
        <ArrowOutward className="text-coffee size-4" />
      </div>
      <div className="space-y-4">
        <h3 className="text-coffee text-h4">{title}</h3>
        <p className="text-coffee text-body">{description}</p>
      </div>
    </div>
  )
}

function FounderCard({
  name,
  role,
  image,
  alt,
}: {
  name: string
  role: string
  image: string
  alt: string
}) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-[229/299] overflow-hidden rounded-lg">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 229px"
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-cream text-body-xl font-semibold">{name}</p>
        <p className="text-cream/80 text-body-sm mt-1">{role}</p>
      </div>
    </div>
  )
}

function ArrowOutward({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 11 11 3M11 3H5M11 3v6" />
    </svg>
  )
}
