import { StoryblokStory } from '@storyblok/react/rsc'
import { BlogIndex } from '@/components/blog/blog-index'
import { Footer } from '@/components/layout/footer'
import { ApartmentsSection, getApartments } from '@/components/sections/apartments-section'
import { ServicesSection } from '@/components/sections/services-section'
import { BLOG_PAGE_COPY, buildBlogEditorialSections } from '@/lib/blog-page'
import { getServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getSiteImages } from '@/lib/storyblok-site-images'
import { getStoryBySlug } from '@/lib/storyblok-page'

export default async function BlogPage() {
  const locale = await getServerLocale()
  const story = await getStoryBySlug('pages/blog', locale)

  if (
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0
  ) {
    return (
      <>
        <StoryblokStory story={story} />
        <Footer />
      </>
    )
  }

  const [articles, apartments, siteImages] = await Promise.all([
    getBlogArticles(locale),
    getApartments(),
    getSiteImages(locale),
  ])
  const sections = buildBlogEditorialSections(locale, articles)

  return (
    <>
      <BlogIndex
        copy={BLOG_PAGE_COPY[locale]}
        sections={sections}
        locationAvatars={siteImages.shared.locationAvatars}
        travelerAvatars={siteImages.shared.travelerAvatars}
        storyCardImages={[siteImages.blog.storyArrival, siteImages.blog.storyCheckin]}
      />
      <div className="bg-cream">
        <ServicesSection />
        <ApartmentsSection apartments={apartments} />
      </div>
      <Footer />
    </>
  )
}
