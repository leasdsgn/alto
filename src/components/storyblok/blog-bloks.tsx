import { storyblokEditable } from '@storyblok/react/rsc'
import { BlogIndex } from '@/components/blog/blog-index'
import { BLOG_PAGE_COPY, buildBlogEditorialSections } from '@/lib/blog-page'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getSiteImages } from '@/lib/storyblok-site-images'
import { getServerLocale } from '@/lib/i18n/server'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

export async function BlogIndexSectionBlok({ blok }: { blok: Blok }) {
  const locale = await getServerLocale()
  const [articles, siteImages] = await Promise.all([
    getBlogArticles(locale),
    getSiteImages(locale),
  ])
  const sections = buildBlogEditorialSections(locale, articles)

  return (
    <div {...editable(blok)}>
      <BlogIndex
        copy={BLOG_PAGE_COPY[locale]}
        sections={sections}
        locationAvatars={siteImages.shared.locationAvatars}
        travelerAvatars={siteImages.shared.travelerAvatars}
        storyCardImages={[siteImages.blog.storyArrival, siteImages.blog.storyCheckin]}
      />
    </div>
  )
}
