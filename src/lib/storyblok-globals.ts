import { cache } from 'react'
import {
  assetUrl,
  bloksOf,
  boolOr,
  linkHref,
  numberOr,
  textOr,
  type StoryblokLinkField,
} from '@/lib/storyblok-asset'
import { getStoryBySlug } from '@/lib/storyblok-page'
import { SHARED_DEFAULTS } from '@/lib/storyblok-defaults'
import { DEFAULT_LOCALE } from '@/lib/i18n/locale'
import { type InquiryLocale } from '@/types/inquiry'

export interface StoryblokHeader {
  logoLight: string
  logoDark: string
  bookLabel: string
  mapLabel: string
  navPrimary: HeaderNavItem[]
  navSecondary: HeaderQuickLink[]
  mobileOpenLabel: string
  mobileCloseLabel: string
  mobileNavigationLabel: string
  mobileQuickAccessLabel: string
  mobileFooterText: string
  mobileFooterButtonLabel: string
  mobileFooterButtonHref: string
}

export interface HeaderNavItem {
  label: string
  href: string
  description: string
  opensInNewTab: boolean
}

export interface HeaderQuickLink {
  label: string
  href: string
  opensInNewTab: boolean
}

export interface StoryblokFooter {
  logo: string
  logoAriaLabel: string
  ctaTitle: string
  ctaBody: string
  ctaButton: { label: string; href: string; opensInNewTab: boolean } | null
  navLinks: HeaderQuickLink[]
  copyright: string
  navAriaLabel: string
}

export interface StoryblokStickyCta {
  enabled: boolean
  thresholdVh: number
}

export interface StoryblokSharedAssets {
  locationAvatars: { src: string; alt: string }[]
  travelerAvatars: { src: string; alt: string }[]
  footerBackground: string
}

export interface StoryblokTestimonial {
  quote: string
  name: string
  apartment: string
  stay: string
}

export interface StoryblokFaqItem {
  question: string
  answer: string
}

export interface StoryblokFaq {
  eyebrow: string
  title: string
  items: StoryblokFaqItem[]
}

export const HEADER_DEFAULTS: StoryblokHeader = {
  logoLight: '/images/logo-alto-light.png',
  logoDark: '/images/logo-alto-dark.png',
  bookLabel: 'Réserver',
  mapLabel: 'Voir la carte',
  navPrimary: [
    {
      label: 'Appartements',
      href: '/appartements',
      description: 'Paris & Lyon',
      opensInNewTab: false,
    },
    { label: 'Blog', href: '/blog', description: 'Adresses, quartiers, voyages', opensInNewTab: false },
    {
      label: 'Notre histoire',
      href: '/notre-histoire',
      description: 'L’approche Alto',
      opensInNewTab: false,
    },
  ],
  navSecondary: [
    { label: 'Paris', href: '/appartements?city=paris', opensInNewTab: false },
    { label: 'Lyon', href: '/appartements?city=lyon', opensInNewTab: false },
    { label: 'Contact', href: '/contact', opensInNewTab: false },
  ],
  mobileOpenLabel: 'Ouvrir le menu',
  mobileCloseLabel: 'Fermer le menu',
  mobileNavigationLabel: 'Navigation',
  mobileQuickAccessLabel: 'Accès rapide',
  mobileFooterText:
    'Séjours haut de gamme à Paris et Lyon, avec une expérience simple à réserver et claire à vivre.',
  mobileFooterButtonLabel: 'Réserver un séjour',
  mobileFooterButtonHref: '/appartements',
}

export const FOOTER_DEFAULTS: StoryblokFooter = {
  logo: '/images/logo-alto-light.png',
  logoAriaLabel: 'Accueil Alto',
  ctaTitle: 'Une question ? Notre équipe vous répond.',
  ctaBody: 'Disponible du lundi au vendredi, de 9h à 17h.',
  ctaButton: { label: 'Nous contacter', href: '/contact', opensInNewTab: false },
  navLinks: [
    { label: 'Accueil', href: '/', opensInNewTab: false },
    { label: 'Paris', href: '/appartements?city=paris', opensInNewTab: false },
    { label: 'Lyon', href: '/appartements?city=lyon', opensInNewTab: false },
    { label: 'Appartements', href: '/appartements', opensInNewTab: false },
    { label: 'Nos ressources', href: '/blog', opensInNewTab: false },
    { label: 'À propos', href: '/notre-histoire', opensInNewTab: false },
    { label: 'Investir', href: '/investir', opensInNewTab: false },
    { label: 'Légal', href: '/cgv', opensInNewTab: false },
  ],
  copyright: 'Tous droits réservés | Alto© 2026',
  navAriaLabel: 'Navigation du pied de page',
}

export const STICKY_CTA_DEFAULTS: StoryblokStickyCta = {
  enabled: true,
  thresholdVh: 80,
}

export const SHARED_ASSETS_DEFAULTS: StoryblokSharedAssets = {
  locationAvatars: [
    { src: SHARED_DEFAULTS.locationAvatars[0], alt: 'Appartement Alto à Paris' },
    { src: SHARED_DEFAULTS.locationAvatars[1], alt: 'Appartement Alto à Lyon' },
    { src: SHARED_DEFAULTS.locationAvatars[2], alt: 'Séjour Alto' },
  ],
  travelerAvatars: [
    { src: SHARED_DEFAULTS.travelerAvatars[0], alt: 'Voyageuse Alto' },
    { src: SHARED_DEFAULTS.travelerAvatars[1], alt: 'Voyageur Alto' },
    { src: SHARED_DEFAULTS.travelerAvatars[2], alt: 'Cliente Alto' },
  ],
  footerBackground: SHARED_DEFAULTS.footerBackground,
}

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

export interface StoryblokGlobals {
  header: StoryblokHeader
  footer: StoryblokFooter
  stickyCta: StoryblokStickyCta
  sharedAssets: StoryblokSharedAssets
  sharedTestimonials: StoryblokTestimonial[]
  apartmentFaq: StoryblokFaq
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
  const story = await getStoryBySlug('globals/header', locale)
  const content = story?.content ?? {}
  const descriptions = parseDescriptions(content.nav_primary_descriptions)
  const navPrimary = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.nav_primary,
  ).map((item, index) => ({
    label: textOr(item.label, HEADER_DEFAULTS.navPrimary[index]?.label ?? ''),
    href: linkHref(item.link, HEADER_DEFAULTS.navPrimary[index]?.href ?? '/'),
    description:
      descriptions[index] ?? HEADER_DEFAULTS.navPrimary[index]?.description ?? '',
    opensInNewTab: boolOr(item.opens_in_new_tab, false),
  }))

  const navSecondary = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.nav_secondary,
  ).map((item, index) => ({
    label: textOr(item.label, HEADER_DEFAULTS.navSecondary[index]?.label ?? ''),
    href: linkHref(item.link, HEADER_DEFAULTS.navSecondary[index]?.href ?? '/'),
    opensInNewTab: boolOr(item.opens_in_new_tab, false),
  }))

  return {
    logoLight: assetUrl(content.logo_light, HEADER_DEFAULTS.logoLight),
    logoDark: assetUrl(content.logo_dark, HEADER_DEFAULTS.logoDark),
    bookLabel: textOr(content.book_label, HEADER_DEFAULTS.bookLabel),
    mapLabel: textOr(content.map_label, HEADER_DEFAULTS.mapLabel),
    navPrimary: navPrimary.length > 0 ? navPrimary : HEADER_DEFAULTS.navPrimary,
    navSecondary: navSecondary.length > 0 ? navSecondary : HEADER_DEFAULTS.navSecondary,
    mobileOpenLabel: textOr(content.mobile_open_label, HEADER_DEFAULTS.mobileOpenLabel),
    mobileCloseLabel: textOr(content.mobile_close_label, HEADER_DEFAULTS.mobileCloseLabel),
    mobileNavigationLabel: textOr(
      content.mobile_navigation_label,
      HEADER_DEFAULTS.mobileNavigationLabel,
    ),
    mobileQuickAccessLabel: textOr(
      content.mobile_quick_access_label,
      HEADER_DEFAULTS.mobileQuickAccessLabel,
    ),
    mobileFooterText: textOr(content.mobile_footer_text, HEADER_DEFAULTS.mobileFooterText),
    mobileFooterButtonLabel: textOr(
      content.mobile_footer_button_label,
      HEADER_DEFAULTS.mobileFooterButtonLabel,
    ),
    mobileFooterButtonHref: linkHref(
      content.mobile_footer_button_link as StoryblokLinkField,
      HEADER_DEFAULTS.mobileFooterButtonHref,
    ),
  }
}

async function getFooter(locale: InquiryLocale): Promise<StoryblokFooter> {
  const story = await getStoryBySlug('globals/footer', locale)
  const content = story?.content ?? {}

  const ctaButtonBlok = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.cta_button,
  )[0]
  const ctaButton = ctaButtonBlok
    ? {
        label: textOr(ctaButtonBlok.label, FOOTER_DEFAULTS.ctaButton?.label ?? ''),
        href: linkHref(ctaButtonBlok.link, FOOTER_DEFAULTS.ctaButton?.href ?? '/'),
        opensInNewTab: boolOr(ctaButtonBlok.opens_in_new_tab, false),
      }
    : FOOTER_DEFAULTS.ctaButton

  const navLinks = bloksOf<{ label?: unknown; link?: unknown; opens_in_new_tab?: unknown }>(
    content.nav_links,
  ).map((item, index) => ({
    label: textOr(item.label, FOOTER_DEFAULTS.navLinks[index]?.label ?? ''),
    href: linkHref(item.link, FOOTER_DEFAULTS.navLinks[index]?.href ?? '/'),
    opensInNewTab: boolOr(item.opens_in_new_tab, false),
  }))

  return {
    logo: assetUrl(content.logo, FOOTER_DEFAULTS.logo),
    logoAriaLabel: textOr(content.logo_aria_label, FOOTER_DEFAULTS.logoAriaLabel),
    ctaTitle: textOr(content.cta_title, FOOTER_DEFAULTS.ctaTitle),
    ctaBody: textOr(content.cta_body, FOOTER_DEFAULTS.ctaBody),
    ctaButton,
    navLinks: navLinks.length > 0 ? navLinks : FOOTER_DEFAULTS.navLinks,
    copyright: textOr(content.copyright, FOOTER_DEFAULTS.copyright),
    navAriaLabel: textOr(content.nav_aria_label, FOOTER_DEFAULTS.navAriaLabel),
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
      const answer = textOr(item.answer, '')
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
