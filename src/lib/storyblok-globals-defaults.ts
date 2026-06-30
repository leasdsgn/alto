/**
 * Defaults purs (pas d'imports serveur) — consommables côté client.
 * Le fetcher reste dans storyblok-globals.ts.
 */
import { SHARED_DEFAULTS } from '@/lib/storyblok-defaults'

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

const WHATSAPP_FALLBACK_LINK =
  'https://wa.me/33617222098?text=Bonjour%2C%20je%20souhaite%20contacter%20Alto%20au%20sujet%20d%27un%20s%C3%A9jour.'

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

export interface StoryblokGlobals {
  header: StoryblokHeader
  footer: StoryblokFooter
  stickyCta: StoryblokStickyCta
  sharedAssets: StoryblokSharedAssets
  sharedTestimonials: StoryblokTestimonial[]
  apartmentFaq: StoryblokFaq
}

export const HEADER_DEFAULTS: StoryblokHeader = {
  logoLight: '/images/logo-alto-light.png',
  logoDark: '/images/logo-alto-dark.png',
  bookLabel: 'Réserver',
  mapLabel: 'Voir la carte',
  navPrimary: [
    { label: 'Appartements', href: '/appartements', description: 'Paris & Lyon', opensInNewTab: false },
    { label: 'Blog', href: '/blog', description: 'Adresses, quartiers, voyages', opensInNewTab: false },
    { label: 'Notre histoire', href: '/notre-histoire', description: 'L’approche Alto', opensInNewTab: false },
  ],
  navSecondary: [
    { label: 'Paris', href: '/appartements?city=paris', opensInNewTab: false },
    { label: 'Lyon', href: '/appartements?city=lyon', opensInNewTab: false },
    { label: 'WhatsApp', href: WHATSAPP_FALLBACK_LINK, opensInNewTab: true },
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
  ctaButton: {
    label: 'Chat on WhatsApp',
    href: WHATSAPP_FALLBACK_LINK,
    opensInNewTab: true,
  },
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
