import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { ApartmentsSection, getApartments } from '@/components/sections/apartments-section'
import { QuartiersSection } from '@/components/sections/quartiers-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ServicesSection } from '@/components/sections/services-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { BlogSection } from '@/components/sections/blog-section'
import { FaqSection } from '@/components/sections/faq-section'
import { StickyCta } from '@/components/ui/sticky-cta'
import { Footer } from '@/components/layout/footer'

export default async function Home() {
  const apartments = await getApartments()

  return (
    <>
      <main>
        <HeroSection />
        <AboutSection />
        <ApartmentsSection apartments={apartments} />
        <QuartiersSection apartments={apartments} />
        <ExperienceSection />
        <ServicesSection />
        <TestimonialsSection />
        <BlogSection />
        <FaqSection />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}
