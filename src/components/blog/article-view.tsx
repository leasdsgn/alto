import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Breadcrumbs } from '@/components/seo/breadcrumbs'
import { BrandKickerText } from '@/components/ui/brand-kicker-text'
import { Button } from '@/components/ui/button'
import type { BlogArticle } from '@/lib/blog-data'
import type { BlogEditorialMeta } from '@/lib/blog-page'
import type { InquiryLocale } from '@/types/inquiry'

interface ArticleViewProps {
  article: BlogArticle
  locale: InquiryLocale
  relatedArticles: BlogArticle[]
  cta: BlogEditorialMeta
}

const ARTICLE_VIEW_COPY = {
  fr: {
    eyebrow: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
    summaryLabel: 'Sommaire',
    relatedLabel: 'Blog',
    relatedIntroTitle: 'Chez soi, comme à l’hôtel',
    relatedIntroBody:
      'Depuis 2017, nous accompagnons les voyageurs pour qu’ils vivent des expériences inoubliables.',
    relatedIntroCta: 'Tous nos conseils',
    relatedIntroHref: '/blog',
    cityLabels: {
      paris: 'Paris',
      lyon: 'Lyon',
      voyage: 'Voyage',
    },
  },
  en: {
    eyebrow: 'Alto is a different way of thinking about hospitality.',
    summaryLabel: 'Contents',
    relatedLabel: 'Journal',
    relatedIntroTitle: 'At home, with the quiet standards of a hotel.',
    relatedIntroBody:
      'Since 2017, we have been helping travellers enjoy calmer, more memorable stays.',
    relatedIntroCta: 'All our notes',
    relatedIntroHref: '/blog',
    cityLabels: {
      paris: 'Paris',
      lyon: 'Lyon',
      voyage: 'Travel',
    },
  },
} as const

const NEIGHBORHOOD_BY_SLUG = {
  'le-marais-a-hauteur-de-regard': 'Le Marais',
  'un-week-end-a-saint-germain': 'Saint-Germain',
  'autour-de-l-opera': 'L’Opéra',
  'lyon-entre-terrasses-et-traboules': 'Presqu’île',
  '48-heures-autour-de-bellecour': 'Bellecour',
  'vieux-lyon-et-escaliers-secrets': 'Vieux Lyon',
  'preparer-un-sejour-sans-frictions': 'Séjour',
  'voyager-leger-mais-bien': 'Bagage',
  'choisir-un-pied-a-terre-bien-place': 'Adresse',
} as const

const ARTICLE_HERO_IMAGE = '/images/blog/article-hero.webp'

export function ArticleView({ article, locale, relatedArticles, cta }: ArticleViewProps) {
  const copy = ARTICLE_VIEW_COPY[locale]
  const heroImage = article.heroImage ?? ARTICLE_HERO_IMAGE
  const anchorSections =
    article.sections.length > 0
      ? article.sections
      : [{ heading: article.title, body: article.subtitle }]
  const heroTags = [copy.cityLabels[article.section], getNeighborhoodLabel(article)].filter(Boolean)
  const readingTime = getReadingTimeLabel(article)

  return (
    <>
      <section className="relative h-[512px] overflow-hidden">
        <Image
          src={heroImage}
          alt={article.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="bg-taupe/80 absolute inset-0 mix-blend-multiply" />
        <Header />

        <div className="max-w-content px-gutter md:px-gutter-md relative mx-auto flex h-full flex-col justify-center pt-20">
          <Breadcrumbs
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Journal', href: '/blog' },
              { label: article.title },
            ]}
            className="text-cream/80 mb-8"
          />
          <p className="text-cream text-body max-w-[1212px]">
            <BrandKickerText value={copy.eyebrow} />
          </p>
          <h1 className="text-cream text-h3 mt-8 max-w-[954px] font-bold">{article.title}</h1>

          <div className="mt-8 flex flex-wrap gap-4">
            {heroTags.map((tag) => (
              <span
                key={tag}
                className="from-silver to-taupe text-overline text-cream inline-flex items-center justify-center rounded-lg bg-gradient-to-r px-4 py-2 font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <main className="bg-cream">
        <div className="max-w-content px-gutter py-section md:px-gutter-md mx-auto">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,754px)_395px] xl:gap-[63px]">
            <article className="min-w-0">
              <ArticleSection section={anchorSections[0]} index={0} emphasizeBody />

              <div className="bg-silver/40 relative mt-10 aspect-[751/386] overflow-hidden rounded-lg">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 1279px) 100vw, 751px"
                  className="object-cover"
                />
              </div>

              <div className="mt-14 space-y-14">
                {anchorSections.slice(1).map((section, index) => (
                  <ArticleSection
                    key={`${section.heading}-${index + 1}`}
                    section={section}
                    index={index + 1}
                  />
                ))}
              </div>
            </article>

            <aside className="space-y-3 xl:sticky xl:top-28 xl:self-start">
              <div className="rounded-lg bg-[#f9f9f2] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-coffee text-h5 font-bold">{article.title}</h2>
                  <span className="from-silver to-taupe text-overline text-cream inline-flex shrink-0 rounded-lg bg-gradient-to-r px-4 py-2 font-bold">
                    {readingTime}
                  </span>
                </div>

                <p className="text-taupe text-overline mt-5 font-bold uppercase">
                  {copy.summaryLabel}
                </p>

                <nav className="mt-3">
                  {anchorSections.map((section, index) => (
                    <Link
                      key={`${section.heading}-${index}`}
                      href={`#${toAnchorId(section.heading, index)}`}
                      className="border-divider text-body-xl text-coffee flex items-center justify-between gap-4 border-b py-4 font-semibold transition-opacity last:border-b-0 hover:opacity-70"
                    >
                      <span>{section.heading}</span>
                      <span className="text-taupe">
                        <ChevronRight />
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="bg-taupe rounded-lg p-6">
                <div className="from-silver to-taupe inline-flex items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2">
                  <span className="bg-cream size-2 shrink-0 rounded-full" />
                  <span className="text-cream text-overline font-bold">{cta.ctaEyebrow}</span>
                </div>

                <h3 className="text-cream text-h5 mt-12 max-w-[254px] font-bold">{cta.ctaTitle}</h3>

                <Button
                  href={cta.ctaHref}
                  size="regular"
                  iconRight={<ArrowOutward />}
                  className="mt-8"
                >
                  {cta.ctaLabel}
                </Button>
              </div>
            </aside>
          </div>

          <section className="mt-section md:mt-section-md overflow-hidden">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[396px_379px_379px_379px]">
              <div className="bg-taupe flex min-h-[360px] flex-col justify-between rounded-lg p-5 md:min-h-[598px] md:p-6">
                <div className="space-y-5">
                  <p className="text-silver text-overline font-bold uppercase">
                    {copy.relatedLabel}
                  </p>
                  <p className="text-cream text-body-xl max-w-[363px] font-semibold">
                    {copy.relatedIntroBody}
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-cream text-h4 font-medium">{copy.relatedIntroTitle}</h2>
                  <Button
                    href={copy.relatedIntroHref}
                    size="regular"
                    iconRight={<ArrowOutward />}
                    className="self-start"
                  >
                    {copy.relatedIntroCta}
                  </Button>
                </div>
              </div>

              {relatedArticles.slice(0, 2).map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group relative min-h-[360px] overflow-hidden rounded-lg md:min-h-[598px]"
                >
                  <Image
                    src={related.image}
                    alt={related.title}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 379px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="bg-taupe/80 absolute inset-0 mix-blend-multiply" />

                  <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
                    <div className="space-y-4">
                      <p className="text-silver text-overline font-bold uppercase">
                        {getNeighborhoodLabel(related)}
                      </p>
                      <h3 className="text-cream text-h4 font-medium">{related.title}</h3>
                      <p className="text-cream text-body-xl font-semibold">{related.subtitle}</p>
                    </div>

                    <div className="flex items-end justify-between gap-4">
                      <p className="text-silver text-overline font-bold uppercase">
                        {getReadingTimeLabel(related)}
                      </p>
                      <span className="bg-cream/10 border-cream/20 text-cream flex size-9 items-center justify-center rounded-full border transition-opacity group-hover:opacity-80">
                        <ArrowOutward />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

              <div className="hidden rounded-lg bg-[#deddd9] xl:block" />
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

function ArticleSection({
  section,
  index,
  emphasizeBody = false,
}: {
  section: { heading: string; body: string; label?: string }
  index: number
  emphasizeBody?: boolean
}) {
  const paragraphs = section.body
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <section id={toAnchorId(section.heading, index)}>
      <h2 className="text-coffee text-h3 font-bold">{section.heading}</h2>

      {section.label && (
        <p className="text-silver text-overline mt-4 font-bold uppercase">{section.label}</p>
      )}

      <div className={emphasizeBody ? 'mt-10 space-y-6' : 'mt-8 space-y-6'}>
        {paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className={
              emphasizeBody
                ? 'text-coffee text-body-xl font-semibold'
                : 'text-coffee text-body-xl font-semibold'
            }
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}

function getReadingTimeLabel(article: BlogArticle) {
  const words = article.sections
    .flatMap((section) => [section.heading, section.body])
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length

  return `${Math.max(5, Math.ceil(words / 180))} min read`
}

function getNeighborhoodLabel(article: BlogArticle) {
  return NEIGHBORHOOD_BY_SLUG[article.slug as keyof typeof NEIGHBORHOOD_BY_SLUG] ?? article.category
}

function toAnchorId(heading: string, index: number) {
  const normalized = heading
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  return `${normalized || 'section'}-${index + 1}`
}

function ChevronRight() {
  return (
    <svg
      width="6"
      height="10"
      viewBox="0 0 6 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m1 1 4 4-4 4" />
    </svg>
  )
}

function ArrowOutward() {
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
      aria-hidden="true"
    >
      <path d="M3 11 11 3M11 3H5M11 3v6" />
    </svg>
  )
}
