import { storyblokInit, apiPlugin } from '@storyblok/react/rsc'
import { PageBlok } from '@/components/storyblok/page-blok'
import {
  HeroSectionBlok,
  HomeAboutSectionBlok,
  PanelsSectionBlok,
  TestimonialsSectionBlok,
  ServicesSectionBlok,
  HeroCompactSectionBlok,
} from '@/components/storyblok/section-bloks'
import {
  ApartmentsGridSectionBlok,
  BlogGridSectionAsyncBlok,
  LyonBlogSectionAsyncBlok,
} from '@/components/storyblok/data-bloks'
import {
  LyonHeroSectionBlok,
  LyonQuartiersSectionBlok,
  LyonServicesSectionBlok,
  LyonStatsSectionBlok,
} from '@/components/storyblok/lyon-bloks'
import { NotreHistoireSectionBlok } from '@/components/storyblok/about-bloks'
import {
  CtaSectionBlok,
  FaqSectionBlok,
  InvestModelSectionBlok,
  InvestStatsSectionBlok,
  TextSectionBlok,
} from '@/components/storyblok/shared-bloks'
import { ContactFormSectionBlok } from '@/components/storyblok/contact-bloks'
import { BlogIndexSectionBlok } from '@/components/storyblok/blog-bloks'

export const getStoryblokApi = storyblokInit({
  accessToken:
    process.env.STORYBLOK_PREVIEW_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components: {
    page: PageBlok,
    hero_section: HeroSectionBlok,
    hero_compact_section: HeroCompactSectionBlok,
    home_about_section: HomeAboutSectionBlok,
    apartments_grid_section: ApartmentsGridSectionBlok,
    panels_section: PanelsSectionBlok,
    testimonials_section: TestimonialsSectionBlok,
    services_section: ServicesSectionBlok,
    blog_grid_section: BlogGridSectionAsyncBlok,
    lyon_hero_section: LyonHeroSectionBlok,
    lyon_stats_section: LyonStatsSectionBlok,
    lyon_services_section: LyonServicesSectionBlok,
    lyon_quartiers_section: LyonQuartiersSectionBlok,
    lyon_blog_section: LyonBlogSectionAsyncBlok,
    notre_histoire_section: NotreHistoireSectionBlok,
    text_section: TextSectionBlok,
    cta_section: CtaSectionBlok,
    faq_section: FaqSectionBlok,
    invest_model_section: InvestModelSectionBlok,
    invest_stats_section: InvestStatsSectionBlok,
    contact_form_section: ContactFormSectionBlok,
    blog_index_section: BlogIndexSectionBlok,
  },
  apiOptions: {
    region: 'eu',
  },
})
