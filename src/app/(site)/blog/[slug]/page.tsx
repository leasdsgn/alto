import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArticleView } from '@/components/blog/article-view'
import { Footer } from '@/components/layout/footer'
import { ApartmentsSection, getApartments } from '@/components/sections/apartments-section'
import { getBlogEditorialMeta } from '@/lib/blog-page'
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/locale'
import { getBlogArticles } from '@/lib/storyblok-blog'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const articles = await getBlogArticles(locale)
  const apartments = await getApartments()
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
