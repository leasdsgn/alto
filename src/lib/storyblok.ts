import { storyblokInit, apiPlugin } from '@storyblok/react/rsc'
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
    site_images: SiteImagesStory,
    home_hero_section: HomeHeroStory,
    home_about_section: HomeAboutStory,
    home_apartments_section: HomeApartmentsStory,
    home_experience_section: HomeExperienceStory,
    home_testimonials_section: HomeTestimonialsStory,
    home_services_section: HomeServicesStory,
    home_blog_section: HomeBlogStory,
  },
  apiOptions: {
    region: 'eu',
  },
})
