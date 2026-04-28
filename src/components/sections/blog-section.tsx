'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { BLOG_ARTICLES, type BlogArticle } from '@/lib/blog-data'
import { Button } from '@/components/ui/button'

// TODO: replace with Storyblok fetch (storyblokApi.getStories(...))
const ARTICLES: BlogArticle[] = BLOG_ARTICLES.slice(0, 5)

export function BlogSection() {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('[data-card]') as HTMLElement | null
    const cardWidth = card?.clientWidth ?? 396
    const gap = 16
    track.scrollBy({ left: direction === 'right' ? cardWidth + gap : -(cardWidth + gap), behavior: 'smooth' })
  }

  return (
    <section className="py-section md:py-section-md md:overflow-hidden">
      <div className="mx-auto flex max-w-content flex-col gap-7 px-4 md:px-gutter-md">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="bg-[#fffff8] text-[#301a0a] border-[#301a0a] flex size-9 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            aria-label="Précédent"
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="bg-[#fffff8] text-[#301a0a] border-[#301a0a] flex size-9 items-center justify-center rounded-full border transition-opacity hover:opacity-70"
            aria-label="Suivant"
          >
            <ArrowRight />
          </button>
        </div>

        <div
          ref={trackRef}
          className="-mx-4 flex gap-4 overflow-x-auto px-4 scrollbar-none md:-mx-0 md:px-0"
        >
          <div data-card className="bg-taupe flex h-[420px] w-[294px] shrink-0 flex-col justify-between rounded-xl px-5 py-4 md:h-[598px] md:w-[396px] md:px-6 md:py-5">
            <p className="text-silver text-overline font-bold uppercase tracking-[0.24px]">
              BLOG
            </p>
            <div className="flex flex-col gap-8">
              <p className="text-cream text-body-xl leading-[1.5] font-semibold">
                Depuis 2017, nous accompagnons les voyageurs pour qu&rsquo;ils
                vivent des expériences inoubliables aux plus belles adresses.
              </p>
              <Button variant="primary" size="regular" href="/blog" iconRight={<ArrowOutward />} className="self-start">
                Tous nos conseils
              </Button>
            </div>
          </div>

          {ARTICLES.map((article) => (
            <div
              key={article.slug}
              data-card
              className="group relative h-[420px] w-[294px] shrink-0 overflow-hidden rounded-xl md:h-[598px] md:w-[396px]"
            >
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 396px"
                quality={85}
                className="object-cover"
              />
              <div className="bg-taupe/80 absolute inset-0 mix-blend-multiply" />
              <div className="absolute inset-0 flex flex-col justify-between px-5 py-4 md:px-6 md:py-5">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#fffff8] text-h4 font-medium tracking-[-0.24px]">
                    {article.title}
                  </h3>
                  <p className="text-[#fffff8] text-body-xl font-semibold leading-[1.5]">
                    {article.subtitle ?? 'Un quartier vivant, une adresse au cœur des plus beaux quartiers.'}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[#aba39e] text-overline font-bold uppercase tracking-[0.24px]">
                    5 min de lecture
                  </p>
                  <span className="bg-taupe text-cream flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity group-hover:opacity-80">
                    <ArrowOutward />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}

function ArrowOutward() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11 11 3M11 3H5M11 3v6" />
    </svg>
  )
}
