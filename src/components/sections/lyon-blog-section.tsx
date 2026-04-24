'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Le Marais à hauteur de regard',
    date: 'Le 12 mars 2026',
    image: '/images/lyon/blog-terreaux.jpg',
    slug: 'le-marais-a-hauteur-de-regard',
  },
  {
    id: 2,
    title: 'Un week-end à Saint-Germain',
    date: 'Le 12 mars 2026',
    image: '/images/lyon/apt-vieux-lyon.jpg',
    slug: 'un-week-end-a-saint-germain',
  },
  {
    id: 3,
    title: 'Autour de l\'Opéra',
    date: 'Le 12 mars 2026',
    image: '/images/lyon/apt-bellecour.jpg',
    slug: 'autour-de-l-opera',
  },
]

export function LyonBlogSection() {
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
    <section ref={sectionRef} className="mx-auto max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
      <div className="rounded-lg border border-divider p-6 md:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
          {/* Left column */}
          <div>
            <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Le blog</p>
            <h2 className="text-coffee mt-1 text-base font-medium">En découvrir plus</h2>

            <h3 className="text-ash mt-10 text-2xl font-bold leading-tight tracking-tight md:text-4xl">
              Nos conseils pour améliorer votre voyage
            </h3>

            <p className="text-coffee mt-8 text-base font-medium leading-relaxed">
              Depuis 2016 nous aidons les voyageurs grâce à des logements premium au cœur des villes
            </p>
          </div>

          {/* Right column: blog cards */}
          <div className="flex flex-col gap-4">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.id}
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
                <div className="absolute inset-0 bg-gradient-to-t from-coffee/80 via-coffee/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-12">
                  <p className="text-cream text-xs font-bold uppercase">{post.date}</p>
                  <p className="text-cream mt-1 text-base font-medium leading-tight">{post.title}</p>
                </div>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  className="text-cream absolute right-4 top-4"
                >
                  <circle cx="7.5" cy="7.5" r="7" stroke="currentColor"/>
                  <path d="M6 5L9 7.5L6 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
