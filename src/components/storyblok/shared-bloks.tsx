'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { storyblokEditable } from '@storyblok/react/rsc'
import {
  useApartmentFaqGlobals,
  useSharedAssetsGlobals,
} from '@/components/providers/storyblok-globals-provider'
import {
  assetUrl,
  bloksOf,
  linkHref,
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
  const body = textOr(blok.body, '')

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
          <h2 className="text-coffee mt-2 text-base font-medium leading-[24px]">
            {textOr(blok.title, '')}
          </h2>
        ) : null}
        {body ? <div className="mt-6 space-y-4">{renderParagraphs(body)}</div> : null}
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
      answer: typeof item.answer === 'string' ? item.answer : '',
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
      className="max-w-content px-gutter md:px-gutter-md mx-auto pb-[60px] pt-[100px]"
    >
      <div>
        <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">
          {eyebrow}
        </p>
        <p className="text-coffee text-base font-medium leading-[24px]">{title}</p>
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
              <span className="text-silver text-base font-bold leading-[24px]">
                {item.question}
              </span>
            </button>
            {openIndex === i && (
              <p className="text-coffee pb-4 pl-[19px] text-xs font-medium leading-[22px]">
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

export function InvestModelSectionBlok({ blok }: { blok: Blok }) {
  const points = bloksOf<{ title?: unknown; description?: unknown }>(blok.points)

  return (
    <section
      {...editable(blok)}
      className="bg-silver py-section md:py-section-md"
    >
      <div className="mx-auto grid max-w-content grid-cols-1 gap-12 px-gutter md:px-gutter-md lg:grid-cols-[304px_1fr]">
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
          <p className="text-cream text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">
            {textOr(blok.eyebrow, '')}
          </p>
          <h2 className="text-cream mt-1 text-base font-medium leading-[24px]">
            {textOr(blok.title, '')}
          </h2>

          <div className="mt-10 flex flex-col gap-8">
            {points.map((point, index) => (
              <div key={`${point.title}-${index}`}>
                <h3 className="text-cream text-base font-bold leading-[20px]">
                  {textOr(point.title, '')}
                </h3>
                <p className="text-cream mt-2 text-xs font-medium leading-[22px]">
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
      <div className="mx-auto max-w-content px-gutter md:px-gutter-md py-16 text-center">
        <div className="mx-auto max-w-[735px]">
          <p className="text-cream text-base font-bold leading-[24px]">
            {textOr(blok.line_one, '')}
          </p>
          {blok.line_two ? (
            <p className="text-cream text-base font-bold leading-[24px]">
              {textOr(blok.line_two, '')}
            </p>
          ) : null}
        </div>

        {blok.body ? (
          <p className="text-cream/70 mt-4 text-xs font-medium">{textOr(blok.body, '')}</p>
        ) : null}

        {logos.length > 0 ? (
          <>
            <p className="text-cream/70 mt-8 text-xs font-medium">{textOr(blok.seen_on_label, '')}</p>
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

import { renderRichText } from '@/components/storyblok/rich-text'

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

// Re-export to expose unused imports to the linter for downstream wrappers
export { useSharedAssetsGlobals }
