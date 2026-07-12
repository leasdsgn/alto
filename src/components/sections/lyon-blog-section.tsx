'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { BlogArticle } from '@/lib/blog-data'
import { useLocale } from '@/components/providers/locale-provider'

gsap.registerPlugin(ScrollTrigger)

interface LyonBlogSectionProps {
  articles: BlogArticle[]
}

export function LyonBlogSection({ articles }: LyonBlogSectionProps) {
  const locale = useLocale()
  const copy = LYON_BLOG_COPY[locale]
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    if (!section) return

    gsap.fromTo(
      section.querySelectorAll('.blog-card'),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
        },
      },
    )

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill()
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="max-w-content px-gutter py-section md:px-gutter-md md:py-section-md mx-auto"
    >
      <div className="border-divider rounded-lg border p-6 md:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left column */}
          <div>
            <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">
              {copy.eyebrow}
            </p>
            <h2 className="text-coffee mt-1 text-base font-medium">{copy.title}</h2>

            <h3 className="text-ash mt-10 text-2xl leading-tight font-bold tracking-tight md:text-4xl">
              {copy.heading}
            </h3>

            <p className="text-coffee mt-8 text-base leading-relaxed font-medium">{copy.body}</p>
          </div>

          {/* Right column: blog cards */}
          <div className="flex flex-col gap-4">
            {articles.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-card group relative h-40 overflow-hidden rounded-lg"
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="from-coffee/80 via-coffee/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute right-12 bottom-4 left-4">
                  <p className="text-cream text-xs font-bold uppercase">{post.date}</p>
                  <p className="text-cream mt-1 text-base leading-tight font-medium">
                    {post.title}
                  </p>
                </div>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  className="text-cream absolute top-4 right-4"
                >
                  <circle cx="7.5" cy="7.5" r="7" stroke="currentColor" />
                  <path
                    d="M6 5L9 7.5L6 10"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const LYON_BLOG_COPY = {
  fr: {
    eyebrow: 'Le blog',
    title: 'En découvrir plus',
    heading: 'Nos conseils pour améliorer votre voyage',
    body: 'Depuis 2016, nous accompagnons les voyageurs avec des logements haut de gamme au cœur des villes.',
  },
  en: {
    eyebrow: 'Journal',
    title: 'Discover more',
    heading: 'Our advice for a better stay',
    body: 'Since 2016, we have welcomed travelers to high-end apartments in the heart of the city.',
  },
} as const
