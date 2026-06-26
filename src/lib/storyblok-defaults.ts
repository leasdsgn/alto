/**
 * Fallbacks centralisés pour le contenu Storyblok.
 * Quand un champ optionnel est vide côté CMS, on tombe sur ces valeurs.
 *
 * Chaque phase de migration enrichit ce module avec les défauts de la page concernée.
 */

export const SHARED_DEFAULTS = {
  locationAvatars: ['/images/blog-1.jpg', '/images/hero-home.webp', '/images/blog-3.jpg'] as const,
  travelerAvatars: [
    '/images/avatars/voyageur-1.png',
    '/images/avatars/voyageur-2.png',
    '/images/avatars/voyageur-3.png',
  ] as const,
  footerBackground: '/images/footer-gradient.webp',
}

export const PLACEHOLDER_IMAGE = '/images/alto-salon.jpg'
