import { storyblokEditable } from '@storyblok/react/rsc'
import { ApartmentsSection, getApartments } from '@/components/sections/apartments-section'
import { getBlogArticles } from '@/lib/storyblok-blog'
import { textOr } from '@/lib/storyblok-asset'
import { getServerLocale } from '@/lib/i18n/server'
import { BlogGridSectionBlok } from '@/components/storyblok/section-bloks'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

export async function ApartmentsGridSectionBlok({ blok }: { blok: Blok }) {
  const apartments = await getApartments()
  const cityFilter = textOr(blok.city_filter, 'all')
  const maxPerCity = typeof blok.max_per_city === 'number' ? blok.max_per_city : 0
  const filtered =
    cityFilter === 'all'
      ? apartments
      : apartments.filter((apt) => normalize(apt.city).includes(cityFilter))

  const final =
    maxPerCity > 0
      ? capPerCity(filtered, maxPerCity)
      : filtered

  return (
    <div {...editable(blok)}>
      <ApartmentsSection
        apartments={final}
        titles={{
          paris: textOr(blok.paris_title, 'Nos appartements à Paris'),
          lyon: textOr(blok.lyon_title, 'Nos appartements à Lyon'),
        }}
      />
    </div>
  )
}

export async function BlogGridSectionAsyncBlok({ blok }: { blok: Blok }) {
  const locale = await getServerLocale()
  const articles = await getBlogArticles(locale)
  return <BlogGridSectionBlok blok={blok} articles={articles} />
}

function normalize(value: string | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function capPerCity<T extends { city?: string }>(items: T[], max: number) {
  const seen: Record<string, number> = {}
  const out: T[] = []
  for (const item of items) {
    const key = normalize(item.city)
    seen[key] = (seen[key] ?? 0) + 1
    if (seen[key] <= max) out.push(item)
  }
  return out
}
