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
import { getStoryblokVersion } from '@/lib/storyblok-preview'
import { getStoryblokApi } from '@/lib/storyblok'
import { getSiteImages } from '@/lib/storyblok-site-images'

export default async function Home() {
  const locale = await getServerLocale()
  const story = await getHomeStory(locale)

  if (story) return <StoryblokStory story={story} />

  const [apartments, blogArticles, siteImages] = await Promise.all([
    getApartments(),
    getBlogArticles(locale),
    getSiteImages(locale),
  ])

  return (
    <>
      <main>
        <HeroSection
          backgroundImage={siteImages.home.heroBackground}
          overlayImage={siteImages.home.heroOverlay}
        />
        <AboutSection
          locationAvatars={siteImages.shared.locationAvatars}
          travelerAvatars={siteImages.shared.travelerAvatars}
        />
        <ApartmentsSection apartments={apartments} />
        <ExperienceSection panelImages={siteImages.home.experience} />
        <TestimonialsSection />
        <ServicesSection />
        <BlogSection articles={blogArticles} />
      </main>
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}

async function getHomeStory(locale: string) {
  try {
    const storyblokApi = getStoryblokApi()
    const version = await getStoryblokVersion()
    const { data } = await storyblokApi.get('cdn/stories/site-images', {
      version,
      language: locale,
      fallback_lang: 'fr',
    })

    return data.story
  } catch {
    return null
  }
}
