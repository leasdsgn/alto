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

export default async function Home() {
  const apartments = await getApartments()

  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <ApartmentsSection apartments={apartments} />
        <ExperienceSection />
        <TestimonialsSection />
        <ServicesSection />
        <BlogSection />
        <GuestySearchWidget />
      </main>
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}
