import type { Metadata } from 'next'
import { StoryblokStory } from '@storyblok/react/rsc'
import { BlogIndex } from '@/components/blog/blog-index'
import { Footer } from '@/components/layout/footer'
import { ApartmentsSection, getApartmentCards } from '@/components/sections/apartments-section'
import { ServicesSection } from '@/components/sections/services-section'
import { BLOG_PAGE_COPY, buildBlogEditorialSections } from '@/lib/blog-page'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { getStoryblokBlogMetadata } from '@/lib/storyblok-seo'

const BLOG_METADATA: Record<'fr' | 'en', Metadata> = {
  fr: {
    title: 'Journal | Alto',
    description:
      'Conseils de ville, idées de séjour et repères pratiques pour préparer votre voyage à Paris ou Lyon.',
  },
  en: {
    title: 'Journal | Alto',
    description:
      'City notes, stay ideas and practical references to prepare your trip to Paris or Lyon.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getStaticServerLocale()
  return getStoryblokBlogMetadata(locale, BLOG_METADATA[locale])
}

export default async function BlogPage() {
  const locale = getStaticServerLocale()
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

  const [articles, apartments, globals] = await Promise.all([
    getBlogArticles(locale),
    getApartmentCards(),
    getStoryblokGlobals(locale),
  ])
  const sections = buildBlogEditorialSections(locale, articles)

  return (
    <>
      <BlogIndex
        copy={BLOG_PAGE_COPY[locale]}
        sections={sections}
        locationAvatars={globals.sharedAssets.locationAvatars.map((avatar) => avatar.src)}
        travelerAvatars={globals.sharedAssets.travelerAvatars.map((avatar) => avatar.src)}
        storyCardImages={BLOG_FALLBACK_STORY_IMAGES}
      />
      <div className="bg-cream">
        <ServicesSection />
        <ApartmentsSection apartments={apartments} />
      </div>
      <Footer />
    </>
  )
}

const BLOG_FALLBACK_STORY_IMAGES = ['/images/alto-salon.jpg', '/images/blog-3.jpg'] as const
