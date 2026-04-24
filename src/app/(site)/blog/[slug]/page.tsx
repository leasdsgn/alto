import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/locale'
import { getBlogArticle } from '@/lib/storyblok-blog'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cookieStore = await cookies()
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const article = await getBlogArticle(slug, locale)

  if (!article) notFound()

  return (
    <>
      <div className="relative h-[422px] overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
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
            <h1 className="text-cream text-base font-bold leading-[24px]">{article.title}</h1>
            <p className="text-cream/80 mt-2 max-w-[505px] text-xs font-medium leading-[20px]">
              {article.subtitle}
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
        <article className="max-w-[616px]">
          {article.sections.map((section, i) => (
            <div key={`${section.heading}-${i}`} className={i > 0 ? 'mt-12' : ''}>
              <p className="text-coffee text-base font-bold leading-[20px]">{section.heading}</p>

              {section.label && (
                <p className="text-silver mt-6 text-xs font-bold uppercase tracking-[0.24px]">{section.label}</p>
              )}

              {section.body.split('\n\n').map((para, j) => (
                <p key={`${para}-${j}`} className="text-coffee mt-4 text-xs font-medium leading-[22px] first:mt-4">{para}</p>
              ))}
            </div>
          ))}
        </article>
      </main>

      <Footer />
    </>
  )
}
