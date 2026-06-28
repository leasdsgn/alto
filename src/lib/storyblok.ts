import { storyblokInit, apiPlugin } from '@storyblok/react/rsc'
import { PageBlok } from '@/components/storyblok/page-blok'
import {
  HeroSectionBlok,
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
import {
  AboutRealitySectionBlok,
  ConceptSectionBlok,
  FoundersSectionBlok,
  GuaranteesSectionBlok,
  NotreHistoireSectionBlok,
} from '@/components/storyblok/about-bloks'
import {
  CtaSectionBlok,
  DividerSectionBlok,
  FaqSectionBlok,
  FeatureGridSectionBlok,
  ImageTextSectionBlok,
  InvestModelSectionBlok,
  InvestStatsSectionBlok,
  QuartiersSectionBlok,
  RichTextSectionBlok,
  StatsSectionBlok,
  TextSectionBlok,
} from '@/components/storyblok/shared-bloks'
import { ContactFormSectionBlok } from '@/components/storyblok/contact-bloks'
import { BlogIndexSectionBlok } from '@/components/storyblok/blog-bloks'
import {
  HomeAboutStory,
  HomeApartmentsStory,
  HomeBlogStory,
  HomeExperienceStory,
  HomeHeroStory,
  HomeServicesStory,
  HomeTestimonialsStory,
} from '@/components/storyblok/home-sections'
import { SiteImagesStory } from '@/components/storyblok/site-images-story'

export const getStoryblokApi = storyblokInit({
  accessToken:
    process.env.STORYBLOK_PREVIEW_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components: {
    page: PageBlok,
    site_images: SiteImagesStory,
    home_hero_section: HomeHeroStory,
    home_about_section: HomeAboutStory,
    home_apartments_section: HomeApartmentsStory,
    home_experience_section: HomeExperienceStory,
    home_testimonials_section: HomeTestimonialsStory,
    home_services_section: HomeServicesStory,
    home_blog_section: HomeBlogStory,
    hero_section: HeroSectionBlok,
    hero_compact_section: HeroCompactSectionBlok,
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
    image_text_section: ImageTextSectionBlok,
    feature_grid_section: FeatureGridSectionBlok,
    stats_section: StatsSectionBlok,
    cta_section: CtaSectionBlok,
    faq_section: FaqSectionBlok,
    quartiers_section: QuartiersSectionBlok,
    founders_section: FoundersSectionBlok,
    about_reality_section: AboutRealitySectionBlok,
    concept_section: ConceptSectionBlok,
    guarantees_section: GuaranteesSectionBlok,
    invest_model_section: InvestModelSectionBlok,
    invest_stats_section: InvestStatsSectionBlok,
    contact_form_section: ContactFormSectionBlok,
    blog_index_section: BlogIndexSectionBlok,
    rich_text_section: RichTextSectionBlok,
    divider_section: DividerSectionBlok,
  },
  apiOptions: {
    region: 'eu',
  },
})
