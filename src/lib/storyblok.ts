import { storyblokInit, apiPlugin } from '@storyblok/react/rsc'
import { SiteImagesStory } from '@/components/storyblok/site-images-story'

export const getStoryblokApi = storyblokInit({
  accessToken:
    process.env.STORYBLOK_PREVIEW_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_PREVIEW_TOKEN ||
    process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
  use: [apiPlugin],
  components: {
    site_images: SiteImagesStory,
  },
  apiOptions: {
    region: 'eu',
  },
})
