'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { storyblokEditable } from '@storyblok/react/rsc'
import { renderRichText } from '@/components/storyblok/rich-text'
import {
  useApartmentFaqGlobals,
  useSharedAssetsGlobals,
} from '@/components/providers/storyblok-globals-provider'
import {
  assetAlt,
  assetUrl,
  bloksOf,
  linkHref,
  linkTarget,
  richTextToPlainText,
  textOr,
  type StoryblokLinkField,
} from '@/lib/storyblok-asset'
import { PLACEHOLDER_IMAGE } from '@/lib/storyblok-defaults'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]
type Variant = 'cream' | 'coffee' | 'sand' | 'gradient'

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

const ctaVariantClasses: Record<Variant, string> = {
  cream: 'bg-cream text-coffee',
  coffee: 'bg-coffee text-cream',
  sand: 'bg-sand text-coffee',
  gradient: 'text-cream bg-[linear-gradient(90deg,#948174_0%,#625143_100%)]',
}

function renderParagraphs(body: string) {
  return body
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index} className="text-coffee text-body mt-4 first:mt-0">
        {paragraph}
      </p>
    ))
}

export function TextSectionBlok({ blok }: { blok: Blok }) {
  const maxWidth = textOr(blok.max_width, 'prose') === 'prose' ? 'max-w-prose' : 'max-w-content'
  const alignment = textOr(blok.alignment, 'left') === 'center' ? 'text-center' : 'text-left'
  const body = blok.body

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className={`${maxWidth} mx-auto ${alignment}`}>
        {blok.eyebrow ? (
          <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
            {textOr(blok.eyebrow, '')}
          </p>
        ) : null}
        {blok.title ? (
          <h2 className="text-coffee mt-2 text-base leading-[24px] font-medium">
            {textOr(blok.title, '')}
          </h2>
        ) : null}
        {body ? (
          <div className="mt-6 space-y-4">
            {typeof body === 'string' ? renderParagraphs(body) : renderRichText(body)}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function CtaSectionBlok({ blok }: { blok: Blok }) {
  const variant = (textOr(blok.variant, 'cream') as Variant) ?? 'cream'
  const ctas = bloksOf<{ label?: unknown; link?: unknown; variant?: unknown }>(blok.ctas)

  return (
    <section
      {...editable(blok)}
      className={`${ctaVariantClasses[variant] ?? ctaVariantClasses.cream} py-section md:py-section-md`}
    >
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
        {blok.eyebrow ? (
          <p className="text-overline mb-3 font-bold tracking-[0.24px] uppercase opacity-70">
            {textOr(blok.eyebrow, '')}
          </p>
        ) : null}
        <h2 className="text-h3 font-medium tracking-[-0.24px]">{textOr(blok.title, '')}</h2>
        {blok.body ? (
          <p className="text-body mt-4 max-w-[640px] opacity-90">{textOr(blok.body, '')}</p>
        ) : null}
        {ctas.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {ctas.map((cta, index) => (
              <Link
                key={`${cta.label}-${index}`}
                href={linkHref(cta.link as StoryblokLinkField, '/')}
                prefetch={false}
                className="bg-coffee text-cream inline-flex h-12 items-center rounded-full px-8 text-sm font-medium transition-opacity hover:opacity-85"
              >
                {textOr(cta.label, 'En savoir plus')}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function FaqSectionBlok({ blok }: { blok: Blok }) {
  const source = textOr(blok.source, 'inline')
  const global = useApartmentFaqGlobals()
  const inline = bloksOf<{ question?: unknown; answer?: unknown }>(blok.items)
    .map((item) => ({
      question: textOr(item.question, ''),
      answer: richTextToPlainText(item.answer),
    }))
    .filter((item) => item.question && item.answer)

  const items = source === 'global' ? global.items : inline
  const title = textOr(blok.title, source === 'global' ? global.title : 'Questions fréquentes')
  const eyebrow = textOr(blok.eyebrow, source === 'global' ? global.eyebrow : 'FAQ')

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) return <div {...editable(blok)} />

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md mx-auto pt-[100px] pb-[60px]"
    >
      <div>
        <p className="text-silver text-xs leading-[24px] font-bold tracking-[0.24px] uppercase">
          {eyebrow}
        </p>
        <p className="text-coffee text-base leading-[24px] font-medium">{title}</p>
      </div>

      <div className="mt-6">
        {items.map((item, i) => (
          <div key={`${item.question}-${i}`} className="border-divider border-t">
            <button
              type="button"
              className="flex w-full items-center gap-3 py-3"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <svg
                width="7"
                height="11"
                viewBox="0 0 7 11"
                fill="none"
                className={`shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-90' : ''}`}
              >
                <path
                  d="M1 1l4.5 4.5L1 10"
                  stroke="#aba39e"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-silver text-base leading-[24px] font-bold">
                {item.question}
              </span>
            </button>
            {openIndex === i && (
              <p className="text-coffee pb-4 pl-[19px] text-xs leading-[22px] font-medium">
                {item.answer}
              </p>
            )}
          </div>
        ))}
        <div className="border-divider border-t" />
      </div>
    </section>
  )
}

export function ImageTextSectionBlok({ blok }: { blok: Blok }) {
  const imagePosition = textOr(blok.image_position, 'left')
  const points = bloksOf<{ title?: unknown; description?: unknown }>(blok.points)
  const ctas = bloksOf<{ label?: unknown; link?: unknown; variant?: unknown }>(blok.ctas)
  const imageFirst = imagePosition !== 'right'

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div
          className={`bg-sand relative aspect-[4/5] overflow-hidden rounded-lg ${
            imageFirst ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          <Image
            src={assetUrl(blok.image, PLACEHOLDER_IMAGE)}
            alt={assetAlt(blok.image, '')}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className={imageFirst ? 'lg:order-2' : 'lg:order-1'}>
          {blok.eyebrow ? (
            <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
              {textOr(blok.eyebrow, '')}
            </p>
          ) : null}
          <h2 className="text-coffee text-h3 mt-2 font-medium">{textOr(blok.title, '')}</h2>
          {blok.body ? <div className="mt-6">{renderRichText(blok.body)}</div> : null}

          {points.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5">
              {points.map((point, index) => (
                <div key={`${point.title}-${index}`}>
                  <h3 className="text-coffee text-sm font-bold">{textOr(point.title, '')}</h3>
                  {point.description ? (
                    <p className="text-taupe mt-2 text-sm leading-relaxed">
                      {textOr(point.description, '')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {ctas.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {ctas.map((cta, index) => (
                <CmsCtaLink key={`${cta.label}-${index}`} cta={cta} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function FeatureGridSectionBlok({ blok }: { blok: Blok }) {
  const features = bloksOf<{ icon?: unknown; title?: unknown; description?: unknown }>(
    blok.features,
  )
  const variant = textOr(blok.variant, 'icons')
  const columns = textOr(blok.columns, '3')
  const gridClass =
    columns === '2'
      ? 'md:grid-cols-2'
      : columns === '4'
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-3'

  if (features.length === 0) return <div {...editable(blok)} />

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className="max-w-[720px]">
        {blok.eyebrow ? (
          <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
            {textOr(blok.eyebrow, '')}
          </p>
        ) : null}
        {blok.title ? (
          <h2 className="text-coffee text-h3 mt-2 font-medium">{textOr(blok.title, '')}</h2>
        ) : null}
        {blok.intro ? (
          <p className="text-taupe mt-4 text-sm leading-relaxed">{textOr(blok.intro, '')}</p>
        ) : null}
      </div>

      <div className={`mt-10 grid grid-cols-1 gap-5 ${gridClass}`}>
        {features.map((feature, index) => {
          const icon = assetUrl(feature.icon, '')
          return (
            <article key={`${feature.title}-${index}`} className="border-divider border-t pt-5">
              {variant === 'numbered' ? (
                <p className="text-silver text-sm font-bold">
                  {String(index + 1).padStart(2, '0')}
                </p>
              ) : variant === 'icons' && icon ? (
                <Image src={icon} alt="" width={28} height={28} className="mb-5 h-7 w-7" />
              ) : null}
              <h3 className="text-coffee text-base font-bold">{textOr(feature.title, '')}</h3>
              {feature.description ? (
                <p className="text-taupe mt-3 text-sm leading-relaxed">
                  {textOr(feature.description, '')}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export function StatsSectionBlok({ blok }: { blok: Blok }) {
  const items = bloksOf<{ value?: unknown; label?: unknown; icon?: unknown }>(blok.items)
  const logos = Array.isArray(blok.logos)
    ? (blok.logos as unknown[]).map((logo) => assetUrl(logo, '')).filter(Boolean)
    : []
  const variant = textOr(blok.variant, 'sand')
  const theme =
    variant === 'dark'
      ? 'bg-coffee text-cream'
      : variant === 'light'
        ? 'bg-cream text-coffee'
        : 'bg-sand text-coffee'

  if (items.length === 0 && logos.length === 0) return <div {...editable(blok)} />

  return (
    <section {...editable(blok)} className={`${theme} py-section md:py-section-md`}>
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {items.map((item, index) => {
              const icon = assetUrl(item.icon, '')
              return (
                <div key={`${item.value}-${index}`} className="border-t border-current/15 pt-5">
                  {icon ? (
                    <Image src={icon} alt="" width={24} height={24} className="mb-4 h-6 w-6" />
                  ) : null}
                  <p className="text-h3 font-bold">{textOr(item.value, '')}</p>
                  <p className="mt-2 text-sm opacity-75">{textOr(item.label, '')}</p>
                </div>
              )
            })}
          </div>
        ) : null}

        {logos.length > 0 ? (
          <div className="mt-10">
            {blok.logo_label ? (
              <p className="text-xs font-bold tracking-[0.24px] uppercase opacity-65">
                {textOr(blok.logo_label, '')}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-6">
              {logos.map((logo, index) => (
                <Image
                  key={`${logo}-${index}`}
                  src={logo}
                  alt=""
                  width={112}
                  height={32}
                  className="h-8 w-auto object-contain"
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function QuartiersSectionBlok({ blok }: { blok: Blok }) {
  const items = bloksOf<{ name?: unknown; slug?: unknown; description?: unknown; image?: unknown }>(
    blok.items,
  )

  if (items.length === 0) return <div {...editable(blok)} />

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className="mb-10">
        {blok.eyebrow ? (
          <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
            {textOr(blok.eyebrow, '')}
          </p>
        ) : null}
        <h2 className="text-coffee text-h3 mt-2 font-medium">{textOr(blok.title, '')}</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((item, index) => (
          <article key={`${item.slug}-${index}`} className="group">
            <div className="bg-sand relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src={assetUrl(item.image, PLACEHOLDER_IMAGE)}
                alt={textOr(item.name, '')}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="text-coffee mt-4 text-base font-bold">{textOr(item.name, '')}</h3>
            {item.description ? (
              <p className="text-taupe mt-2 text-sm leading-relaxed">
                {textOr(item.description, '')}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export function DividerSectionBlok({ blok }: { blok: Blok }) {
  const variant = textOr(blok.variant, 'spacer-lg')
  if (variant === 'line') {
    return (
      <div {...editable(blok)} className="max-w-content px-gutter md:px-gutter-md mx-auto">
        <div className="border-divider border-t" />
      </div>
    )
  }
  if (variant === 'sand-block') return <div {...editable(blok)} className="bg-sand h-24" />
  if (variant === 'spacer-sm') return <div {...editable(blok)} className="h-8 md:h-12" />
  return <div {...editable(blok)} className="h-16 md:h-24" />
}

export function InvestModelSectionBlok({ blok }: { blok: Blok }) {
  const points = bloksOf<{ title?: unknown; description?: unknown }>(blok.points)

  return (
    <section {...editable(blok)} className="bg-silver py-section md:py-section-md">
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto grid grid-cols-1 gap-12 lg:grid-cols-[304px_1fr]">
        <div className="relative h-[350px] overflow-hidden rounded-lg lg:h-[468px]">
          <Image
            src={assetUrl(blok.image, PLACEHOLDER_IMAGE)}
            alt={textOr(blok.image_alt, '')}
            fill
            sizes="304px"
            quality={85}
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-cream text-xs leading-[24px] font-bold tracking-[0.24px] uppercase">
            {textOr(blok.eyebrow, '')}
          </p>
          <h2 className="text-cream mt-1 text-base leading-[24px] font-medium">
            {textOr(blok.title, '')}
          </h2>

          <div className="mt-10 flex flex-col gap-8">
            {points.map((point, index) => (
              <div key={`${point.title}-${index}`}>
                <h3 className="text-cream text-base leading-[20px] font-bold">
                  {textOr(point.title, '')}
                </h3>
                <p className="text-cream mt-2 text-xs leading-[22px] font-medium">
                  {textOr(point.description, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function InvestStatsSectionBlok({ blok }: { blok: Blok }) {
  const logos = Array.isArray(blok.logos)
    ? (blok.logos as { filename?: string }[]).map((logo) => logo.filename ?? '')
    : []

  return (
    <section {...editable(blok)} className="bg-coffee">
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto py-16 text-center">
        <div className="mx-auto max-w-[735px]">
          <p className="text-cream text-base leading-[24px] font-bold">
            {textOr(blok.line_one, '')}
          </p>
          {blok.line_two ? (
            <p className="text-cream text-base leading-[24px] font-bold">
              {textOr(blok.line_two, '')}
            </p>
          ) : null}
        </div>

        {blok.body ? (
          <p className="text-cream/70 mt-4 text-xs font-medium">{textOr(blok.body, '')}</p>
        ) : null}

        {logos.length > 0 ? (
          <>
            <p className="text-cream/70 mt-8 text-xs font-medium">
              {textOr(blok.seen_on_label, '')}
            </p>
            <div className="mt-3 flex items-center justify-center gap-6">
              {logos.map((src, index) => (
                <span
                  key={`${src}-${index}`}
                  className="text-cream text-sm font-bold tracking-wider"
                >
                  {src ? (
                    <Image src={src} alt="" width={80} height={24} className="h-6 w-auto" />
                  ) : null}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

export function RichTextSectionBlok({ blok }: { blok: Blok }) {
  const maxWidth = textOr(blok.max_width, 'prose') === 'prose' ? 'max-w-prose' : 'max-w-content'
  const body = blok.body

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className={`${maxWidth} mx-auto`}>{renderRichText(body)}</div>
    </section>
  )
}

function CmsCtaLink({ cta }: { cta: { label?: unknown; link?: unknown; variant?: unknown } }) {
  const variant = textOr(cta.variant, 'primary')
  const href = linkHref(cta.link as StoryblokLinkField, '/')
  const target = linkTarget(cta.link)
  const classes =
    variant === 'outline'
      ? 'border-coffee text-coffee hover:bg-coffee hover:text-cream border'
      : variant === 'ghost'
        ? 'text-coffee hover:bg-sand'
        : 'bg-coffee text-cream hover:opacity-85'

  return (
    <Link
      href={href}
      prefetch={false}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={`${classes} inline-flex h-12 items-center rounded-full px-7 text-sm font-medium transition`}
    >
      {textOr(cta.label, 'En savoir plus')}
    </Link>
  )
}

// Re-export to expose unused imports to the linter for downstream wrappers
export { useSharedAssetsGlobals }
