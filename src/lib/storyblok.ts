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
} from '@/components/storyblok/data-bloks'

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
  },
  apiOptions: {
    region: 'eu',
  },
})
