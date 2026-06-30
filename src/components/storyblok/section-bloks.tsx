'use client'

import { storyblokEditable } from '@storyblok/react/rsc'
import { AboutSection } from '@/components/sections/about-section'
import { BlogSection } from '@/components/sections/blog-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { HeroSection } from '@/components/sections/hero-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import {
  useSharedAssetsGlobals,
  useSharedTestimonialsGlobals,
} from '@/components/providers/storyblok-globals-provider'
import { assetUrl, bloksOf, linkHref, textOr, type StoryblokLinkField } from '@/lib/storyblok-asset'
import { PLACEHOLDER_IMAGE } from '@/lib/storyblok-defaults'
import type { BlogArticle } from '@/lib/blog-data'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

const TITLE_DEFAULTS = ['LIFTED', 'MINDFUL', 'HOME'] as const

export function HeroSectionBlok({ blok }: { blok: Blok }) {
  const mode = textOr(blok.title_mode, 'simple')
  const titleParts =
    mode === 'parts'
      ? ([
          textOr(blok.title_part_1, TITLE_DEFAULTS[0]),
          textOr(blok.title_part_2, TITLE_DEFAULTS[1]),
          textOr(blok.title_part_3, TITLE_DEFAULTS[2]),
        ] as const)
      : ([textOr(blok.title, TITLE_DEFAULTS[0]), TITLE_DEFAULTS[1], TITLE_DEFAULTS[2]] as const)

  return (
    <div {...editable(blok)}>
      <HeroSection
        backgroundImage={assetUrl(blok.background_image, PLACEHOLDER_IMAGE)}
        overlayImage={assetUrl(blok.overlay_image, '/images/hero-overlay.webp')}
        titleParts={titleParts}
      />
    </div>
  )
}

export function HomeAboutSectionBlok({ blok }: { blok: Blok }) {
  const sharedAssets = useSharedAssetsGlobals()
  return (
    <div {...editable(blok)}>
      <AboutSection
        locationAvatars={sharedAssets.locationAvatars.map((avatar) => avatar.src)}
        travelerAvatars={sharedAssets.travelerAvatars.map((avatar) => avatar.src)}
        copy={{
          kicker: textOr(blok.kicker, 'Alto, c’est une nouvelle manière de penser l’hospitalité.'),
          quote: textOr(
            blok.quote,
            'Nous transformons des espaces singuliers en lieux de vie élégants, bien pensés et confortables. Notre mission : permettre aux voyageurs de vivre des séjours sans frictions aux plus belles adresses.',
          ),
          locations: textOr(blok.locations_label, '13 locations'),
          travelers: textOr(blok.travelers_label, '4 500+ voyageurs'),
          rating: textOr(blok.rating_label, '4,9 de note moyenne'),
        }}
      />
    </div>
  )
}

export function PanelsSectionBlok({ blok }: { blok: Blok }) {
  const panels = bloksOf<{ image?: unknown; label?: unknown; title?: unknown }>(blok.panels)
  const [first, second, third, fourth] = panels

  return (
    <div {...editable(blok)}>
      <ExperienceSection
        panelImages={{
          arrival: assetUrl(first?.image, '/images/experience-espaces.png'),
          checkin: assetUrl(second?.image, '/images/experience-localisation.png'),
          checkout: assetUrl(third?.image, '/images/experience-confort.webp'),
          sustainability: assetUrl(fourth?.image, '/images/experience-durabilite.webp'),
        }}
        copy={{
          about: textOr(blok.eyebrow, 'À PROPOS'),
          button: textOr(blok.button_label, 'En savoir plus'),
          panels: [
            {
              label: textOr(first?.label, 'Espaces'),
              title: textOr(
                first?.title,
                'Espaces de charme, singuliers, atypiques, et bien pensés.',
              ),
              editableAttributes: first ? editable(first as Blok) : undefined,
            },
            {
              label: textOr(second?.label, 'Localisation'),
              title: textOr(
                second?.title,
                'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
              ),
              editableAttributes: second ? editable(second as Blok) : undefined,
            },
            {
              label: textOr(third?.label, 'Confort'),
              title: textOr(
                third?.title,
                'Standards hôteliers. Soin des détails, équipements modernes.',
              ),
              editableAttributes: third ? editable(third as Blok) : undefined,
            },
            {
              label: textOr(fourth?.label, 'Durabilité'),
              title: textOr(
                fourth?.title,
                'Matériaux durables et sourcés. Vigilance sur l’impact des installations.',
              ),
              editableAttributes: fourth ? editable(fourth as Blok) : undefined,
            },
          ],
        }}
      />
    </div>
  )
}

export function TestimonialsSectionBlok({ blok }: { blok: Blok }) {
  const sharedTestimonials = useSharedTestimonialsGlobals()
  const source = textOr(blok.source, 'global')
  const inlineItems = bloksOf<{
    quote?: unknown
    name?: unknown
    apartment?: unknown
    stay?: unknown
  }>(blok.items).map((item) => ({
    ...item,
    quote: textOr(item.quote, ''),
    name: textOr(item.name, ''),
    apartment: textOr(item.apartment, ''),
    stay: textOr(item.stay, ''),
    editableAttributes: editable(item as Blok),
  }))

  const items =
    source === 'inline' && inlineItems.length > 0
      ? inlineItems
      : sharedTestimonials.length > 0
        ? sharedTestimonials
        : inlineItems

  if (items.length === 0) return <div {...editable(blok)} />

  return (
    <div {...editable(blok)}>
      <TestimonialsSection
        copy={{
          title: textOr(blok.title, 'Témoignages'),
          items,
        }}
      />
    </div>
  )
}

export function ServicesSectionBlok({ blok }: { blok: Blok }) {
  const services = bloksOf<{ title?: unknown; description?: unknown; icon?: unknown }>(blok.items)
  const mapped = services.map((item) => ({
    title: textOr(item.title, ''),
    description: textOr(item.description, ''),
    icon: assetUrl(item.icon, '/images/icons/checkin.svg'),
    editableAttributes: editable(item as Blok),
  }))

  return (
    <div {...editable(blok)}>
      <ServicesSection services={mapped.length > 0 ? mapped : undefined} />
    </div>
  )
}

interface BlogGridSectionBlokProps {
  blok: Blok
  articles: BlogArticle[]
}

export function BlogGridSectionBlok({ blok, articles }: BlogGridSectionBlokProps) {
  const maxItems = typeof blok.max_items === 'number' ? blok.max_items : 5
  const sectionFilter = textOr(blok.section_filter, 'all')
  const filtered =
    sectionFilter === 'all'
      ? articles
      : articles.filter((article) => article.section === sectionFilter)
  const sliced = maxItems > 0 ? filtered.slice(0, maxItems) : filtered

  return (
    <div {...editable(blok)}>
      <BlogSection
        articles={sliced}
        copy={{
          previous: textOr(blok.pagination_previous_label, 'Précédent'),
          next: textOr(blok.pagination_next_label, 'Suivant'),
          description: textOr(
            blok.intro,
            'Depuis 2017, nous accompagnons les voyageurs pour qu’ils vivent des expériences inoubliables aux plus belles adresses.',
          ),
          button: textOr(blok.cta_label, 'Tous nos conseils'),
          fallbackSubtitle: textOr(
            blok.fallback_subtitle,
            'Un quartier vivant, une adresse au cœur des plus beaux quartiers.',
          ),
          readingTime: textOr(blok.reading_time_label, '5 min de lecture'),
        }}
      />
    </div>
  )
}

export function HeroCompactSectionBlok({ blok }: { blok: Blok }) {
  const heightClass = matchHeightClass(textOr(blok.height, 'fixed-442'))

  return (
    <div
      {...editable(blok)}
      className={`relative ${heightClass} overflow-hidden`}
      style={{
        backgroundImage: `url(${assetUrl(blok.background_image, PLACEHOLDER_IMAGE)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="from-coffee/75 absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent" />
      <div className="from-coffee/75 absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t to-transparent" />
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-content px-gutter md:px-gutter-md mx-auto w-full pb-10">
          {blok.eyebrow ? (
            <p className="text-cream/80 text-overline mb-2 font-bold tracking-[0.24px] uppercase">
              {textOr(blok.eyebrow, '')}
            </p>
          ) : null}
          <h1 className="text-cream text-base leading-[18px] font-bold">
            {textOr(blok.title, '')}
          </h1>
          {blok.body ? (
            <p className="text-cream/80 mt-3 max-w-[505px] text-xs leading-[20px] font-medium">
              {textOr(blok.body, '')}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function matchHeightClass(value: string) {
  switch (value) {
    case 'svh':
      return 'h-svh'
    case 'auto':
      return 'h-auto py-section'
    case 'fixed-442':
    default:
      return 'h-[442px]'
  }
}

export { editable, type Blok, type StoryblokLinkField, linkHref }
