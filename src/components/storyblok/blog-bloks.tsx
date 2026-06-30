import { storyblokEditable } from '@storyblok/react/rsc'
import { BlogIndex } from '@/components/blog/blog-index'
import { BLOG_PAGE_COPY, buildBlogEditorialSections } from '@/lib/blog-page'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getStaticServerLocale } from '@/lib/i18n/server'
import { assetUrl } from '@/lib/storyblok-asset'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

export async function BlogIndexSectionBlok({ blok }: { blok: Blok }) {
  const locale = getStaticServerLocale()
  const [articles, globals] = await Promise.all([
    getBlogArticles(locale),
    getStoryblokGlobals(locale),
  ])
  const sections = buildBlogEditorialSections(locale, articles)

  return (
    <div {...editable(blok)}>
      <BlogIndex
        copy={BLOG_PAGE_COPY[locale]}
        sections={sections}
        locationAvatars={globals.sharedAssets.locationAvatars.map((asset) => asset.src)}
        travelerAvatars={globals.sharedAssets.travelerAvatars.map((asset) => asset.src)}
        storyCardImages={[
          assetUrl(blok.story_arrival_image, '/images/alto-salon.jpg'),
          assetUrl(blok.story_checkin_image, '/images/blog-3.jpg'),
        ]}
      />
    </div>
  )
}
