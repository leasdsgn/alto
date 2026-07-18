'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { BrandKickerText } from '@/components/ui/brand-kicker-text'
import { Button } from '@/components/ui/button'
import type { BlogSectionKey } from '@/lib/blog-data'
import type { BlogEditorialSection, BlogPageCopy } from '@/lib/blog-page'

interface BlogIndexProps {
  copy: BlogPageCopy
  sections: BlogEditorialSection[]
  locationAvatars: readonly string[]
  travelerAvatars: readonly string[]
  storyCardImages: readonly [string, string]
}

export function BlogIndex({
  copy,
  sections,
  locationAvatars,
  travelerAvatars,
  storyCardImages,
}: BlogIndexProps) {
  const trackRefs = useRef<Record<BlogSectionKey, HTMLDivElement | null>>({
    paris: null,
    lyon: null,
    voyage: null,
  })

  function setTrackRef(sectionKey: BlogSectionKey) {
    return (node: HTMLDivElement | null) => {
      trackRefs.current[sectionKey] = node
    }
  }

  function scrollSection(sectionKey: BlogSectionKey, direction: 'left' | 'right') {
    const track = trackRefs.current[sectionKey]
    if (!track) return

    const card = track.querySelector('[data-card]') as HTMLElement | null
    const width = card?.clientWidth ?? 294
    const gap = 12

    track.scrollBy({
      left: direction === 'right' ? width + gap : -(width + gap),
      behavior: 'smooth',
    })
  }

  return (
    <>
      <section className="from-silver to-taupe relative overflow-hidden bg-gradient-to-r">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,248,0.14),transparent_48%)]" />
        <Header />

        <div className="max-w-content px-gutter md:px-gutter-md relative mx-auto pt-28 pb-14 md:pt-36 md:pb-20">
          <div className="mx-auto flex max-w-[980px] flex-col items-center text-center">
            <p className="text-cream/92 text-body max-w-[760px]">
              <BrandKickerText value={copy.heroEyebrow} />
            </p>
            <h1 className="text-cream text-h4 md:text-h3 mt-6 max-w-[954px] font-bold tracking-[-0.04em]">
              {copy.heroTitle}
            </h1>
            <p className="text-cream/88 text-body mt-6 max-w-[860px]">{copy.heroBody}</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {copy.stats.map((stat) => (
              <StatCard
                key={stat.value}
                label={stat.label}
                value={stat.value}
                kind={stat.kind}
                locationAvatars={locationAvatars}
                travelerAvatars={travelerAvatars}
              />
            ))}
          </div>
        </div>
      </section>

      <main className="bg-cream">
        <div className="max-w-content px-gutter md:px-gutter-md md:py-section mx-auto flex flex-col gap-16 py-14 md:gap-20">
          {sections.map((section) => (
            <section key={section.key} className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-coffee text-h4 font-medium">{section.title}</h2>
                  <Link
                    href={section.browseHref}
                    aria-label={section.title}
                    className="bg-taupe text-cream border-taupe hidden size-9 items-center justify-center rounded-full border transition-opacity hover:opacity-70 md:inline-flex"
                  >
                    <ArrowOutward />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollSection(section.key, 'left')}
                    className="border-coffee text-coffee flex size-9 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
                    aria-label={`${copy.scrollPreviousLabel} ${section.title}`}
                  >
                    <ArrowLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSection(section.key, 'right')}
                    className="border-coffee text-coffee flex size-9 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
                    aria-label={`${copy.scrollNextLabel} ${section.title}`}
                  >
                    <ArrowRight />
                  </button>
                </div>
              </div>

              <div
                ref={setTrackRef(section.key)}
                className="scrollbar-none -mx-6 flex gap-3 overflow-x-auto px-6 md:-mx-12 md:px-12 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0"
              >
                {section.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    data-card
                    className="group relative flex min-h-[278px] w-[294px] shrink-0 overflow-hidden rounded-lg md:w-[320px] xl:w-auto"
                  >
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 767px) 294px, (max-width: 1279px) 320px, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="bg-taupe/85 absolute inset-0 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80" />
                    <div className="relative flex h-full w-full flex-col justify-between p-4">
                      <p className="text-cream/92 text-overline font-bold uppercase">
                        {article.date}
                      </p>

                      <div className="max-w-[224px]">
                        <h3 className="text-cream text-h5 font-bold">{article.title}</h3>
                        <p className="text-cream/90 text-body-sm mt-3">{article.subtitle}</p>
                      </div>
                    </div>
                  </Link>
                ))}

                <div
                  data-card
                  className="group bg-taupe relative flex min-h-[278px] w-[302px] shrink-0 overflow-hidden rounded-lg md:w-[332px] xl:w-auto"
                >
                  <div className="bg-taupe relative flex h-full w-full flex-col justify-between rounded-lg p-4">
                    <div className="from-silver to-taupe inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r px-4 py-2">
                      <span className="bg-cream size-2 shrink-0 rounded-full" />
                      <span className="text-cream text-overline font-bold">
                        {section.ctaEyebrow}
                      </span>
                    </div>

                    <div className="space-y-5">
                      <h3 className="text-cream text-h5 max-w-[254px] font-bold">
                        {section.ctaTitle}
                      </h3>
                      <Button href={section.ctaHref} size="regular" iconRight={<ArrowOutward />}>
                        {section.ctaLabel}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}

          <section className="overflow-hidden">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[396px_379px_379px_379px]">
              <div className="bg-taupe flex min-h-[360px] flex-col justify-between rounded-lg p-5 md:min-h-[598px] md:p-6">
                <div className="space-y-5">
                  <p className="text-silver text-overline font-bold uppercase">
                    {copy.storyCards[0]?.eyebrow}
                  </p>
                  <p className="text-cream text-body-xl max-w-[320px] font-semibold">
                    {copy.storyCards[0]?.body}
                  </p>
                </div>

                <div className="space-y-6">
                  <h2 className="text-cream text-h4 font-medium">{copy.storyCards[0]?.title}</h2>
                  {copy.storyCards[0]?.href && copy.storyCards[0]?.ctaLabel && (
                    <Button
                      href={copy.storyCards[0].href}
                      size="regular"
                      iconRight={<ArrowOutward />}
                      className="self-start"
                    >
                      {copy.storyCards[0].ctaLabel}
                    </Button>
                  )}
                </div>
              </div>

              {copy.storyCards.slice(1).map((card, index) => {
                const imageSrc = storyCardImages[index] ?? card.image

                return (
                  <div
                    key={card.title}
                    className="group relative min-h-[360px] overflow-hidden rounded-lg md:min-h-[598px]"
                  >
                    {imageSrc && (
                      <Image
                        src={imageSrc}
                        alt={card.title}
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 379px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="bg-taupe/80 absolute inset-0 mix-blend-multiply" />
                    <div className="relative flex h-full flex-col justify-between p-5 md:p-6">
                      <p className="text-cream text-overline font-bold uppercase">{card.eyebrow}</p>

                      <div className="space-y-4">
                        <h3 className="text-cream text-h4 font-medium">{card.title}</h3>
                        <p className="text-cream text-body-xl font-semibold">{card.body}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="hidden rounded-lg bg-[#deddd9] xl:block" />
            </div>
          </section>

          <section className="pt-2">
            <p className="text-silver text-overline font-bold uppercase">
              {copy.testimonial.eyebrow}
            </p>

            <div className="border-divider mt-6 border-b pb-10">
              <blockquote className="text-coffee text-h4 md:text-h2 max-w-[1192px] font-bold">
                {`“${copy.testimonial.quote}”`}
              </blockquote>

              <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-coffee text-body-xl font-semibold">
                    {copy.testimonial.author}
                  </p>
                  <p className="text-ash text-body mt-1">{copy.testimonial.context}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="bg-coffee/35 size-1.5 rounded-full" />
                  <span className="bg-coffee/35 size-1.5 rounded-full" />
                  <span className="bg-coffee size-2.5 rounded-full" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

function StatCard({
  kind,
  label,
  value,
  locationAvatars,
  travelerAvatars,
}: {
  kind: 'avatars' | 'guest-badges'
  label: string
  value: string
  locationAvatars: readonly string[]
  travelerAvatars: readonly string[]
}) {
  return (
    <div className="bg-taupe/95 flex min-h-[109px] flex-col items-center justify-center rounded-lg px-5 py-4 text-center shadow-[0_8px_24px_rgba(48,26,10,0.08)]">
      <HeroStatVisual
        kind={kind}
        locationAvatars={locationAvatars}
        travelerAvatars={travelerAvatars}
      />
      <p className="text-cream text-body-xl mt-4 font-semibold">{value}</p>
      <span className="sr-only">{label}</span>
    </div>
  )
}

function HeroStatVisual({
  kind,
  locationAvatars,
  travelerAvatars,
}: {
  kind: 'avatars' | 'guest-badges'
  locationAvatars: readonly string[]
  travelerAvatars: readonly string[]
}) {
  const avatars = kind === 'avatars' ? locationAvatars : travelerAvatars

  return (
    <div className="flex items-center">
      {avatars.map((src, index) => (
        <div
          key={src}
          className={`${index === 0 ? '' : '-ml-2.5'} border-cream relative z-[1] size-9 overflow-hidden rounded-full border`}
        >
          <Image src={src} alt="" fill sizes="36px" className="object-cover" />
        </div>
      ))}
    </div>
  )
}

function ArrowLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3 5 8l5 5" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 3 5 5-5 5" />
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
    >
      <path d="M3 11 11 3M11 3H5M11 3v6" />
    </svg>
  )
}
