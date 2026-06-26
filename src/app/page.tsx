import { StoryblokStory } from '@storyblok/react/rsc'
import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { ApartmentsSection, getApartments } from '@/components/sections/apartments-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { BlogSection } from '@/components/sections/blog-section'
import { StickyCta } from '@/components/ui/sticky-cta'
import { Footer } from '@/components/layout/footer'
import { getServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'

export default async function Home() {
  const locale = await getServerLocale()
  const story = await getStoryBySlug('pages/home', locale)

  if (story && Array.isArray((story.content as { body?: unknown }).body) && (story.content as { body: unknown[] }).body.length > 0) {
    return (
      <>
        <StoryblokStory story={story} />
        <Footer reserveStickyCtaSpace />
        <StickyCta />
      </>
    )
  }

  const [apartments, blogArticles, globals] = await Promise.all([
    getApartments(),
    getBlogArticles(locale),
    getStoryblokGlobals(locale),
  ])

  return (
    <>
      <main>
        <HeroSection
          backgroundImage="/images/hero-room.png"
          overlayImage="/images/hero-overlay.png"
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
            checkout: '/images/blog-3.jpg',
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
