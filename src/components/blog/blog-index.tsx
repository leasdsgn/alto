'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Chip } from '@/components/ui/chip'
import type { BlogArticle } from '@/lib/blog-data'

interface BlogIndexProps {
  articles: BlogArticle[]
  categories: string[]
  copy: {
    title: string
    description: string
    allCategory: string
    datePrefix: string
  }
}

export function BlogIndex({ articles, categories, copy }: BlogIndexProps) {
  const [activeCategory, setActiveCategory] = useState(copy.allCategory)
  const filtered = activeCategory === copy.allCategory
    ? articles
    : articles.filter((article) => article.category === activeCategory)

  return (
    <>
      <div className="relative h-[422px] overflow-hidden">
        <Image
          src="/images/alto-salon.jpg"
          alt={copy.title}
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
            <h1 className="text-cream text-base font-bold leading-[24px]">{copy.title}</h1>
            <p className="text-cream/80 mt-2 max-w-[505px] text-xs font-medium leading-[20px]">
              {copy.description}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Chip
              key={category}
              variant={activeCategory === category ? 'active' : 'default'}
              onPress={() => setActiveCategory(category)}
            >
              {category}
            </Chip>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 rounded-lg border border-silver p-5 md:grid-cols-2 md:p-8 lg:grid-cols-3">
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
              <p className="text-silver mt-1 text-xs font-bold uppercase tracking-[0.24px]">
                {copy.datePrefix} {article.date}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
