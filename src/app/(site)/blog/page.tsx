'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BLOG_ARTICLES, BLOG_CATEGORIES } from '@/lib/blog-data'
import { Chip } from '@/components/ui/chip'

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('Tous')

  const filtered = activeCategory === 'Tous'
    ? BLOG_ARTICLES
    : BLOG_ARTICLES.filter((a) => a.category === activeCategory)

  return (
    <>
      {/* Hero */}
      <div className="relative h-[422px] overflow-hidden">
        <Image
          src="/images/alto-salon.jpg"
          alt="Blog Alto"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-coffee/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-coffee/75 to-transparent" />

        <Header />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-content px-gutter pb-10 md:px-gutter-md">
            <h1 className="text-cream text-base font-bold leading-[24px]">Vivre la ville autrement</h1>
            <p className="text-cream/80 mt-2 max-w-[505px] text-xs font-medium leading-[20px]">
              Regards sur nos quartiers, inspirations, adresses confidentielles et art de vivre.
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
        {/* Filtres */}
        <div className="flex gap-2">
          {BLOG_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              variant={activeCategory === cat ? 'active' : 'default'}
              onPress={() => setActiveCategory(cat)}
            >
              {cat}
            </Chip>
          ))}
        </div>

        {/* Grille articles */}
        <div className="mt-10 grid grid-cols-1 gap-8 rounded-lg border border-silver p-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
              <div className="relative h-[331px] overflow-hidden rounded-lg">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={85}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-coffee mt-4 text-base font-medium leading-[24px]">{article.title}</p>
              <p className="text-silver mt-1 text-xs font-bold uppercase tracking-[0.24px]">Le {article.date}</p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
