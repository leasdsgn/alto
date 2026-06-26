'use client'

import { storyblokEditable } from '@storyblok/react/rsc'
import { LyonHeroSection } from '@/components/sections/lyon-hero-section'
import { StatsSection } from '@/components/sections/stats-section'
import { LyonServicesSection } from '@/components/sections/lyon-services-section'
import { LyonQuartiersSection } from '@/components/sections/lyon-quartiers-section'
import { LyonBlogSection } from '@/components/sections/lyon-blog-section'
import { assetUrl, bloksOf, textOr } from '@/lib/storyblok-asset'
import { PLACEHOLDER_IMAGE } from '@/lib/storyblok-defaults'
import type { BlogArticle } from '@/lib/blog-data'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

export function LyonHeroSectionBlok({ blok }: { blok: Blok }) {
  return (
    <div {...editable(blok)}>
      <LyonHeroSection backgroundImage={assetUrl(blok.background_image, PLACEHOLDER_IMAGE)} />
    </div>
  )
}

export function LyonStatsSectionBlok({ blok }: { blok: Blok }) {
  return (
    <div {...editable(blok)}>
      <StatsSection
        pressLogo={assetUrl(blok.press_logo, '/images/lyon/press-logo.png')}
        monocleLogo={assetUrl(blok.monocle_logo, '/images/lyon/monocle-logo.png')}
      />
    </div>
  )
}

export function LyonServicesSectionBlok({ blok }: { blok: Blok }) {
  return (
    <div {...editable(blok)}>
      <LyonServicesSection image={assetUrl(blok.image, '/images/lyon/services-image.jpg')} />
    </div>
  )
}

export function LyonQuartiersSectionBlok({ blok }: { blok: Blok }) {
  const items = bloksOf<{ slug?: unknown; image?: unknown }>(blok.items)
  const byKey = (key: string) =>
    items.find((item) => textOr(item.slug, '') === key)
  const bellecour = byKey('bellecour')
  const vieuxLyon = byKey('vieux-lyon')
  const terreaux = byKey('terreaux')

  return (
    <div {...editable(blok)}>
      <LyonQuartiersSection
        images={{
          bellecour: assetUrl(bellecour?.image, '/images/lyon/apt-bellecour.jpg'),
          vieuxLyon: assetUrl(vieuxLyon?.image, '/images/lyon/apt-vieux-lyon.jpg'),
          terreaux: assetUrl(terreaux?.image, '/images/lyon/apt-terreaux.jpg'),
        }}
      />
    </div>
  )
}

interface LyonBlogSectionBlokProps {
  blok: Blok
  articles: BlogArticle[]
}

export function LyonBlogSectionBlok({ blok, articles }: LyonBlogSectionBlokProps) {
  const maxItems = typeof blok.max_items === 'number' ? blok.max_items : 3
  const sectionFilter = textOr(blok.section_filter, 'lyon')
  const filtered =
    sectionFilter === 'all'
      ? articles
      : articles.filter((article) => article.section === sectionFilter)
  return (
    <div {...editable(blok)}>
      <LyonBlogSection articles={filtered.slice(0, maxItems)} />
    </div>
  )
}
