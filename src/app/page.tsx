import type { Metadata } from 'next'
import { StoryblokStory } from '@storyblok/react/rsc'
import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { ApartmentsSection, getApartmentCards } from '@/components/sections/apartments-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { BlogSection } from '@/components/sections/blog-section'
import { StickyCta } from '@/components/ui/sticky-cta'
import { Footer } from '@/components/layout/footer'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getStoryblokPageMetadata } from '@/lib/storyblok-seo'

const HOME_METADATA: Record<'fr' | 'en', Metadata> = {
  fr: {
    title: 'Alto - Location courte durée haut de gamme',
    description: 'Appartements de luxe en location courte durée à Paris et Lyon.',
  },
  en: {
    title: 'Alto - High-end short-term rentals',
    description: 'Luxury short-term rental apartments in Paris and Lyon.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = getStaticServerLocale()
  return getStoryblokPageMetadata('pages/home', locale, HOME_METADATA[locale])
}

export default async function Home() {
  const locale = getStaticServerLocale()
  const story = await getStoryBySlug('pages/home', locale)

  if (
    story &&
    Array.isArray((story.content as { body?: unknown }).body) &&
    (story.content as { body: unknown[] }).body.length > 0
  ) {
    return (
      <>
        <StoryblokStory story={story} />
        <Footer reserveStickyCtaSpace />
        <StickyCta />
      </>
    )
  }

  const [apartments, blogArticles, globals] = await Promise.all([
    getApartmentCards(),
    getBlogArticles(locale),
    getStoryblokGlobals(locale),
  ])

  return (
    <>
      <main>
        <HeroSection
          backgroundImage="/images/hero-room.webp"
          overlayImage="/images/hero-overlay.webp"
        />
        <AboutSection
          locationAvatars={globals.sharedAssets.locationAvatars.map((a) => a.src)}
          travelerAvatars={globals.sharedAssets.travelerAvatars.map((a) => a.src)}
        />
        <ApartmentsSection apartments={apartments} />
        <ExperienceSection
          panelImages={{
            arrival: '/images/experience-espaces.png',
            checkin: '/images/experience-localisation.png',
            checkout: '/images/experience-confort.webp',
            sustainability: '/images/experience-durabilite.webp',
          }}
        />
        <TestimonialsSection />
        <ServicesSection />
        <BlogSection articles={blogArticles} />
      </main>
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}
