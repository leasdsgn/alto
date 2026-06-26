import type { BlogArticle, BlogSectionKey } from '@/lib/blog-data'
import { getFallbackBlogArticles } from '@/lib/blog-data'
import type { InquiryLocale } from '@/types/inquiry'

interface BlogHeroStat {
  label: string
  value: string
  kind: 'avatars' | 'guest-badges' | 'review-badges'
}

export interface BlogEditorialMeta {
  key: BlogSectionKey
  title: string
  browseHref: string
  ctaEyebrow: string
  ctaTitle: string
  availabilityLabel: string
  ctaHref: string
  ctaLabel: string
  ctaImage: string
}

interface BlogStoryCardCopy {
  eyebrow: string
  title: string
  body: string
  image?: string
  href?: string
  ctaLabel?: string
}

interface BlogTestimonialCopy {
  eyebrow: string
  quote: string
  author: string
  context: string
}

export interface BlogPageCopy {
  heroEyebrow: string
  heroTitle: string
  heroBody: string
  scrollPreviousLabel: string
  scrollNextLabel: string
  stats: BlogHeroStat[]
  editorial: BlogEditorialMeta[]
  storyCards: BlogStoryCardCopy[]
  testimonial: BlogTestimonialCopy
}

export interface BlogEditorialSection extends BlogEditorialMeta {
  articles: BlogArticle[]
}

export const BLOG_PAGE_COPY: Record<InquiryLocale, BlogPageCopy> = {
  fr: {
    heroEyebrow: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
    heroTitle:
      'Depuis 2017, nous aidons les voyageurs à vivre les meilleures expériences possibles.',
    heroBody:
      'Nous concevons des logements bien pensés, sans compromis sur la qualité, la beauté et la simplicité du séjour. Le blog prolonge cette approche avec des conseils de ville, des idées d’itinéraires et des repères utiles.',
    scrollPreviousLabel: 'Faire défiler vers la gauche',
    scrollNextLabel: 'Faire défiler vers la droite',
    stats: [
      { label: '13 locations', value: '13 locations', kind: 'avatars' },
      { label: '4500+ voyageurs', value: '4500+ voyageurs', kind: 'guest-badges' },
      { label: '4,9 de note moyenne', value: '4,9 de note moyenne', kind: 'review-badges' },
    ],
    editorial: [
      {
        key: 'paris',
        title: 'Nos conseils pour Paris',
        browseHref: '/appartements?city=paris',
        ctaEyebrow: '10 logements disponibles sur Paris',
        ctaTitle: 'Réservez votre voyage vers Paris dès maintenant.',
        ctaHref: '/appartements?city=paris',
        ctaLabel: 'Regarder les disponibilités',
        ctaImage: '/images/blog-4.jpg',
        availabilityLabel: 'Paris',
      },
      {
        key: 'lyon',
        title: 'Nos conseils pour Lyon',
        browseHref: '/appartements?city=lyon',
        ctaEyebrow: '10 logements disponibles sur Lyon',
        ctaTitle: 'Réservez votre voyage vers Lyon dès maintenant.',
        ctaHref: '/appartements?city=lyon',
        ctaLabel: 'Regarder les disponibilités',
        ctaImage: '/images/lyon/services-image.jpg',
        availabilityLabel: 'Lyon',
      },
      {
        key: 'voyage',
        title: 'Nos conseils voyage',
        browseHref: '/appartements',
        ctaEyebrow: 'Escapades pensées pour durer',
        ctaTitle: 'Préparez un séjour plus simple, plus fluide et mieux situé.',
        ctaHref: '/appartements',
        ctaLabel: 'Regarder les disponibilités',
        ctaImage: '/images/hero-home.webp',
        availabilityLabel: 'Voyage',
      },
    ],
    storyCards: [
      {
        eyebrow: 'À propos',
        title: 'Chez soi, comme à l’hôtel',
        body: 'Chaque espace Alto propose une expérience fluide : un séjour où le confort, la lumière, l’autonomie et le soin silencieux se conjuguent naturellement.',
        href: '/notre-histoire',
        ctaLabel: 'En savoir plus',
      },
      {
        eyebrow: 'Arrivée',
        title: 'Un quartier vivant, une adresse au cœur des plus beaux quartiers.',
        body: 'Une implantation pensée pour marcher, revenir facilement et profiter de la ville sans détour.',
        image: '/images/alto-salon.jpg',
      },
      {
        eyebrow: 'Check-in',
        title: 'Accès autonome et gestionnaire joignable 24h/24 et 7j/7.',
        body: 'Des repères simples, une arrivée claire et un support disponible quand il faut.',
        image: '/images/blog-3.jpg',
      },
    ],
    testimonial: {
      eyebrow: 'Témoignages',
      quote:
        'On s’est sentis chez nous dès la première minute. L’appartement est exactement comme sur les photos, en mieux.',
      author: 'Sofia & Léo',
      context: 'L’Opéra | Mars 2026',
    },
  },
  en: {
    heroEyebrow: 'Alto is a different way of thinking about hospitality.',
    heroTitle: 'Since 2017, we have helped travellers experience cities in a better way.',
    heroBody:
      'We design stays that feel considered, calm and easy to inhabit. The journal extends that approach through city notes, travel ideas and practical references for a smoother stay.',
    scrollPreviousLabel: 'Scroll left',
    scrollNextLabel: 'Scroll right',
    stats: [
      { label: '13 addresses', value: '13 addresses', kind: 'avatars' },
      { label: '4500+ guests', value: '4500+ guests', kind: 'guest-badges' },
      { label: '4.9 average rating', value: '4.9 average rating', kind: 'review-badges' },
    ],
    editorial: [
      {
        key: 'paris',
        title: 'Our notes on Paris',
        browseHref: '/appartements?city=paris',
        ctaEyebrow: '10 available stays in Paris',
        ctaTitle: 'Book your next Paris stay now.',
        ctaHref: '/appartements?city=paris',
        ctaLabel: 'See availability',
        ctaImage: '/images/blog-4.jpg',
        availabilityLabel: 'Paris',
      },
      {
        key: 'lyon',
        title: 'Our notes on Lyon',
        browseHref: '/appartements?city=lyon',
        ctaEyebrow: '10 available stays in Lyon',
        ctaTitle: 'Book your next Lyon stay now.',
        ctaHref: '/appartements?city=lyon',
        ctaLabel: 'See availability',
        ctaImage: '/images/lyon/services-image.jpg',
        availabilityLabel: 'Lyon',
      },
      {
        key: 'voyage',
        title: 'Travel notes',
        browseHref: '/appartements',
        ctaEyebrow: 'Escapes designed to last',
        ctaTitle: 'Prepare a stay that feels simpler, smoother and better placed.',
        ctaHref: '/appartements',
        ctaLabel: 'See availability',
        ctaImage: '/images/hero-home.webp',
        availabilityLabel: 'Travel',
      },
    ],
    storyCards: [
      {
        eyebrow: 'About',
        title: 'At home, with the quiet standards of a hotel.',
        body: 'Each Alto address is shaped to feel fluid and calm, where comfort, light, autonomy and discreet care work together naturally.',
        href: '/notre-histoire',
        ctaLabel: 'Learn more',
      },
      {
        eyebrow: 'Arrival',
        title: 'A lively district, an address set within the city’s best areas.',
        body: 'A location chosen so you can walk, return easily and experience the city without unnecessary detours.',
        image: '/images/alto-salon.jpg',
      },
      {
        eyebrow: 'Check-in',
        title: 'Autonomous access and a host reachable 24/7.',
        body: 'Clear guidance, a simple arrival sequence and responsive support whenever it is needed.',
        image: '/images/blog-3.jpg',
      },
    ],
    testimonial: {
      eyebrow: 'Testimonials',
      quote:
        'We felt at home from the very first minute. The apartment is exactly like the photos, only better.',
      author: 'Sofia & Leo',
      context: 'L’Opéra | March 2026',
    },
  },
}

export function buildBlogEditorialSections(
  locale: InquiryLocale,
  articles: BlogArticle[],
): BlogEditorialSection[] {
  const fallbackArticles = getFallbackBlogArticles(locale)

  return BLOG_PAGE_COPY[locale].editorial.map((section) => ({
    ...section,
    articles: collectSectionArticles(section.key, articles, fallbackArticles),
  }))
}

function collectSectionArticles(
  section: BlogSectionKey,
  articles: BlogArticle[],
  fallbackArticles: BlogArticle[],
) {
  const seen = new Set<string>()

  return [...articles, ...fallbackArticles]
    .filter((article) => {
      if (article.section !== section) return false
      if (seen.has(article.slug)) return false

      seen.add(article.slug)
      return true
    })
    .slice(0, 3)
}

export function getBlogEditorialMeta(
  locale: InquiryLocale,
  section: BlogSectionKey,
): BlogEditorialMeta {
  return (
    BLOG_PAGE_COPY[locale].editorial.find((item) => item.key === section) ??
    BLOG_PAGE_COPY[locale].editorial[0]
  )
}
