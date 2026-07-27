import { cache } from 'react'
import {
  assetUrl,
  bloksOf,
  boolOr,
  linkHref,
  numberOr,
  richTextToPlainText,
  textOr,
  type StoryblokLinkField,
} from '@/lib/storyblok-asset'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { DEFAULT_LOCALE } from '@/lib/i18n/locale'
import { type InquiryLocale } from '@/types/inquiry'
import {
  FOOTER_DEFAULTS,
  FOOTER_DEFAULTS_EN,
  HEADER_DEFAULTS,
  HEADER_DEFAULTS_EN,
  SHARED_ASSETS_DEFAULTS,
  STICKY_CTA_DEFAULTS,
  type StoryblokFaq,
  type StoryblokFaqItem,
  type StoryblokFooter,
  type StoryblokGlobals,
  type StoryblokHeader,
  type StoryblokSharedAssets,
  type StoryblokStickyCta,
  type StoryblokTestimonial,
} from '@/lib/storyblok-globals-defaults'

export type {
  HeaderNavItem,
  HeaderQuickLink,
  StoryblokFaq,
  StoryblokFaqItem,
  StoryblokFooter,
  StoryblokGlobals,
  StoryblokHeader,
  StoryblokSharedAssets,
  StoryblokStickyCta,
  StoryblokTestimonial,
} from '@/lib/storyblok-globals-defaults'

export {
  FOOTER_DEFAULTS,
  HEADER_DEFAULTS,
  SHARED_ASSETS_DEFAULTS,
  STICKY_CTA_DEFAULTS,
} from '@/lib/storyblok-globals-defaults'

const APARTMENT_FAQ_DEFAULTS: Record<InquiryLocale, StoryblokFaq> = {
  fr: {
    eyebrow: 'FAQ',
    title: 'Questions fréquentes',
    items: [
      {
        question: 'Comment fonctionne le check-in ?',
        answer:
          'L’arrivée se fait en autonomie avec des instructions envoyées avant le séjour. L’équipe reste disponible si vous avez besoin d’aide.',
      },
      {
        question: 'Le ménage est-il inclus ?',
        answer:
          'Le ménage de départ est prévu et l’appartement est préparé avant votre arrivée pour un séjour sans logistique supplémentaire.',
      },
      {
        question: 'Puis-je réserver en direct ?',
        answer:
          'Oui. La réservation peut se faire directement sur Alto avec le même niveau d’information, un contact plus direct et un suivi plus simple.',
      },
      {
        question: 'Que comprend le prix affiché ?',
        answer:
          'Le tarif couvre le logement, le linge de maison, le Wi-Fi et l’accompagnement de l’équipe. Les conditions exactes restent précisées au moment de la réservation.',
      },
    ],
  },
  en: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    items: [
      {
        question: 'How does check-in work?',
        answer:
          'Check-in is self-service with instructions sent before your stay. The team remains available if you need help.',
      },
      {
        question: 'Is cleaning included?',
        answer:
          'End-of-stay cleaning is included, and the apartment is prepared before your arrival so the stay stays simple.',
      },
      {
        question: 'Can I book directly?',
        answer:
          'Yes. You can book directly on Alto with the same level of information, a more direct contact, and simpler follow-up.',
      },
      {
        question: 'What does the displayed price include?',
        answer:
          'The rate includes the apartment, household linen, Wi-Fi, and support from the team. Exact conditions are confirmed during booking.',
      },
    ],
  },
}

export const getStoryblokGlobals = cache(
  async (locale: InquiryLocale = DEFAULT_LOCALE): Promise<StoryblokGlobals> => {
    const [header, footer, stickyCta, sharedAssets, sharedTestimonials, apartmentFaq] =
      await Promise.all([
        getHeader(locale),
        getFooter(locale),
        getStickyCta(),
        getSharedAssets(locale),
        getSharedTestimonials(locale),
        getApartmentFaq(locale),
      ])

    return { header, footer, stickyCta, sharedAssets, sharedTestimonials, apartmentFaq }
  },
)

async function getHeader(locale: InquiryLocale): Promise<StoryblokHeader> {
  const defaults = locale === 'en' ? HEADER_DEFAULTS_EN : HEADER_DEFAULTS
  const story = await getStoryBySlug('globals/header', locale)
  const content = locale === 'en' ? {} : (story?.content ?? {})
  const descriptions = parseDescriptions(content.nav_primary_descriptions)
  const navPrimary = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.nav_primary,
  ).map((item, index) => ({
    label: textOr(item.label, defaults.navPrimary[index]?.label ?? ''),
    href: linkHref(item.link, defaults.navPrimary[index]?.href ?? '/'),
    description: descriptions[index] ?? defaults.navPrimary[index]?.description ?? '',
    opensInNewTab: boolOr(item.opens_in_new_tab, false),
  }))

  const navSecondary = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.nav_secondary,
  ).map((item, index) => ({
    label: textOr(item.label, defaults.navSecondary[index]?.label ?? ''),
    href: linkHref(item.link, defaults.navSecondary[index]?.href ?? '/'),
    opensInNewTab: boolOr(item.opens_in_new_tab, false),
  }))

  return {
    logoLight: assetUrl(content.logo_light, defaults.logoLight),
    logoDark: assetUrl(content.logo_dark, defaults.logoDark),
    bookLabel: textOr(content.book_label, defaults.bookLabel),
    mapLabel: textOr(content.map_label, defaults.mapLabel),
    navPrimary: navPrimary.length > 0 ? navPrimary : defaults.navPrimary,
    navSecondary: navSecondary.length > 0 ? navSecondary : defaults.navSecondary,
    mobileOpenLabel: textOr(content.mobile_open_label, defaults.mobileOpenLabel),
    mobileCloseLabel: textOr(content.mobile_close_label, defaults.mobileCloseLabel),
    mobileNavigationLabel: textOr(content.mobile_navigation_label, defaults.mobileNavigationLabel),
    mobileQuickAccessLabel: textOr(
      content.mobile_quick_access_label,
      defaults.mobileQuickAccessLabel,
    ),
    mobileFooterText: textOr(content.mobile_footer_text, defaults.mobileFooterText),
    mobileFooterButtonLabel: textOr(
      content.mobile_footer_button_label,
      defaults.mobileFooterButtonLabel,
    ),
    mobileFooterButtonHref: linkHref(
      content.mobile_footer_button_link as StoryblokLinkField,
      defaults.mobileFooterButtonHref,
    ),
  }
}

async function getFooter(locale: InquiryLocale): Promise<StoryblokFooter> {
  const defaults = locale === 'en' ? FOOTER_DEFAULTS_EN : FOOTER_DEFAULTS
  const story = await getStoryBySlug('globals/footer', locale)
  const content = locale === 'en' ? {} : (story?.content ?? {})

  const ctaButtonBlok = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.cta_button,
  )[0]
  const ctaButton = ctaButtonBlok
    ? {
        label: textOr(ctaButtonBlok.label, defaults.ctaButton?.label ?? ''),
        href: linkHref(ctaButtonBlok.link, defaults.ctaButton?.href ?? '/'),
        opensInNewTab: boolOr(ctaButtonBlok.opens_in_new_tab, false),
      }
    : defaults.ctaButton

  const navLinks = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.nav_links,
  ).map((item, index) => ({
    label: textOr(item.label, defaults.navLinks[index]?.label ?? ''),
    href: linkHref(item.link, defaults.navLinks[index]?.href ?? '/'),
    opensInNewTab: boolOr(item.opens_in_new_tab, false),
  }))

  return {
    logo: assetUrl(content.logo, defaults.logo),
    logoAriaLabel: textOr(content.logo_aria_label, defaults.logoAriaLabel),
    ctaTitle: textOr(content.cta_title, defaults.ctaTitle),
    ctaBody: textOr(content.cta_body, defaults.ctaBody),
    ctaButton,
    navLinks: navLinks.length > 0 ? navLinks : defaults.navLinks,
    copyright: textOr(content.copyright, defaults.copyright),
    navAriaLabel: textOr(content.nav_aria_label, defaults.navAriaLabel),
  }
}

async function getStickyCta(): Promise<StoryblokStickyCta> {
  const story = await getStoryBySlug('globals/sticky-cta')
  const content = story?.content ?? {}
  return {
    enabled: boolOr(content.enabled, STICKY_CTA_DEFAULTS.enabled),
    thresholdVh: numberOr(content.threshold_vh, STICKY_CTA_DEFAULTS.thresholdVh),
  }
}

async function getSharedAssets(locale: InquiryLocale): Promise<StoryblokSharedAssets> {
  const story = await getStoryBySlug('globals/shared-assets', locale)
  const content = story?.content ?? {}

  const locationAvatars = [0, 1, 2].map((i) => ({
    src: assetUrl(
      content[`location_avatar_${i + 1}`],
      SHARED_ASSETS_DEFAULTS.locationAvatars[i]?.src ?? '',
    ),
    alt: textOr(
      content[`location_avatar_${i + 1}_alt`],
      SHARED_ASSETS_DEFAULTS.locationAvatars[i]?.alt ?? '',
    ),
  }))

  const travelerAvatars = [0, 1, 2].map((i) => ({
    src: assetUrl(
      content[`traveler_avatar_${i + 1}`],
      SHARED_ASSETS_DEFAULTS.travelerAvatars[i]?.src ?? '',
    ),
    alt: textOr(
      content[`traveler_avatar_${i + 1}_alt`],
      SHARED_ASSETS_DEFAULTS.travelerAvatars[i]?.alt ?? '',
    ),
  }))

  return {
    locationAvatars,
    travelerAvatars,
    footerBackground: assetUrl(content.footer_background, SHARED_ASSETS_DEFAULTS.footerBackground),
  }
}

async function getSharedTestimonials(locale: InquiryLocale): Promise<StoryblokTestimonial[]> {
  if (locale === 'en') return []
  const story = await getStoryBySlug('globals/shared-testimonials', locale)
  return mapTestimonials(story?.content?.items)
}

export function mapTestimonials(value: unknown): StoryblokTestimonial[] {
  return bloksOf<{ quote?: unknown; name?: unknown; apartment?: unknown; stay?: unknown }>(
    value,
  ).map((item) => ({
    quote: textOr(item.quote, ''),
    name: textOr(item.name, ''),
    apartment: textOr(item.apartment, ''),
    stay: textOr(item.stay, ''),
  }))
}

async function getApartmentFaq(locale: InquiryLocale): Promise<StoryblokFaq> {
  if (locale === 'en') return APARTMENT_FAQ_DEFAULTS.en
  const story = await getStoryBySlug('globals/apartment-faq', locale)
  const content = story?.content
  const defaults = APARTMENT_FAQ_DEFAULTS[locale]
  if (!content) return defaults

  const items = mapFaqItems(content.items)
  return {
    eyebrow: textOr(content.eyebrow, defaults.eyebrow),
    title: textOr(content.title, defaults.title),
    items: items.length > 0 ? items : defaults.items,
  }
}

export function mapFaqItems(value: unknown): StoryblokFaqItem[] {
  return bloksOf<{ question?: unknown; answer?: unknown }>(value)
    .map((item) => {
      const question = textOr(item.question, '')
      const answer = richTextToPlainText(item.answer)
      if (!question || !answer) return null
      return { question, answer }
    })
    .filter((entry): entry is StoryblokFaqItem => entry !== null)
}

function parseDescriptions(value: unknown): string[] {
  if (typeof value !== 'string') return []
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}
