import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { ApartmentsSection, getApartments } from '@/components/sections/apartments-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { BlogSection } from '@/components/sections/blog-section'
import { StickyCta } from '@/components/ui/sticky-cta'
import { Footer } from '@/components/layout/footer'
import { GuestySearchWidget } from '@/components/ui/guesty-search-widget'
import { getServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getSiteImages } from '@/lib/storyblok-site-images'

export default async function Home() {
  const locale = await getServerLocale()
  const [apartments, blogArticles, siteImages] = await Promise.all([
    getApartments(),
    getBlogArticles(locale),
    getSiteImages(locale),
  ])

  return (
    <>
      <main {...siteImages.editable}>
        <HeroSection
          backgroundImage={siteImages.home.heroBackground}
          overlayImage={siteImages.home.heroOverlay}
        />
        <AboutSection
          locationAvatars={siteImages.shared.locationAvatars}
          travelerAvatars={siteImages.shared.travelerAvatars}
        />
        <ApartmentsSection apartments={apartments} />
        <ExperienceSection
          panelImages={siteImages.home.experience}
        />
        <TestimonialsSection />
        <ServicesSection />
        <BlogSection articles={blogArticles} />
        <GuestySearchWidget />
      </main>
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}
