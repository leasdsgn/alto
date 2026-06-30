import { storyblokEditable } from '@storyblok/react/rsc'
import Image from 'next/image'
import Link from 'next/link'
import { AboutView, type AboutViewImages } from '@/components/about/about-view'
import {
  assetAlt,
  assetUrl,
  bloksOf,
  linkHref,
  linkTarget,
  textOr,
  type StoryblokLinkField,
} from '@/lib/storyblok-asset'
import { PLACEHOLDER_IMAGE } from '@/lib/storyblok-defaults'
import { getStoryblokGlobals } from '@/lib/storyblok-globals'
import { getStaticServerLocale } from '@/lib/i18n/server'

type Blok = Record<string, unknown>
type Editable = Parameters<typeof storyblokEditable>[0]

const editable = (blok: Blok) => storyblokEditable(blok as Editable)

export async function NotreHistoireSectionBlok({ blok }: { blok: Blok }) {
  const locale = getStaticServerLocale()
  const globals = await getStoryblokGlobals(locale)
  const locationAvatars = globals.sharedAssets.locationAvatars
  const travelerAvatars = globals.sharedAssets.travelerAvatars
  const siteImages: AboutViewImages = {
    shared: {
      locationAvatars: [
        locationAvatars[0]?.src ?? '/images/blog-1.jpg',
        locationAvatars[1]?.src ?? '/images/hero-home.webp',
        locationAvatars[2]?.src ?? '/images/blog-3.jpg',
      ],
      travelerAvatars: [
        travelerAvatars[0]?.src ?? '/images/avatars/voyageur-1.png',
        travelerAvatars[1]?.src ?? '/images/avatars/voyageur-2.png',
        travelerAvatars[2]?.src ?? '/images/avatars/voyageur-3.png',
      ],
    },
    about: {
      conceptLounge: assetUrl(blok.hero_image, '/images/about/about-hero.webp'),
      conceptChair: assetUrl(blok.concept_image, PLACEHOLDER_IMAGE),
      conceptCorridor: assetUrl(blok.guarantees_image, '/images/about/concept-corridor.jpg'),
      founders: {
        paul: assetUrl(blok.founder_paul_image, '/images/about/founder-paul.jpg'),
        mayeul: assetUrl(blok.founder_mayeul_image, '/images/about/founder-mayeul.jpg'),
        benjamin: assetUrl(blok.founder_benjamin_image, '/images/about/founder-benjamin.jpg'),
      },
    },
  }

  return (
    <div {...editable(blok)}>
      <AboutView siteImages={siteImages} />
    </div>
  )
}

export function FoundersSectionBlok({ blok }: { blok: Blok }) {
  const founders = bloksOf<{ name?: unknown; role?: unknown; image?: unknown; alt?: unknown }>(
    blok.founders,
  )
  const href = linkHref(blok.link_url as StoryblokLinkField, '')
  const target = linkTarget(blok.link_url)

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          {blok.eyebrow ? (
            <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
              {textOr(blok.eyebrow, '')}
            </p>
          ) : null}
          <h2 className="text-coffee text-h3 mt-2 font-medium">{textOr(blok.title, '')}</h2>
          {blok.body ? (
            <p className="text-taupe mt-5 text-sm leading-relaxed">{textOr(blok.body, '')}</p>
          ) : null}
          {href && blok.link_label ? (
            <Link
              href={href}
              target={target}
              rel={target === '_blank' ? 'noopener noreferrer' : undefined}
              className="text-coffee mt-8 inline-flex text-sm font-bold underline"
            >
              {textOr(blok.link_label, '')}
            </Link>
          ) : null}
        </div>

        {founders.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {founders.map((founder, index) => (
              <article key={`${founder.name}-${index}`} {...editable(founder as Blok)}>
                <div className="bg-sand relative aspect-[4/5] overflow-hidden rounded-lg">
                  <Image
                    src={assetUrl(founder.image, PLACEHOLDER_IMAGE)}
                    alt={textOr(founder.alt, textOr(founder.name, ''))}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-coffee mt-4 text-base font-bold">{textOr(founder.name, '')}</h3>
                {founder.role ? (
                  <p className="text-taupe mt-1 text-sm">{textOr(founder.role, '')}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function AboutRealitySectionBlok({ blok }: { blok: Blok }) {
  const paragraphs = splitParagraphs(blok.paragraphs)

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className="max-w-[760px]">
        <h2 className="text-coffee text-h3 font-medium">{textOr(blok.title, '')}</h2>
        {paragraphs.length > 0 ? (
          <div className="mt-8 space-y-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-taupe text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function ConceptSectionBlok({ blok }: { blok: Blok }) {
  const points = bloksOf<{ title?: unknown; description?: unknown }>(blok.points)

  return (
    <section
      {...editable(blok)}
      className="max-w-content px-gutter md:px-gutter-md py-section md:py-section-md mx-auto"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-coffee text-h3 font-medium">{textOr(blok.title, '')}</h2>
          {points.length > 0 ? (
            <div className="mt-8 space-y-6">
              {points.map((point, index) => (
                <div
                  key={`${point.title}-${index}`}
                  {...editable(point as Blok)}
                  className="border-divider border-t pt-5"
                >
                  <h3 className="text-coffee text-base font-bold">{textOr(point.title, '')}</h3>
                  {point.description ? (
                    <p className="text-taupe mt-2 text-sm leading-relaxed">
                      {textOr(point.description, '')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="bg-sand relative aspect-[4/5] overflow-hidden rounded-lg">
          <Image
            src={assetUrl(blok.image, PLACEHOLDER_IMAGE)}
            alt={textOr(blok.image_alt, assetAlt(blok.image, ''))}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export function GuaranteesSectionBlok({ blok }: { blok: Blok }) {
  const items = bloksOf<{ icon?: unknown; title?: unknown; description?: unknown }>(blok.items)

  return (
    <section {...editable(blok)} className="bg-sand py-section md:py-section-md">
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto grid grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="bg-cream relative aspect-[4/5] overflow-hidden rounded-lg">
          <Image
            src={assetUrl(blok.image, PLACEHOLDER_IMAGE)}
            alt={assetAlt(blok.image, '')}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          {blok.eyebrow ? (
            <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
              {textOr(blok.eyebrow, '')}
            </p>
          ) : null}
          {blok.title ? (
            <h2 className="text-coffee text-h3 mt-2 font-medium">{textOr(blok.title, '')}</h2>
          ) : null}
          {items.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {items.map((item, index) => {
                const icon = assetUrl(item.icon, '')
                return (
                  <article
                    key={`${item.title}-${index}`}
                    {...editable(item as Blok)}
                    className="border-divider border-t pt-5"
                  >
                    {icon ? (
                      <Image src={icon} alt="" width={24} height={24} className="mb-4 h-6 w-6" />
                    ) : null}
                    <h3 className="text-coffee text-base font-bold">{textOr(item.title, '')}</h3>
                    {item.description ? (
                      <p className="text-taupe mt-2 text-sm leading-relaxed">
                        {textOr(item.description, '')}
                      </p>
                    ) : null}
                  </article>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function splitParagraphs(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}
