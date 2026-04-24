import { cookies } from 'next/headers'
import { BlogIndex } from '@/components/blog/blog-index'
import { BLOG_CATEGORIES } from '@/lib/blog-data'
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/locale'
import { getBlogArticles } from '@/lib/storyblok-blog'

const BLOG_COPY = {
  fr: {
    title: 'Vivre la ville autrement',
    description: 'Regards sur nos quartiers, inspirations, adresses confidentielles et art de vivre.',
    allCategory: 'Tous',
    datePrefix: 'Le',
  },
  en: {
    title: 'Experience the city differently',
    description: 'Notes on our districts, inspiration, quiet addresses and the art of living.',
    allCategory: 'All',
    datePrefix: '',
  },
}

export default async function BlogPage() {
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const articles = await getBlogArticles(locale)

  return (
    <BlogIndex
      articles={articles}
      categories={BLOG_CATEGORIES[locale]}
      copy={BLOG_COPY[locale]}
    />
  )
}
