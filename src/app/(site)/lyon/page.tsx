import { LyonHeroSection } from '@/components/sections/lyon-hero-section'
import { StatsSection } from '@/components/sections/stats-section'
import { LyonApartmentsSection } from '@/components/sections/lyon-apartments-section'
import { getApartmentsForSearch } from '@/components/sections/apartments-section'
import { LyonServicesSection } from '@/components/sections/lyon-services-section'
import { LyonQuartiersSection } from '@/components/sections/lyon-quartiers-section'
import { LyonBlogSection } from '@/components/sections/lyon-blog-section'
import { FaqSection } from '@/components/sections/faq-section'
import { Footer } from '@/components/layout/footer'
import { StickyCta } from '@/components/ui/sticky-cta'
import { getServerLocale } from '@/lib/i18n/server'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getSiteImages } from '@/lib/storyblok-site-images'

export const metadata = {
  title: 'Alto Lyon - Appartements de charme à Lyon',
  description: 'Découvrez nos appartements soignés dans les plus beaux quartiers de Lyon : Bellecour, Vieux Lyon, Terreaux.',
}

export default async function LyonPage() {
  const locale = await getServerLocale()
  const [articles, lyonApartments, siteImages] = await Promise.all([
    getBlogArticles(locale),
    getApartmentsForSearch({ city: 'lyon' }),
    getSiteImages(locale),
  ])

  return (
    <>
      <main>
        <LyonHeroSection backgroundImage={siteImages.lyon.heroBackground} />
        <StatsSection
          pressLogo={siteImages.lyon.pressLogo}
          monocleLogo={siteImages.lyon.monocleLogo}
        />
        <LyonApartmentsSection apartments={lyonApartments.slice(0, 3)} />
        <LyonServicesSection image={siteImages.lyon.servicesImage} />
        <LyonQuartiersSection
          images={{
            bellecour: siteImages.lyon.bellecour,
            vieuxLyon: siteImages.lyon.vieuxLyon,
            terreaux: siteImages.lyon.terreaux,
          }}
        />
        <LyonBlogSection articles={articles.filter((article) => article.section === 'lyon')} />
        <FaqSection />
      </main>
      <Footer reserveStickyCtaSpace />
      <StickyCta />
    </>
  )
}
