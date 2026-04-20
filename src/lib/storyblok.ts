import { storyblokInit, apiPlugin } from '@storyblok/react/rsc'

export function initStoryblok() {
  storyblokInit({
    accessToken: process.env.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
    apiOptions: {
      region: 'eu',
    },
  })
}

export { getStoryblokApi } from '@storyblok/react/rsc'
