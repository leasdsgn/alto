import { storyblokEditable } from '@storyblok/react/rsc'
import { AboutView } from '@/components/about/about-view'
import { getSiteImages } from '@/lib/storyblok-site-images'
import { getStaticServerLocale } from '@/lib/i18n/server'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

export async function NotreHistoireSectionBlok({ blok }: { blok: Blok }) {
  const locale = getStaticServerLocale()
  const siteImages = await getSiteImages(locale)

  return (
    <div {...editable(blok)}>
      <AboutView siteImages={siteImages} />
    </div>
  )
}
