/**
 * Orchestrateur seed Storyblok.
 *
 * IDEMPOTENT et SAFE :
 * - Push le schema de TOUS les composants (création si absent, update si présent)
 * - Crée les stories root (pages + globals) uniquement si elles n'existent pas
 * - Ne touche JAMAIS au contenu d'une story existante
 *
 * Usage :
 *   STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-all
 *   STORYBLOK_PERSONAL_TOKEN=xxx bun run storyblok:seed-all --schema-only
 */

import { ALL_COMPONENTS } from './schema'
import {
  blok,
  createStoryIfAbsent,
  ensureFolder,
  listComponents,
  sleep,
  upsertComponent,
} from './seed-utils'

const SCHEMA_ONLY = process.argv.includes('--schema-only')

interface StorySeed {
  name: string
  fullSlug: string
  realPath: string
  parent: 'pages' | 'globals' | null
  defaultContent: Record<string, unknown>
}

const PAGE_STORIES: StorySeed[] = [
  {
    name: 'Accueil',
    fullSlug: 'pages/home',
    realPath: '/',
    parent: 'pages',
    defaultContent: pageContent(buildHomeDefaultBody()),
  },
  {
    name: 'Lyon',
    fullSlug: 'pages/lyon',
    realPath: '/lyon',
    parent: 'pages',
    defaultContent: pageContent(buildLyonDefaultBody()),
  },
  {
    name: 'Appartements',
    fullSlug: 'pages/appartements',
    realPath: '/appartements',
    parent: 'pages',
    defaultContent: pageContent([
      blok('hero_compact_section', {
        background_image: '',
        eyebrow: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
        title: 'Nos appartements',
        body: '',
        height: 'fixed-442',
      }),
    ]),
  },
  {
    name: 'Notre histoire',
    fullSlug: 'pages/notre-histoire',
    realPath: '/notre-histoire',
    parent: 'pages',
    defaultContent: pageContent([
      blok('notre_histoire_section', {}),
      blok('apartments_grid_section', {
        paris_title: 'Nos appartements à Paris',
        lyon_title: 'Nos appartements à Lyon',
        city_filter: 'all',
        max_per_city: 0,
        show_search_bar: false,
        display_mode: 'carousel',
      }),
    ]),
  },
  {
    name: 'Investir',
    fullSlug: 'pages/investir',
    realPath: '/investir',
    parent: 'pages',
    defaultContent: pageContent(buildInvestirDefaultBody()),
  },
  {
    name: 'Contact',
    fullSlug: 'pages/contact',
    realPath: '/contact',
    parent: 'pages',
    defaultContent: pageContent(buildContactDefaultBody()),
  },
  {
    name: 'Blog',
    fullSlug: 'pages/blog',
    realPath: '/blog',
    parent: 'pages',
    defaultContent: pageContent([
      blok('blog_index_section', {}),
      blok('services_section', {
        items: [],
        variant: 'grid',
      }),
      blok('apartments_grid_section', {
        paris_title: 'Nos appartements à Paris',
        lyon_title: 'Nos appartements à Lyon',
        city_filter: 'all',
        max_per_city: 0,
        show_search_bar: false,
        display_mode: 'carousel',
      }),
    ]),
  },
  {
    name: 'CGV',
    fullSlug: 'pages/cgv',
    realPath: '/cgv',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Confidentialité',
    fullSlug: 'pages/confidentialite',
    realPath: '/confidentialite',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
  {
    name: 'Annulation',
    fullSlug: 'pages/annulation',
    realPath: '/annulation',
    parent: 'pages',
    defaultContent: pageContent([]),
  },
]

const GLOBAL_STORIES: StorySeed[] = [
  {
    name: 'En-tête',
    fullSlug: 'globals/header',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'header_global' },
  },
  {
    name: 'Pied de page',
    fullSlug: 'globals/footer',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'footer_global' },
  },
  {
    name: 'CTA flottant',
    fullSlug: 'globals/sticky-cta',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'sticky_cta_global', enabled: true, threshold_vh: 80 },
  },
  {
    name: 'Assets partagés',
    fullSlug: 'globals/shared-assets',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'shared_assets_global' },
  },
  {
    name: 'Témoignages partagés',
    fullSlug: 'globals/shared-testimonials',
    realPath: '/',
    parent: 'globals',
    defaultContent: { component: 'shared_testimonials_global', items: [] },
  },
]

function pageContent(body: ReturnType<typeof blok>[]): Record<string, unknown> {
  return {
    component: 'page',
    body,
    seo: [],
  }
}

function buildContactDefaultBody() {
  return [
    blok('hero_compact_section', {
      background_image: '',
      title: 'Contact',
      body: 'Une question, un projet d’investissement, une réservation ? Écrivez-nous.',
      height: 'fixed-442',
    }),
    blok('contact_form_section', {
      eyebrow: 'Formulaire',
      title: 'Envoyez-nous un message',
      intro: '',
      firstname_label: 'Prénom',
      lastname_label: 'Nom',
      email_label: 'Email',
      subject_label: 'Sujet',
      subjects: [
        blok('subject_option', { value: 'reservation', label: 'Réservation' }),
        blok('subject_option', { value: 'investissement', label: 'Investissement' }),
        blok('subject_option', { value: 'partenariat', label: 'Partenariat' }),
        blok('subject_option', { value: 'autre', label: 'Autre' }),
      ],
      message_label: 'Message',
      submit_label: 'Envoyer',
      success_message: 'Merci, nous revenons vers vous dès que possible.',
      sidebar_email: 'contact@alto-paris.com',
      sidebar_phone_label: 'Téléphone',
      sidebar_phone: '+33 1 00 00 00 00',
      sidebar_address_label: 'Adresse',
      sidebar_address_lines: 'Paris, France',
      sidebar_socials_label: 'Réseaux',
      sidebar_socials: [
        blok('social_link', { platform: 'instagram', url: 'https://instagram.com' }),
        blok('social_link', { platform: 'facebook', url: 'https://facebook.com' }),
      ],
    }),
  ]
}

function buildInvestirDefaultBody() {
  return [
    blok('hero_compact_section', {
      background_image: '',
      title: 'Investir avec nous',
      body:
        'Un modèle d’appartements haut de gamme, ancrés dans les quartiers les plus recherchés, pensé pour conjuguer rendement et excellence esthétique.',
      height: 'fixed-442',
    }),
    blok('text_section', {
      eyebrow: 'Les appartements',
      title: 'Une collection d’adresses à forte valeur patrimoniale',
      body:
        'Nous sélectionnons des biens situés dans des emplacements premium, au cœur de villes à forte attractivité culturelle et touristique.\n\nChaque appartement est soigneusement rénové, valorisé par une direction artistique exigeante, optimisé pour la location courte et moyenne durée.\n\nNotre approche repose sur un équilibre entre rentabilité, désirabilité et pérennité du patrimoine.',
      max_width: 'prose',
      alignment: 'left',
    }),
    blok('invest_model_section', {
      eyebrow: 'Le modèle',
      title: 'Un modèle éprouvé',
      image: '',
      image_alt: 'Intérieur Alto',
      points: [
        blok('feature', {
          title: 'Performance opérationnelle',
          description:
            'Un taux d’occupation optimisé grâce à une stratégie tarifaire dynamique et un positionnement haut de gamme différenciant.',
        }),
        blok('feature', {
          title: 'Maîtrise des coûts',
          description:
            'Un réseau d’artisans, de partenaires et de fournisseurs permettant une gestion rigoureuse des investissements et des charges.',
        }),
        blok('feature', {
          title: 'Expérience premium',
          description:
            'Une expérience client soignée, générant récurrence et recommandations.',
        }),
      ],
    }),
    blok('invest_stats_section', {
      line_one: '12 appartements soigneusement pensés,',
      line_two: '3 villes emblématiques, déjà 480 voyageurs conquis.',
      body: 'Une collection intime d’adresses où l’on se sent chez soi, naturellement.',
      seen_on_label: 'Vu sur :',
      logos: [],
    }),
    blok('cta_section', {
      eyebrow: 'Nous contacter',
      title: 'Échangeons sur votre projet',
      body:
        'Vous souhaitez en savoir plus sur notre modèle ou étudier une opportunité d’investissement ?',
      ctas: [
        blok('cta_button', {
          label: 'Recevoir le dossier investisseur',
          link: { url: '/contact', linktype: 'url' },
          variant: 'primary',
        }),
        blok('cta_button', {
          label: 'Nous contacter',
          link: { url: '/contact', linktype: 'url' },
          variant: 'outline',
        }),
      ],
      variant: 'cream',
    }),
    blok('faq_section', {
      eyebrow: 'FAQ',
      title: 'Questions fréquentes',
      source: 'global',
      items: [],
    }),
  ]
}

function buildLyonDefaultBody() {
  return [
    blok('lyon_hero_section', {
      background_image: '',
      eyebrow: 'Lyon',
      title: 'Vivre Lyon autrement.',
      body: 'Des appartements soignés, dans les quartiers qui comptent.',
      show_search_bar: true,
    }),
    blok('lyon_stats_section', {
      title: '12 appartements soigneusement pensés,\n3 villes emblématiques, déjà 480 voyageurs conquis.',
      body: 'Une collection intime d’adresses où l’on se sent chez soi, naturellement.',
      seen_on_label: 'Vu sur :',
      press_logo: '',
      monocle_logo: '',
    }),
    blok('apartments_grid_section', {
      paris_title: 'Nos appartements à Paris',
      lyon_title: 'Nos appartements à Lyon',
      city_filter: 'lyon',
      max_per_city: 3,
      show_search_bar: false,
      display_mode: 'lyon-3-cards',
    }),
    blok('lyon_services_section', {
      image: '',
      eyebrow: 'Nos services',
      title: 'Chez soi, comme à l’hôtel',
      services: [
        blok('lyon_service_item', { icon: 'construction', label: 'Appartements restaurés' }),
        blok('lyon_service_item', { icon: 'key', label: 'Check-in autonome' }),
        blok('lyon_service_item', { icon: 'cleaning', label: 'Linge et ménage inclus' }),
        blok('lyon_service_item', { icon: 'calendar', label: 'Réservation sans frais' }),
      ],
      footer_text: 'Un parquet qui craque doucement.\nUn linge soigné.\nUn quartier qu’on apprend à connaître.',
      cta_label: 'Réserver',
      cta_link: { url: '#disponibilites', linktype: 'url' },
    }),
    blok('lyon_quartiers_section', {
      eyebrow: 'Les quartiers',
      title: 'Choisir son quartier',
      items: [
        blok('quartier', {
          name: 'Bellecour',
          slug: 'bellecour',
          description: '2e arr.',
          image: '',
        }),
        blok('quartier', {
          name: 'Vieux Lyon',
          slug: 'vieux-lyon',
          description: '5e arr.',
          image: '',
        }),
        blok('quartier', {
          name: 'Terreaux',
          slug: 'terreaux',
          description: '1e arr.',
          image: '',
        }),
      ],
    }),
    blok('lyon_blog_section', {
      eyebrow: 'Le blog',
      title: 'En découvrir plus',
      headline: 'Nos conseils pour améliorer votre voyage',
      intro: 'Depuis 2016 nous aidons les voyageurs grâce à des logements premium au cœur des villes',
      max_items: 3,
      section_filter: 'lyon',
    }),
    blok('faq_section', {
      eyebrow: 'FAQ',
      title: 'Questions fréquentes',
      source: 'global',
      items: [],
    }),
  ]
}

function buildHomeDefaultBody() {
  return [
    blok('hero_section', {
      title_mode: 'parts',
      title_part_1: 'LIFTED',
      title_part_2: 'MINDFUL',
      title_part_3: 'HOME',
      background_image: '',
      overlay_image: '',
      subtitle: '',
      ctas: [],
      show_search_bar: true,
      height: 'svh',
    }),
    blok('home_about_section', {
      kicker: 'Alto, c’est une nouvelle manière de penser l’hospitalité.',
      quote:
        'Nous transformons des espaces singuliers en lieux de vie élégants, bien pensés et confortables. Notre mission : permettre aux voyageurs de vivre des séjours sans frictions aux plus belles adresses.',
      locations_label: '13 locations',
      travelers_label: '4 500+ voyageurs',
      rating_label: '4,9 de note moyenne',
    }),
    blok('apartments_grid_section', {
      paris_title: 'Nos appartements à Paris',
      lyon_title: 'Nos appartements à Lyon',
      city_filter: 'all',
      max_per_city: 0,
      show_search_bar: false,
      display_mode: 'carousel',
    }),
    blok('panels_section', {
      eyebrow: 'À PROPOS',
      button_label: 'En savoir plus',
      button_link: { url: '/notre-histoire', linktype: 'url' },
      panels: [
        blok('panel', {
          image: '',
          label: 'Espaces',
          title: 'Espaces de charme, singuliers, atypiques, et bien pensés.',
        }),
        blok('panel', {
          image: '',
          label: 'Localisation',
          title: 'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
        }),
        blok('panel', {
          image: '',
          label: 'Confort',
          title: 'Standards hôteliers. Soin des détails, équipements modernes.',
        }),
      ],
    }),
    blok('testimonials_section', {
      eyebrow: '',
      title: 'Témoignages',
      source: 'global',
      items: [],
    }),
    blok('services_section', {
      eyebrow: '',
      title: '',
      intro: '',
      items: [
        blok('service_card', {
          icon: '/images/icons/checkin.svg',
          title: 'Self check-in',
          description: 'Accès autonome à toute heure, sans attente ni comptoir.',
        }),
        blok('service_card', {
          icon: '/images/icons/cleaning.svg',
          title: 'Ménage',
          description: 'Linge de maison inclus, ménage professionnel entre chaque séjour.',
        }),
        blok('service_card', {
          icon: '/images/icons/support.svg',
          title: 'Support 24/24',
          description: 'Un gestionnaire disponible à tout moment pour vous accompagner.',
        }),
        blok('service_card', {
          icon: '/images/icons/wallet.svg',
          title: 'Pas de frais cachés',
          description: 'Prix nets, sans surprise. Ce que vous voyez est ce que vous payez.',
        }),
      ],
      variant: 'grid',
    }),
    blok('blog_grid_section', {
      eyebrow: '',
      title: '',
      intro:
        'Depuis 2017, nous accompagnons les voyageurs pour qu’ils vivent des expériences inoubliables aux plus belles adresses.',
      max_items: 5,
      section_filter: 'all',
      cta_label: 'Tous nos conseils',
      cta_link: { url: '/blog', linktype: 'url' },
      fallback_subtitle: 'Un quartier vivant, une adresse au cœur des plus beaux quartiers.',
      reading_time_label: '5 min de lecture',
      pagination_previous_label: 'Précédent',
      pagination_next_label: 'Suivant',
    }),
  ]
}

async function main() {
  console.log('— Storyblok seed-all —')

  console.log(`\n[1/3] Schema (${ALL_COMPONENTS.length} composants)`)
  const existing = await listComponents()
  for (const component of ALL_COMPONENTS) {
    await sleep(200)
    await upsertComponent(existing, component)
  }

  if (SCHEMA_ONLY) {
    console.log('\n--schema-only : skip stories.')
    return
  }

  console.log('\n[2/3] Dossiers parents')
  const pagesId = await ensureFolder('pages', 'Pages')
  const globalsId = await ensureFolder('globals', 'Globals')
  const parents = { pages: pagesId, globals: globalsId, none: 0 }

  console.log(`\n[3/3] Stories (${PAGE_STORIES.length + GLOBAL_STORIES.length})`)
  for (const story of [...PAGE_STORIES, ...GLOBAL_STORIES]) {
    await sleep(200)
    await createStoryIfAbsent({
      name: story.name,
      fullSlug: story.fullSlug,
      realPath: story.realPath,
      parentId: parents[story.parent ?? 'none'],
      defaultContent: story.defaultContent,
      publish: false,
    })
  }

  console.log('\n✓ Seed terminé')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export {}
