import { storyblokEditable } from '@storyblok/react/rsc'
import { AboutSection } from '@/components/sections/about-section'
import { ApartmentsSection, getApartmentCards } from '@/components/sections/apartments-section'
import { BlogSection } from '@/components/sections/blog-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { HeroSection } from '@/components/sections/hero-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { getServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { SHARED_TESTIMONIALS_DEFAULTS } from '@/lib/storyblok-testimonials-defaults'

type StoryblokBlok = Record<string, unknown>
type StoryblokEditableBlok = Parameters<typeof storyblokEditable>[0]

const DEFAULTS = {
  heroBackground: '/images/hero-room.webp',
  heroOverlay: '/images/hero-overlay.webp',
  locationAvatars: ['/images/blog-1.jpg', '/images/hero-home.webp', '/images/blog-3.jpg'] as const,
  travelerAvatars: [
    '/images/avatars/voyageur-1.png',
    '/images/avatars/voyageur-2.png',
    '/images/avatars/voyageur-3.png',
  ] as const,
  experience: {
    arrival: '/images/experience-espaces.png',
    checkin: '/images/experience-localisation.png',
    checkout: '/images/experience-confort.webp',
    sustainability: '/images/experience-durabilite.webp',
  },
}

export function HomeHeroStory({ blok }: { blok: StoryblokBlok }) {
  return (
    <div {...editableAttrs(blok)}>
      <HeroSection
        backgroundImage={asset(blok.background_image, DEFAULTS.heroBackground)}
        overlayImage={asset(blok.overlay_image, DEFAULTS.heroOverlay)}
        titleParts={[
          text(blok.title_part_1, 'LIFTED'),
          text(blok.title_part_2, 'MINDFUL'),
          text(blok.title_part_3, 'HOME'),
        ]}
      />
    </div>
  )
}

export function HomeAboutStory({ blok }: { blok: StoryblokBlok }) {
  return (
    <div {...editableAttrs(blok)}>
      <AboutSection
        locationAvatars={[
          asset(blok.location_avatar_1, DEFAULTS.locationAvatars[0]),
          asset(blok.location_avatar_2, DEFAULTS.locationAvatars[1]),
          asset(blok.location_avatar_3, DEFAULTS.locationAvatars[2]),
        ]}
        travelerAvatars={[
          asset(blok.traveler_avatar_1, DEFAULTS.travelerAvatars[0]),
          asset(blok.traveler_avatar_2, DEFAULTS.travelerAvatars[1]),
          asset(blok.traveler_avatar_3, DEFAULTS.travelerAvatars[2]),
        ]}
        copy={{
          kicker: text(blok.kicker, 'Alto, c’est une nouvelle manière de penser l’hospitalité.'),
          quote: text(
            blok.quote,
            'Nous transformons des espaces singuliers en lieux de vie élégants, bien pensés et confortables. Notre mission : permettre aux voyageurs de vivre des séjours sans frictions aux plus belles adresses.',
          ),
          locations: text(blok.locations_label, '13 locations'),
          travelers: text(blok.travelers_label, '4 500+ voyageurs'),
        }}
      />
    </div>
  )
}

export async function HomeApartmentsStory({ blok }: { blok: StoryblokBlok }) {
  const apartments = await getApartmentCards()

  return (
    <div {...editableAttrs(blok)}>
      <ApartmentsSection
        apartments={apartments}
        titles={{
          paris: text(blok.paris_title, 'Nos appartements à Paris'),
          lyon: text(blok.lyon_title, 'Nos appartements à Lyon'),
        }}
      />
    </div>
  )
}

export function HomeExperienceStory({ blok }: { blok: StoryblokBlok }) {
  const panels = bloks(blok.panels)
  const first = panels[0]
  const second = panels[1]
  const third = panels[2]
  const fourth = panels[3]

  return (
    <div {...editableAttrs(blok)}>
      <ExperienceSection
        panelImages={{
          arrival: asset(first?.image, DEFAULTS.experience.arrival),
          checkin: asset(second?.image, DEFAULTS.experience.checkin),
          checkout: asset(third?.image, DEFAULTS.experience.checkout),
          sustainability: asset(fourth?.image, DEFAULTS.experience.sustainability),
        }}
        copy={{
          about: text(blok.label, 'À PROPOS'),
          button: text(blok.button_label, 'En savoir plus'),
          panels: [
            {
              label: text(first?.label, 'Espaces'),
              title: text(
                first?.title,
                'Espaces de charme, singuliers, atypiques, et bien pensés.',
              ),
              editableAttributes: first ? editableAttrs(first) : undefined,
            },
            {
              label: text(second?.label, 'Localisation'),
              title: text(
                second?.title,
                'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
              ),
              editableAttributes: second ? editableAttrs(second) : undefined,
            },
            {
              label: text(third?.label, 'Confort'),
              title: text(
                third?.title,
                'Standards hôteliers. Soin des détails, équipements modernes.',
              ),
              editableAttributes: third ? editableAttrs(third) : undefined,
            },
            {
              label: text(fourth?.label, 'Durabilité'),
              title: text(
                fourth?.title,
                'Matériaux durables et sourcés. Vigilance sur l’impact des installations.',
              ),
              editableAttributes: fourth ? editableAttrs(fourth) : undefined,
            },
          ],
        }}
      />
    </div>
  )
}

export function HomeTestimonialsStory({ blok }: { blok: StoryblokBlok }) {
  const items = bloks(blok.items)
  const testimonials = items.length > 0 ? items : defaultTestimonials()

  return (
    <div {...editableAttrs(blok)}>
      <TestimonialsSection
        copy={{
          title: text(blok.title, 'Témoignages'),
          items: testimonials.map((item) => ({
            quote: text(item.quote, ''),
            name: text(item.name, ''),
            apartment: text(item.apartment, ''),
            stay: text(item.stay, ''),
            editableAttributes: editableAttrs(item),
          })),
        }}
      />
    </div>
  )
}

export function HomeServicesStory({ blok }: { blok: StoryblokBlok }) {
  const items = bloks(blok.items)
  const services = items.length > 0 ? items : defaultServices()

  return (
    <div {...editableAttrs(blok)}>
      <ServicesSection
        services={services.map((item) => ({
          title: text(item.title, ''),
          description: text(item.description, ''),
          icon: asset(item.icon, '/images/icons/checkin.svg'),
          editableAttributes: editableAttrs(item),
        }))}
      />
    </div>
  )
}

export async function HomeBlogStory({ blok }: { blok: StoryblokBlok }) {
  const locale = await getServerLocale()
  const articles = await getBlogArticles(locale)

  return (
    <div {...editableAttrs(blok)}>
      <BlogSection
        articles={articles}
        copy={{
          previous: text(blok.previous_label, 'Précédent'),
          next: text(blok.next_label, 'Suivant'),
          description: text(
            blok.description,
            'Depuis 2017, nous accompagnons les voyageurs pour qu’ils vivent des expériences inoubliables aux plus belles adresses.',
          ),
          button: text(blok.button_label, 'Tous nos conseils'),
          fallbackSubtitle: text(
            blok.fallback_subtitle,
            'Un quartier vivant, une adresse au cœur des plus beaux quartiers.',
          ),
          readingTime: text(blok.reading_time, '5 min de lecture'),
        }}
      />
    </div>
  )
}

function editableAttrs(blok: StoryblokBlok) {
  return storyblokEditable(blok as StoryblokEditableBlok)
}

function text(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function bloks(value: unknown): StoryblokBlok[] {
  return Array.isArray(value) ? value.filter(isBlok) : []
}

function isBlok(value: unknown): value is StoryblokBlok {
  return Boolean(value && typeof value === 'object')
}

function asset(value: unknown, fallback: string) {
  if (typeof value === 'string' && value.trim()) return normalizeAssetUrl(value) ?? fallback
  if (!isBlok(value)) return fallback

  const filename = value.filename
  const url = value.url
  if (typeof filename === 'string') return normalizeAssetUrl(filename) ?? fallback
  if (typeof url === 'string') return normalizeAssetUrl(url) ?? fallback

  return fallback
}

function normalizeAssetUrl(value: string | null | undefined) {
  if (!value) return null
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('https://s3.amazonaws.com/a.storyblok.com/')) {
    return value.replace('https://s3.amazonaws.com/a.storyblok.com/', 'https://a.storyblok.com/')
  }
  return value
}

function defaultTestimonials(): StoryblokBlok[] {
  return SHARED_TESTIMONIALS_DEFAULTS.map((testimonial) => ({ ...testimonial }))
}

function defaultServices(): StoryblokBlok[] {
  return [
    {
      title: 'Self check-in',
      description: 'Accès autonome à toute heure, sans attente ni comptoir.',
      icon: '/images/icons/checkin.svg',
    },
    {
      title: 'Ménage',
      description: 'Linge de maison inclus, ménage professionnel entre chaque séjour.',
      icon: '/images/icons/cleaning.svg',
    },
    {
      title: 'Assistance de 8 h à 20 h',
      description:
        'Notre équipe est disponible tous les jours de 8 h à 20 h pour vous accompagner.',
      icon: '/images/icons/support.svg',
    },
    {
      title: 'Pas de frais cachés',
      description: 'Prix nets, sans surprise. Ce que vous voyez est ce que vous payez.',
      icon: '/images/icons/wallet.svg',
    },
  ]
}
