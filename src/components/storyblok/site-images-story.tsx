import { StoryblokServerComponent, storyblokEditable } from '@storyblok/react/rsc'
import { Footer } from '@/components/layout/footer'
import { AboutSection } from '@/components/sections/about-section'
import { ApartmentsSection, getApartmentCards } from '@/components/sections/apartments-section'
import { BlogSection } from '@/components/sections/blog-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { HeroSection } from '@/components/sections/hero-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { StickyCta } from '@/components/ui/sticky-cta'
import { getServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { mapSiteImagesContent } from '@/lib/storyblok-site-images'

type SiteImagesBlok = Record<string, unknown>
type StoryblokEditableBlok = Parameters<typeof storyblokEditable>[0]

export async function SiteImagesStory({ blok }: { blok: SiteImagesBlok }) {
  const locale = await getServerLocale()
  const siteImages = mapSiteImagesContent(blok)
  const sections = getSections(blok.sections)

  if (sections.length > 0) {
    return (
      <>
        <main {...storyblokEditable(blok as StoryblokEditableBlok)}>
          {sections.map((section) => (
            <StoryblokServerComponent key={String(section._uid)} blok={section} />
          ))}
        </main>
        <Footer reserveStickyCtaSpace />
        <StickyCta />
      </>
    )
  }

  const [apartments, blogArticles] = await Promise.all([
    getApartmentCards(),
    getBlogArticles(locale, 'draft'),
  ])

  return (
    <>
      <main {...storyblokEditable(blok as StoryblokEditableBlok)}>
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

function getSections(value: unknown): SiteImagesBlok[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is SiteImagesBlok => Boolean(item && typeof item === 'object'))
}
