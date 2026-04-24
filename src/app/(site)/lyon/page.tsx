import { LyonHeroSection } from '@/components/sections/lyon-hero-section'
import { StatsSection } from '@/components/sections/stats-section'
import { LyonApartmentsSection } from '@/components/sections/lyon-apartments-section'
import { LyonServicesSection } from '@/components/sections/lyon-services-section'
import { LyonQuartiersSection } from '@/components/sections/lyon-quartiers-section'
import { LyonBlogSection } from '@/components/sections/lyon-blog-section'
import { FaqSection } from '@/components/sections/faq-section'
import { Footer } from '@/components/layout/footer'
import { StickyCta } from '@/components/ui/sticky-cta'

export const metadata = {
  title: 'Alto Lyon - Appartements de charme à Lyon',
  description: 'Découvrez nos appartements soignés dans les plus beaux quartiers de Lyon : Bellecour, Vieux Lyon, Terreaux.',
}

export default function LyonPage() {
  return (
    <>
      <main>
        <LyonHeroSection />
        <StatsSection />
        <LyonApartmentsSection />
        <LyonServicesSection />
        <LyonQuartiersSection />
        <LyonBlogSection />
        <FaqSection />
      </main>
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}
