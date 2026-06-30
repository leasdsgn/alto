import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleView } from '@/components/blog/article-view'
import { Footer } from '@/components/layout/footer'
import { ApartmentsSection, getApartmentCards } from '@/components/sections/apartments-section'
import { getBlogEditorialMeta } from '@/lib/blog-page'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const locale = getStaticServerLocale()
  const articles = await getBlogArticles(locale)
  const article = articles.find((entry) => entry.slug === slug)

  if (!article) {
    return {
      title: 'Article introuvable | Alto',
      description: 'Cet article n’est pas disponible.',
    }
  }

  const title = `${article.title} | Alto`
  const description = article.subtitle

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: article.heroImage ?? article.image }],
      type: 'article',
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = getStaticServerLocale()
  const articles = await getBlogArticles(locale)
  const apartments = await getApartmentCards()
  const article = articles.find((entry) => entry.slug === slug)

  if (!article) notFound()

  const relatedArticles = pickRelatedArticles(article.slug, article.section, articles)
  const cta = getBlogEditorialMeta(locale, article.section)

  return (
    <>
      <ArticleView article={article} locale={locale} relatedArticles={relatedArticles} cta={cta} />
      <div className="bg-cream">
        <ApartmentsSection apartments={apartments} />
      </div>
      <Footer />
    </>
  )
}

function pickRelatedArticles(
  slug: string,
  section: string,
  articles: Awaited<ReturnType<typeof getBlogArticles>>,
) {
  const related = articles.filter((article) => article.slug !== slug && article.section === section)
  const fallback = articles.filter(
    (article) => article.slug !== slug && article.section !== section,
  )

  return [...related, ...fallback].slice(0, 2)
}
