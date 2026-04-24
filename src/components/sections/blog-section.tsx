import Image from 'next/image'
import Link from 'next/link'
import { BLOG_ARTICLES } from '@/lib/blog-data'

export function BlogSection() {
  const articles = BLOG_ARTICLES.slice(0, 4)

  return (
    <section className="bg-silver">
      <div className="mx-auto max-w-content px-gutter pt-section pb-section-md md:px-gutter-md">
        <div className="border-cream rounded-lg border p-6 md:p-12">
          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="flex flex-col gap-6 lg:justify-between">
              <div>
                <p className="text-cream text-xs font-bold tracking-[0.24px] uppercase">Le blog</p>

                <h2 className="text-cream mt-4 max-w-[266px] text-xl leading-[1.5] font-bold tracking-[-0.4px] md:text-h5 md:tracking-[-0.44px]">
                  Nos conseils pour améliorer votre voyage
                </h2>
              </div>

              <p className="text-cream max-w-[346px] text-base leading-[1.5]">
                Depuis 2016 nous aidons les voyageurs à vivre les meilleures expériences possible
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {articles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  title={article.title}
                  image={article.image}
                  href={`/blog/${article.slug}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArticleCard({ title, image, href }: { title: string; image: string; href: string }) {
  return (
    <Link href={href} className="group relative block h-[180px] overflow-hidden rounded-lg md:h-[274px]">
      <Image src={image} alt={title} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
      <div className="to-coffee absolute inset-0 rounded-lg bg-gradient-to-b from-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3 className="text-cream text-base leading-[1.4] font-bold md:text-h5 md:leading-[1.5] md:tracking-[-0.44px]">
          {title}
        </h3>
      </div>
    </Link>
  )
}
