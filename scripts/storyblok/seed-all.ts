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
import { SHARED_TESTIMONIALS_DEFAULTS } from '../../src/lib/storyblok-testimonials-defaults'

const SCHEMA_ONLY = process.argv.includes('--schema-only')
const WHATSAPP_LINK =
  'https://wa.me/33617222098?text=Bonjour%2C%20je%20souhaite%20contacter%20Alto%20au%20sujet%20d%27un%20s%C3%A9jour.'
const APARTMENT_FAQ_PREVIEW_PATH = '/appartements/voltaire-iii'

interface StorySeed {
  name: string
  fullSlug: string
  realPath: string
  parent: 'pages' | 'globals' | null
  defaultContent: Record<string, unknown>
}

function getPageStories(): StorySeed[] {
  return [
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
      defaultContent: pageContent(buildLegalDefaultBody('cgv')),
    },
    {
      name: 'Confidentialité',
      fullSlug: 'pages/confidentialite',
      realPath: '/confidentialite',
      parent: 'pages',
      defaultContent: pageContent(buildLegalDefaultBody('confidentialite')),
    },
    {
      name: 'Annulation',
      fullSlug: 'pages/annulation',
      realPath: '/annulation',
      parent: 'pages',
      defaultContent: pageContent(buildLegalDefaultBody('annulation')),
    },
  ]
}

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
    defaultContent: {
      component: 'shared_testimonials_global',
      items: buildSharedTestimonialsItems(),
    },
  },
  {
    name: 'FAQ appartements',
    fullSlug: 'globals/apartment-faq',
    realPath: APARTMENT_FAQ_PREVIEW_PATH,
    parent: 'globals',
    defaultContent: {
      component: 'faq_global',
      eyebrow: 'FAQ',
      title: 'Questions fréquentes',
      items: [
        blok('faq_item', {
          question: 'Comment fonctionne le check-in ?',
          answer: richTextParagraph(
            'L’arrivée se fait en autonomie avec des instructions envoyées avant le séjour. L’équipe reste disponible si vous avez besoin d’aide.',
          ),
        }),
        blok('faq_item', {
          question: 'Le ménage est-il inclus ?',
          answer: richTextParagraph(
            'Le ménage de départ est prévu et l’appartement est préparé avant votre arrivée.',
          ),
        }),
        blok('faq_item', {
          question: 'Puis-je réserver en direct ?',
          answer: richTextParagraph(
            'Oui. La réservation peut se faire directement sur Alto avec un contact plus direct et un suivi plus simple.',
          ),
        }),
      ],
    },
  },
]

function pageContent(body: ReturnType<typeof blok>[]): Record<string, unknown> {
  return {
    component: 'page',
    body,
  }
}

function buildSharedTestimonialsItems() {
  return SHARED_TESTIMONIALS_DEFAULTS.map((testimonial) => blok('testimonial', { ...testimonial }))
}

export type LegalPageKind = 'cgv' | 'confidentialite' | 'annulation'

export function buildLegalDefaultBody(kind: LegalPageKind) {
  const legal = LEGAL_PAGE_DEFAULTS[kind]

  return [
    blok('hero_compact_section', {
      background_image: '',
      eyebrow: 'Légal',
      title: legal.title,
      body: legal.intro,
      height: 'fixed-442',
    }),
    blok('rich_text_section', {
      body: richTextDoc(legal.sections),
      max_width: 'prose',
    }),
  ]
}

type LegalSection = {
  title?: string
  paragraphs?: string[]
  bullets?: string[]
}

const LEGAL_PAGE_DEFAULTS: Record<
  LegalPageKind,
  { title: string; intro: string; sections: LegalSection[] }
> = {
  cgv: {
    title: 'Conditions générales de vente',
    intro:
      'Conditions applicables aux réservations effectuées directement sur le site Alto. Version à adapter avec les informations légales définitives de l’exploitant.',
    sections: [
      {
        paragraphs: [
          'Dernière mise à jour : 30 juin 2026.',
          'Les présentes conditions générales de vente encadrent les réservations de séjours effectuées sur le site Alto. Elles sont fournies à titre de base éditoriale et doivent être validées par le responsable légal du site avant publication définitive.',
        ],
      },
      {
        title: '1. Exploitant du site',
        paragraphs: [
          'Le site alto-collection.com est exploité par la société responsable de la commercialisation des séjours Alto.',
        ],
        bullets: [
          'Raison sociale : [à compléter]',
          'Forme juridique : [à compléter]',
          'Capital social : [à compléter]',
          'Siège social : [à compléter]',
          'SIRET / RCS : [à compléter]',
          'TVA intracommunautaire : [à compléter si applicable]',
          'Contact : [adresse e-mail ou canal de contact à compléter]',
        ],
      },
      {
        title: '2. Objet',
        paragraphs: [
          'Les présentes CGV définissent les conditions dans lesquelles un voyageur peut réserver un appartement proposé sur le site Alto pour un séjour de courte ou moyenne durée.',
          'Toute réservation implique l’acceptation des présentes CGV, ainsi que des conditions spécifiques affichées au moment de la réservation.',
        ],
      },
      {
        title: '3. Appartements et disponibilités',
        paragraphs: [
          'Les appartements présentés sur le site sont décrits avec leurs caractéristiques essentielles, notamment la localisation, la capacité d’accueil, les équipements principaux, les dates disponibles et le tarif applicable.',
          'Les disponibilités et prix sont susceptibles d’évoluer en temps réel. La réservation n’est considérée comme confirmée qu’après validation du paiement et émission de la confirmation de réservation.',
        ],
      },
      {
        title: '4. Prix',
        paragraphs: [
          'Les prix sont affichés en euros, toutes taxes comprises lorsque celles-ci sont applicables. Le prix final peut inclure le prix du séjour, les frais de ménage, taxes, frais additionnels et éventuelles options indiquées avant paiement.',
          'Le montant total dû est récapitulé avant validation de la réservation.',
        ],
      },
      {
        title: '5. Réservation et paiement',
        paragraphs: [
          'La réservation s’effectue en ligne via le formulaire prévu à cet effet. Le voyageur renseigne les informations nécessaires au séjour, vérifie le récapitulatif de réservation, puis procède au paiement sécurisé.',
          'Les paiements sont traités par les prestataires techniques connectés à la plateforme de réservation, notamment Guesty et Stripe. Alto ne stocke pas les données complètes de carte bancaire sur ses serveurs.',
          'Certaines cartes bancaires peuvent nécessiter une authentification renforcée de type 3D Secure. Si cette authentification échoue ou est abandonnée, la réservation peut ne pas être finalisée.',
        ],
      },
      {
        title: '6. Confirmation de réservation',
        paragraphs: [
          'Une réservation est confirmée lorsque le paiement est accepté et que le voyageur reçoit une confirmation de réservation. Cette confirmation reprend les informations principales du séjour.',
          'En cas d’erreur manifeste de prix, d’indisponibilité technique ou de problème de paiement, Alto se réserve la possibilité d’annuler la réservation concernée et d’en informer le voyageur dans les meilleurs délais.',
        ],
      },
      {
        title: '7. Annulation et modification',
        paragraphs: [
          'Les conditions d’annulation et de modification applicables sont celles affichées au moment de la réservation et reprises, le cas échéant, dans la confirmation de réservation.',
          'Lorsque le site renvoie vers une page dédiée à la politique d’annulation, celle-ci complète les présentes CGV.',
        ],
      },
      {
        title: '8. Dépôt de garantie',
        paragraphs: [
          'Un dépôt de garantie ou une préautorisation peut être demandé avant ou pendant le séjour, selon l’appartement, la durée du séjour ou les conditions applicables à la réservation.',
          'Les modalités exactes du dépôt de garantie sont communiquées au voyageur avant ou après la réservation selon le processus opérationnel applicable.',
        ],
      },
      {
        title: '9. Obligations du voyageur',
        paragraphs: [
          'Le voyageur s’engage à utiliser l’appartement paisiblement, à respecter sa capacité maximale, le voisinage, les règles de l’immeuble et les consignes transmises avant l’arrivée.',
          'Toute dégradation, nuisance, usage non conforme ou non-respect des règles du séjour peut entraîner des frais supplémentaires, une retenue sur dépôt de garantie ou l’interruption du séjour lorsque la situation le justifie.',
        ],
      },
      {
        title: '10. Responsabilité',
        paragraphs: [
          'Alto met en œuvre les moyens raisonnables pour assurer l’exactitude des informations publiées et le bon fonctionnement du parcours de réservation.',
          'La responsabilité d’Alto ne saurait être engagée en cas de force majeure, de fait imputable au voyageur, de défaillance d’un prestataire tiers ou d’utilisation non conforme du site ou de l’appartement.',
        ],
      },
      {
        title: '11. Données personnelles',
        paragraphs: [
          'Les données personnelles collectées dans le cadre de la réservation sont traitées conformément à la politique de confidentialité du site.',
        ],
      },
      {
        title: '12. Médiation et réclamations',
        paragraphs: [
          'En cas de difficulté, le voyageur est invité à contacter Alto afin de rechercher une solution amiable.',
          'Les informations relatives au médiateur de la consommation compétent doivent être complétées par l’exploitant du site : [médiateur à compléter].',
        ],
      },
      {
        title: '13. Droit applicable',
        paragraphs: [
          'Les présentes CGV sont soumises au droit français. En cas de litige, les règles de compétence applicables sont celles prévues par le droit commun et, lorsque le voyageur agit en qualité de consommateur, par les dispositions protectrices qui lui sont applicables.',
        ],
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    intro:
      'Informations relatives au traitement des données personnelles collectées sur le site Alto. Version à adapter avec les informations légales définitives de l’exploitant.',
    sections: [
      {
        paragraphs: [
          'Dernière mise à jour : 30 juin 2026.',
          'La présente politique explique quelles données personnelles sont collectées lors de l’utilisation du site Alto, pour quelles finalités, sur quelles bases juridiques, pendant combien de temps elles sont conservées et quels droits peuvent être exercés.',
        ],
      },
      {
        title: '1. Responsable du traitement',
        paragraphs: [
          'Le responsable du traitement est la société exploitant le site alto-collection.com et les services de réservation Alto.',
        ],
        bullets: [
          'Raison sociale : [à compléter]',
          'Adresse : [à compléter]',
          'Contact privacy : [adresse e-mail à compléter]',
        ],
      },
      {
        title: '2. Données collectées',
        paragraphs: [
          'Selon l’usage du site, Alto peut collecter les catégories de données suivantes :',
        ],
        bullets: [
          'données d’identité : nom, prénom',
          'données de contact : adresse e-mail, numéro de téléphone',
          'données de réservation : dates de séjour, appartement réservé, nombre de voyageurs, demandes particulières',
          'données de paiement : identifiants de transaction, statut du paiement, montant payé, données nécessaires à la lutte contre la fraude. Les données complètes de carte bancaire sont traitées par les prestataires de paiement',
          'données techniques : adresse IP, logs de sécurité, informations de navigation nécessaires au fonctionnement du site',
          'données échangées avec le support lorsque le voyageur contacte Alto',
        ],
      },
      {
        title: '3. Finalités et bases juridiques',
        paragraphs: ['Les données sont traitées pour les finalités suivantes :'],
        bullets: [
          'gestion des demandes de disponibilité, devis et réservations, sur la base de l’exécution du contrat ou de mesures précontractuelles',
          'paiement, confirmation, suivi et gestion opérationnelle du séjour, sur la base de l’exécution du contrat',
          'communication avec le voyageur avant, pendant et après le séjour, sur la base de l’exécution du contrat ou de l’intérêt légitime d’Alto',
          'sécurité du site, prévention de la fraude et gestion des incidents de paiement, sur la base de l’intérêt légitime d’Alto',
          'respect des obligations légales, comptables et fiscales applicables',
          'amélioration du site et mesure d’audience lorsque ces outils sont activés, selon la base juridique applicable et, le cas échéant, le consentement',
        ],
      },
      {
        title: '4. Destinataires',
        paragraphs: [
          'Les données peuvent être transmises aux équipes internes habilitées, aux prestataires techniques nécessaires au fonctionnement du site et de la réservation, ainsi qu’aux partenaires strictement nécessaires à l’exécution du séjour.',
        ],
        bullets: [
          'plateforme de gestion des réservations : Guesty',
          'prestataire de paiement : Stripe',
          'hébergement et déploiement du site : Vercel',
          'outils de communication ou de support utilisés par Alto',
          'autorités administratives, fiscales ou judiciaires lorsque la loi l’exige',
        ],
      },
      {
        title: '5. Transferts hors Union européenne',
        paragraphs: [
          'Certains prestataires techniques peuvent traiter des données en dehors de l’Union européenne. Dans ce cas, Alto veille à ce que des garanties appropriées soient mises en place, notamment des clauses contractuelles types ou tout autre mécanisme reconnu par la réglementation applicable.',
        ],
      },
      {
        title: '6. Durées de conservation',
        paragraphs: [
          'Les données sont conservées pendant une durée proportionnée aux finalités poursuivies :',
        ],
        bullets: [
          'données liées aux réservations : pendant la durée nécessaire à la gestion du séjour, puis pendant la durée légale de conservation comptable et contractuelle applicable',
          'données de contact et échanges support : pendant la durée nécessaire au traitement de la demande, puis archivage si nécessaire à la preuve',
          'données de paiement : selon les durées appliquées par les prestataires de paiement et les obligations comptables',
          'logs techniques : pendant une durée limitée nécessaire à la sécurité et au diagnostic technique',
        ],
      },
      {
        title: '7. Droits des personnes',
        paragraphs: [
          'Conformément à la réglementation applicable, chaque personne dispose d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et, lorsque applicable, de portabilité de ses données.',
          'Ces droits peuvent être exercés en contactant Alto à l’adresse suivante : [adresse e-mail à compléter]. Une preuve d’identité peut être demandée lorsque cela est nécessaire pour traiter la demande.',
          'En cas de difficulté non résolue, la personne concernée peut adresser une réclamation à la CNIL.',
        ],
      },
      {
        title: '8. Cookies',
        paragraphs: [
          'Le site peut utiliser des cookies ou technologies similaires nécessaires à son fonctionnement, à la sécurité du parcours de réservation et, le cas échéant, à la mesure d’audience.',
          'Lorsque des cookies non strictement nécessaires sont utilisés, ils sont soumis au consentement préalable lorsque la réglementation l’exige.',
        ],
      },
      {
        title: '9. Sécurité',
        paragraphs: [
          'Alto met en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données personnelles contre l’accès non autorisé, la perte, l’altération ou la divulgation.',
        ],
      },
      {
        title: '10. Modification de la politique',
        paragraphs: [
          'La présente politique peut être mise à jour pour tenir compte de l’évolution du site, des prestataires utilisés ou de la réglementation applicable.',
        ],
      },
    ],
  },
  annulation: {
    title: 'Politique d’annulation',
    intro: '',
    sections: [{ paragraphs: ['Contenu à remplir depuis Storyblok.'] }],
  },
}

function richTextDoc(sections: LegalSection[]) {
  return {
    type: 'doc',
    content: sections.flatMap((section) => [
      ...(section.title ? [richTextHeading(section.title)] : []),
      ...(section.paragraphs ?? []).map(richTextParagraphNode),
      ...(section.bullets?.length ? [richTextBulletList(section.bullets)] : []),
    ]),
  }
}

function richTextHeading(text: string) {
  return {
    type: 'heading',
    attrs: { level: 2 },
    content: [{ type: 'text', text }],
  }
}

function richTextParagraphNode(text: string) {
  return {
    type: 'paragraph',
    content: [{ type: 'text', text }],
  }
}

function richTextBulletList(items: string[]) {
  return {
    type: 'bullet_list',
    content: items.map((item) => ({
      type: 'list_item',
      content: [richTextParagraphNode(item)],
    })),
  }
}

function richTextParagraph(text: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text,
          },
        ],
      },
    ],
  }
}

function buildInvestirDefaultBody() {
  return [
    blok('hero_compact_section', {
      background_image: '',
      title: 'Investir avec nous',
      body: 'Un modèle d’appartements haut de gamme, ancrés dans les quartiers les plus recherchés, pensé pour conjuguer rendement et excellence esthétique.',
      height: 'fixed-442',
    }),
    blok('text_section', {
      eyebrow: 'Les appartements',
      title: 'Une collection d’adresses à forte valeur patrimoniale',
      body: 'Nous sélectionnons des biens situés dans des emplacements premium, au cœur de villes à forte attractivité culturelle et touristique.\n\nChaque appartement est soigneusement rénové, valorisé par une direction artistique exigeante, optimisé pour la location courte et moyenne durée.\n\nNotre approche repose sur un équilibre entre rentabilité, désirabilité et pérennité du patrimoine.',
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
          description: 'Une expérience client soignée, générant récurrence et recommandations.',
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
      body: 'Vous souhaitez en savoir plus sur notre modèle ou étudier une opportunité d’investissement ?',
      ctas: [
        blok('cta_button', {
          label: 'Recevoir le dossier investisseur',
          link: { url: WHATSAPP_LINK, linktype: 'url' },
          variant: 'primary',
        }),
        blok('cta_button', {
          label: 'Nous contacter',
          link: { url: WHATSAPP_LINK, linktype: 'url' },
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
      title:
        '12 appartements soigneusement pensés,\n3 villes emblématiques, déjà 480 voyageurs conquis.',
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
      footer_text:
        'Un parquet qui craque doucement.\nUn linge soigné.\nUn quartier qu’on apprend à connaître.',
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
      intro:
        'Depuis 2016 nous aidons les voyageurs grâce à des logements premium au cœur des villes',
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
        blok('panel', {
          image: '',
          label: 'Durabilité',
          title: 'Matériaux durables et sourcés. Vigilance sur l’impact des installations.',
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

  const pageStories = getPageStories()

  console.log(`\n[3/3] Stories (${pageStories.length + GLOBAL_STORIES.length})`)
  for (const story of [...pageStories, ...GLOBAL_STORIES]) {
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

if (process.argv[1]?.endsWith('seed-all.ts')) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

export {}
