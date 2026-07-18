import { type ComponentDefinition } from './seed-utils'

/**
 * Définitions JSON de TOUS les composants Storyblok du site.
 * Idempotent : exécuter le seed ré-applique le schema sans toucher au contenu.
 *
 * Convention :
 * - Bloks atomiques (link, cta_button, faq_item, ...) : nestable only
 * - Bloks de section (hero_section, services_section, ...) : nestable only, restreints au body
 * - Content types root (page, header_global, ...) : is_root = true
 *
 * Tous les champs texte/textarea sont translatable (FR par défaut, EN traduction).
 */

const textField = (displayName: string, pos: number, required = false) => ({
  type: 'text',
  pos,
  display_name: displayName,
  translatable: true,
  required,
})

const textNoTranslate = (displayName: string, pos: number, required = false) => ({
  type: 'text',
  pos,
  display_name: displayName,
  translatable: false,
  required,
})

const textareaField = (displayName: string, pos: number, required = false) => ({
  type: 'textarea',
  pos,
  display_name: displayName,
  translatable: true,
  required,
})

const richtextField = (displayName: string, pos: number) => ({
  type: 'richtext',
  pos,
  display_name: displayName,
  translatable: true,
  toolbar: [
    'bold',
    'italic',
    'underline',
    'h2',
    'h3',
    'h4',
    'paragraph',
    'unorderedlist',
    'orderedlist',
    'link',
    'hrule',
  ],
})

const imageField = (displayName: string, pos: number, required = false) => ({
  type: 'asset',
  pos,
  display_name: displayName,
  required,
  asset_folder_id: null,
  filetypes: ['images'],
})

const multiAssetField = (displayName: string, pos: number) => ({
  type: 'multiasset',
  pos,
  display_name: displayName,
  filetypes: ['images'],
})

const linkField = (displayName: string, pos: number) => ({
  type: 'multilink',
  pos,
  display_name: displayName,
  email_link_type: true,
})

const boolField = (displayName: string, pos: number, defaultValue = false) => ({
  type: 'boolean',
  pos,
  display_name: displayName,
  default_value: defaultValue,
})

const numberField = (displayName: string, pos: number, defaultValue?: number) => ({
  type: 'number',
  pos,
  display_name: displayName,
  default_value: defaultValue,
})

const selectField = (
  displayName: string,
  pos: number,
  options: { name: string; value: string }[],
  defaultValue?: string,
) => ({
  type: 'option',
  pos,
  display_name: displayName,
  options,
  default_value: defaultValue,
})

const bloksField = (
  displayName: string,
  pos: number,
  componentWhitelist: string[],
  maximum?: number,
) => ({
  type: 'bloks',
  pos,
  display_name: displayName,
  restrict_components: true,
  component_whitelist: componentWhitelist,
  maximum,
})

// ---------------------------------------------------------------------------
// Bloks atomiques (nestable only)
// ---------------------------------------------------------------------------

const ATOMS: ComponentDefinition[] = [
  {
    name: 'link',
    display_name: 'Atome - Lien',
    is_root: false,
    is_nestable: true,
    schema: {
      label: textField('Libellé', 0, true),
      link: linkField('Destination', 1),
      opens_in_new_tab: boolField('Ouvrir dans un nouvel onglet', 2),
    },
  },
  {
    name: 'cta_button',
    display_name: 'Atome - Bouton CTA',
    is_root: false,
    is_nestable: true,
    schema: {
      label: textField('Libellé', 0, true),
      link: linkField('Destination', 1),
      variant: selectField(
        'Style',
        2,
        [
          { name: 'Primaire', value: 'primary' },
          { name: 'Outline', value: 'outline' },
          { name: 'Ghost', value: 'ghost' },
        ],
        'primary',
      ),
      size: selectField(
        'Taille',
        3,
        [
          { name: 'Petit', value: 'small' },
          { name: 'Par défaut', value: 'default' },
          { name: 'Grand', value: 'large' },
        ],
        'default',
      ),
    },
  },
  {
    name: 'faq_item',
    display_name: 'Atome - Question FAQ',
    is_root: false,
    is_nestable: true,
    schema: {
      question: textField('Question', 0, true),
      answer: richtextField('Réponse', 1),
    },
  },
  {
    name: 'service_card',
    display_name: 'Atome - Carte service',
    is_root: false,
    is_nestable: true,
    schema: {
      icon: imageField('Icône (SVG)', 0),
      title: textField('Titre', 1, true),
      description: textareaField('Description', 2),
    },
  },
  {
    name: 'feature',
    display_name: 'Atome - Point fort',
    is_root: false,
    is_nestable: true,
    schema: {
      icon: imageField('Icône (optionnelle)', 0),
      title: textField('Titre', 1, true),
      description: textareaField('Description', 2),
    },
  },
  {
    name: 'stat',
    display_name: 'Atome - Statistique',
    is_root: false,
    is_nestable: true,
    schema: {
      value: textField('Valeur (ex: 13)', 0, true),
      label: textField('Libellé', 1, true),
      icon: imageField('Icône (optionnelle)', 2),
    },
  },
  {
    name: 'testimonial',
    display_name: 'Atome - Témoignage',
    is_root: false,
    is_nestable: true,
    schema: {
      quote: textareaField('Citation', 0, true),
      name: textNoTranslate('Nom du voyageur', 1, true),
      apartment: textNoTranslate('Appartement', 2),
      stay: textField('Période du séjour (ex: Avril 2026)', 3),
    },
  },
  {
    name: 'quartier',
    display_name: 'Atome - Quartier',
    is_root: false,
    is_nestable: true,
    schema: {
      name: textNoTranslate('Nom du quartier', 0, true),
      slug: textNoTranslate('Slug (URL)', 1),
      description: textareaField('Description', 2),
      image: imageField('Image', 3),
    },
  },
  {
    name: 'panel',
    display_name: 'Atome - Panneau (carousel expérience)',
    is_root: false,
    is_nestable: true,
    schema: {
      image: imageField('Image', 0),
      label: textField('Label', 1, true),
      title: textareaField('Titre', 2, true),
    },
  },
  {
    name: 'founder',
    display_name: 'Atome - Fondateur',
    is_root: false,
    is_nestable: true,
    schema: {
      name: textNoTranslate('Nom', 0, true),
      role: textField('Rôle', 1, true),
      image: imageField('Portrait', 2, true),
      alt: textField('Texte alternatif (a11y)', 3),
    },
  },
  {
    name: 'concept_point',
    display_name: 'Atome - Point de concept',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textField('Titre', 0, true),
      description: textareaField('Description', 1),
    },
  },
  {
    name: 'subject_option',
    display_name: 'Atome - Option sujet (formulaire)',
    is_root: false,
    is_nestable: true,
    schema: {
      value: textNoTranslate('Valeur (id technique)', 0, true),
      label: textField('Libellé', 1, true),
    },
  },
  {
    name: 'social_link',
    display_name: 'Atome - Réseau social',
    is_root: false,
    is_nestable: true,
    schema: {
      platform: selectField('Plateforme', 0, [
        { name: 'Instagram', value: 'instagram' },
        { name: 'Facebook', value: 'facebook' },
        { name: 'X (Twitter)', value: 'x' },
        { name: 'LinkedIn', value: 'linkedin' },
        { name: 'TikTok', value: 'tiktok' },
        { name: 'YouTube', value: 'youtube' },
      ]),
      url: textNoTranslate('URL', 1, true),
    },
  },
  {
    name: 'lyon_service_item',
    display_name: 'Atome - Service Lyon (icône inline)',
    is_root: false,
    is_nestable: true,
    schema: {
      icon: selectField('Icône', 0, [
        { name: 'Construction', value: 'construction' },
        { name: 'Clé', value: 'key' },
        { name: 'Ménage', value: 'cleaning' },
        { name: 'Calendrier', value: 'calendar' },
      ]),
      label: textField('Libellé', 1, true),
    },
  },
]

// ---------------------------------------------------------------------------
// Bloks de section (composables dans page.body[])
// ---------------------------------------------------------------------------

const heightOptions = [
  { name: 'Plein écran (100vh)', value: 'svh' },
  { name: 'Fixe (442px)', value: 'fixed-442' },
  { name: 'Auto', value: 'auto' },
]

const SECTIONS: ComponentDefinition[] = [
  {
    name: 'hero_section',
    display_name: 'Section - Hero plein',
    is_root: false,
    is_nestable: true,
    schema: {
      background_image: imageField('Image de fond', 0, true),
      overlay_image: imageField('Image superposée (optionnelle)', 1),
      eyebrow: textField('Sur-titre (optionnel)', 2),
      title_mode: selectField(
        'Mode du titre',
        3,
        [
          { name: 'Mots espacés (3 parties)', value: 'parts' },
          { name: 'Titre simple', value: 'simple' },
        ],
        'simple',
      ),
      title: textField('Titre', 4),
      title_part_1: textField('Mot 1 (mode "parts")', 5),
      title_part_2: textField('Mot 2 (mode "parts")', 6),
      title_part_3: textField('Mot 3 (mode "parts")', 7),
      subtitle: textareaField('Sous-titre (optionnel)', 8),
      ctas: bloksField('Boutons CTA', 9, ['cta_button'], 3),
      show_search_bar: boolField('Afficher la barre de recherche', 10, false),
      height: selectField('Hauteur', 11, heightOptions, 'svh'),
    },
  },
  {
    name: 'hero_compact_section',
    display_name: 'Section - Hero compact',
    is_root: false,
    is_nestable: true,
    schema: {
      background_image: imageField('Image de fond', 0, true),
      eyebrow: textField('Sur-titre (optionnel)', 1),
      title: textField('Titre', 2, true),
      body: textareaField('Texte d’intro', 3),
      height: selectField('Hauteur', 4, heightOptions, 'fixed-442'),
    },
  },
  {
    name: 'text_section',
    display_name: 'Section - Texte simple',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1),
      body: richtextField('Corps', 2),
      max_width: selectField(
        'Largeur max',
        3,
        [
          { name: 'Étroite (prose)', value: 'prose' },
          { name: 'Pleine largeur', value: 'full' },
        ],
        'prose',
      ),
      alignment: selectField(
        'Alignement',
        4,
        [
          { name: 'Gauche', value: 'left' },
          { name: 'Centré', value: 'center' },
        ],
        'left',
      ),
    },
  },
  {
    name: 'booking_deposit_notice',
    display_name: 'Réservation - Mention caution',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textField('Titre', 0, true),
      body: textareaField('Mention relative à la caution', 1, true),
    },
  },
  {
    name: 'home_about_section',
    display_name: 'Accueil - À propos (kicker + citation + stats)',
    is_root: false,
    is_nestable: true,
    schema: {
      kicker: textField('Phrase d’intro (haut)', 0),
      quote: textareaField('Citation principale', 1, true),
      locations_label: textField('Libellé stat - Lieux', 2),
      travelers_label: textField('Libellé stat - Voyageurs', 3),
    },
  },
  {
    name: 'image_text_section',
    display_name: 'Section - Image + Texte',
    is_root: false,
    is_nestable: true,
    schema: {
      image: imageField('Image', 0, true),
      image_position: selectField(
        'Position de l’image',
        1,
        [
          { name: 'À gauche', value: 'left' },
          { name: 'À droite', value: 'right' },
        ],
        'left',
      ),
      eyebrow: textField('Sur-titre', 2),
      title: textField('Titre', 3, true),
      body: richtextField('Corps', 4),
      points: bloksField('Points (optionnels)', 5, ['concept_point']),
      ctas: bloksField('Boutons CTA', 6, ['cta_button'], 2),
    },
  },
  {
    name: 'feature_grid_section',
    display_name: 'Section - Grille de points forts',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1),
      intro: textareaField('Intro', 2),
      columns: selectField(
        'Colonnes',
        3,
        [
          { name: '2 colonnes', value: '2' },
          { name: '3 colonnes', value: '3' },
          { name: '4 colonnes', value: '4' },
        ],
        '3',
      ),
      features: bloksField('Points forts', 4, ['feature']),
      variant: selectField(
        'Variante visuelle',
        5,
        [
          { name: 'Avec icônes', value: 'icons' },
          { name: 'Numérotés', value: 'numbered' },
          { name: 'Texte seul', value: 'plain' },
        ],
        'icons',
      ),
    },
  },
  {
    name: 'stats_section',
    display_name: 'Section - Statistiques',
    is_root: false,
    is_nestable: true,
    schema: {
      items: bloksField('Statistiques', 0, ['stat']),
      logos: multiAssetField('Logos presse', 1),
      logo_label: textField('Label "Vu sur" (optionnel)', 2),
      variant: selectField(
        'Variante visuelle',
        3,
        [
          { name: 'Fond foncé', value: 'dark' },
          { name: 'Fond clair', value: 'light' },
          { name: 'Fond sable', value: 'sand' },
        ],
        'sand',
      ),
    },
  },
  {
    name: 'cta_section',
    display_name: 'Section - Appel à l’action',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1, true),
      body: textareaField('Corps', 2),
      ctas: bloksField('Boutons', 3, ['cta_button'], 3),
      variant: selectField(
        'Variante visuelle',
        4,
        [
          { name: 'Crème', value: 'cream' },
          { name: 'Café (foncé)', value: 'coffee' },
          { name: 'Sable', value: 'sand' },
          { name: 'Dégradé', value: 'gradient' },
        ],
        'cream',
      ),
    },
  },
  {
    name: 'testimonials_section',
    display_name: 'Section - Témoignages',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1),
      source: selectField(
        'Source des témoignages',
        2,
        [
          { name: 'Définis ci-dessous', value: 'inline' },
          { name: 'Globaux (Globals > Témoignages)', value: 'global' },
        ],
        'global',
      ),
      items: bloksField('Témoignages (mode "Définis ci-dessous")', 3, ['testimonial']),
    },
  },
  {
    name: 'services_section',
    display_name: 'Section - Services',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1),
      intro: textareaField('Intro', 2),
      items: bloksField('Services', 3, ['service_card']),
      variant: selectField(
        'Variante visuelle',
        4,
        [
          { name: 'Grille standard', value: 'grid' },
          { name: 'Liste', value: 'list' },
          { name: 'Cartes dégradé', value: 'gradient-cards' },
        ],
        'grid',
      ),
    },
  },
  {
    name: 'faq_section',
    display_name: 'Section - FAQ',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1, true),
      source: selectField(
        'Source des questions',
        2,
        [
          { name: 'Définies ci-dessous', value: 'inline' },
          { name: 'Globale (Globals > FAQ appartements)', value: 'global' },
        ],
        'inline',
      ),
      items: bloksField('Questions (mode "Définies ci-dessous")', 3, ['faq_item']),
    },
  },
  {
    name: 'apartments_grid_section',
    display_name: 'Section - Grille d’appartements',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      paris_title: textField('Titre groupe Paris', 1),
      lyon_title: textField('Titre groupe Lyon', 2),
      city_filter: selectField(
        'Ville',
        3,
        [
          { name: 'Toutes', value: 'all' },
          { name: 'Paris uniquement', value: 'paris' },
          { name: 'Lyon uniquement', value: 'lyon' },
        ],
        'all',
      ),
      max_per_city: numberField('Maximum par ville (0 = tous)', 4, 0),
      show_search_bar: boolField('Afficher la barre de recherche au-dessus', 5, false),
      display_mode: selectField(
        'Affichage',
        6,
        [
          { name: 'Carousel', value: 'carousel' },
          { name: 'Grille complète', value: 'grid' },
          { name: 'Lyon - 3 cartes', value: 'lyon-3-cards' },
        ],
        'carousel',
      ),
    },
  },
  {
    name: 'blog_grid_section',
    display_name: 'Section - Articles de blog',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1),
      intro: textareaField('Intro', 2),
      max_items: numberField('Nombre d’articles affichés', 3, 6),
      section_filter: selectField(
        'Filtre par section',
        4,
        [
          { name: 'Tous', value: 'all' },
          { name: 'Lyon', value: 'lyon' },
          { name: 'Paris', value: 'paris' },
        ],
        'all',
      ),
      cta_label: textField('Libellé bouton', 5),
      cta_link: linkField('Lien bouton', 6),
      fallback_subtitle: textField('Sous-titre par défaut (si article sans)', 7),
      reading_time_label: textField('Format temps de lecture', 8),
      pagination_previous_label: textField('Libellé "Précédent"', 9),
      pagination_next_label: textField('Libellé "Suivant"', 10),
    },
  },
  {
    name: 'quartiers_section',
    display_name: 'Section - Quartiers',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1, true),
      items: bloksField('Quartiers', 2, ['quartier']),
    },
  },
  {
    name: 'panels_section',
    display_name: 'Section - Carousel panneaux (expérience)',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      button_label: textField('Libellé bouton', 1),
      button_link: linkField('Lien bouton', 2),
      panels: bloksField('Panneaux (4)', 3, ['panel'], 4),
    },
  },
  {
    name: 'founders_section',
    display_name: 'Section - Fondateurs',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1, true),
      body: textareaField('Texte d’intro', 2),
      link_label: textField('Libellé du lien (optionnel)', 3),
      link_url: linkField('Lien (optionnel)', 4),
      founders: bloksField('Fondateurs', 5, ['founder']),
    },
  },
  {
    name: 'about_reality_section',
    display_name: 'Section - Histoire (About)',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textField('Titre', 0, true),
      paragraphs: {
        type: 'textarea',
        pos: 1,
        display_name: 'Paragraphes',
        translatable: true,
      },
    },
  },
  {
    name: 'concept_section',
    display_name: 'Section - Concept (About)',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textField('Titre', 0, true),
      image: imageField('Image', 1, true),
      image_alt: textField('Texte alternatif image', 2),
      points: bloksField('Points', 3, ['concept_point']),
    },
  },
  {
    name: 'guarantees_section',
    display_name: 'Section - Garanties (About)',
    is_root: false,
    is_nestable: true,
    schema: {
      image: imageField('Image', 0, true),
      eyebrow: textField('Sur-titre', 1),
      title: textField('Titre', 2),
      items: bloksField('Garanties', 3, ['feature']),
    },
  },
  {
    name: 'invest_model_section',
    display_name: 'Section - Modèle (Investir)',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1, true),
      image: imageField('Image', 2, true),
      image_alt: textField('Texte alternatif image', 3),
      points: bloksField('Points', 4, ['feature']),
    },
  },
  {
    name: 'invest_stats_section',
    display_name: 'Section - Statistiques (Investir)',
    is_root: false,
    is_nestable: true,
    schema: {
      line_one: textField('Ligne 1', 0, true),
      line_two: textField('Ligne 2', 1),
      body: textareaField('Texte sous les chiffres', 2),
      seen_on_label: textField('Label "Vu sur"', 3),
      logos: multiAssetField('Logos presse', 4),
    },
  },
  {
    name: 'blog_index_section',
    display_name: 'Blog - Page index complète',
    is_root: false,
    is_nestable: true,
    schema: {
      story_arrival_image: imageField('Carte éditoriale - Arrivée', 0, true),
      story_checkin_image: imageField('Carte éditoriale - Check-in', 1, true),
      note: textareaField(
        'Note pour l’éditeur (la mise en page complète reste pilotée par le code)',
        2,
      ),
    },
  },
  {
    name: 'notre_histoire_section',
    display_name: 'Notre histoire - Page complète',
    is_root: false,
    is_nestable: true,
    schema: {
      hero_kicker: textField('Hero - Sur-titre', 0),
      hero_title: textField('Hero - Titre', 1),
      hero_body: textareaField('Hero - Texte', 2),
      reality_title: textField('Section "Réalité" - Titre', 3),
      service_title: textField('Section "Services" - Titre', 4),
      service_body: textareaField('Section "Services" - Texte', 5),
      concept_title: textField('Section "Concept" - Titre', 6),
      team_eyebrow: textField('Section "Équipe" - Sur-titre', 7),
      team_title: textField('Section "Équipe" - Titre', 8),
      team_body: textareaField('Section "Équipe" - Texte', 9),
      team_link_label: textField('Section "Équipe" - Libellé bouton', 10),
      team_link_url: linkField('Section "Équipe" - Lien bouton', 11),
      hero_image: imageField('Hero - Image principale', 12, true),
      concept_image: imageField('Concept - Image latérale', 13, true),
      guarantees_image: imageField('Garanties - Image latérale', 14, true),
      founder_paul_image: imageField('Fondateur - Paul', 15, true),
      founder_mayeul_image: imageField('Fondateur - Mayeul', 16, true),
      founder_benjamin_image: imageField('Fondateur - Benjamin', 17, true),
    },
  },
  {
    name: 'lyon_hero_section',
    display_name: 'Lyon - Hero',
    is_root: false,
    is_nestable: true,
    schema: {
      background_image: imageField('Image de fond', 0, true),
      eyebrow: textField('Sur-titre (ex: Lyon)', 1),
      title: textField('Titre', 2, true),
      body: textField('Texte sous le titre', 3),
      show_search_bar: boolField('Afficher la barre de recherche', 4, true),
    },
  },
  {
    name: 'lyon_stats_section',
    display_name: 'Lyon - Statistiques',
    is_root: false,
    is_nestable: true,
    schema: {
      title: textareaField('Titre principal', 0, true),
      body: textareaField('Texte sous le titre', 1),
      seen_on_label: textField('Label "Vu sur"', 2),
      press_logo: imageField('Logo presse', 3),
      monocle_logo: imageField('Logo Monocle', 4),
    },
  },
  {
    name: 'lyon_services_section',
    display_name: 'Lyon - Services',
    is_root: false,
    is_nestable: true,
    schema: {
      image: imageField('Image latérale', 0, true),
      eyebrow: textField('Sur-titre', 1),
      title: textField('Titre', 2, true),
      services: {
        type: 'bloks',
        pos: 3,
        display_name: 'Services (icônes + libellé)',
        restrict_components: true,
        component_whitelist: ['lyon_service_item'],
      },
      footer_text: textareaField('Texte sous les services', 4),
      cta_label: textField('Libellé bouton', 5),
      cta_link: linkField('Lien bouton', 6),
    },
  },
  {
    name: 'lyon_blog_section',
    display_name: 'Lyon - Encart blog (avec carte texte)',
    is_root: false,
    is_nestable: true,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre court', 1),
      headline: textField('Grand titre', 2, true),
      intro: textareaField('Texte d’intro', 3),
      max_items: numberField('Nombre d’articles', 4, 3),
      section_filter: selectField(
        'Filtre par section',
        5,
        [
          { name: 'Tous', value: 'all' },
          { name: 'Lyon', value: 'lyon' },
          { name: 'Paris', value: 'paris' },
        ],
        'lyon',
      ),
    },
  },
  {
    name: 'rich_text_section',
    display_name: 'Section - Texte riche (CGV, Confidentialité, ...)',
    is_root: false,
    is_nestable: true,
    schema: {
      body: richtextField('Contenu', 0),
      max_width: selectField(
        'Largeur max',
        1,
        [
          { name: 'Étroite (lecture)', value: 'prose' },
          { name: 'Pleine largeur', value: 'full' },
        ],
        'prose',
      ),
    },
  },
  {
    name: 'divider_section',
    display_name: 'Section - Séparateur',
    is_root: false,
    is_nestable: true,
    schema: {
      variant: selectField(
        'Type',
        0,
        [
          { name: 'Trait', value: 'line' },
          { name: 'Espace petit', value: 'spacer-sm' },
          { name: 'Espace grand', value: 'spacer-lg' },
          { name: 'Bloc sable', value: 'sand-block' },
        ],
        'spacer-lg',
      ),
    },
  },
]

// Liste des sections autorisées dans `page.body[]`
const PAGE_SECTION_WHITELIST = SECTIONS.map((s) => s.name)

// ---------------------------------------------------------------------------
// Content types root
// ---------------------------------------------------------------------------

const ROOTS: ComponentDefinition[] = [
  {
    name: 'page',
    display_name: 'Page composable',
    is_root: true,
    is_nestable: false,
    schema: {
      body: bloksField('Sections de la page', 0, PAGE_SECTION_WHITELIST),
    },
  },
  {
    name: 'header_global',
    display_name: 'Global - En-tête',
    is_root: true,
    is_nestable: false,
    schema: {
      logo_light: imageField('Logo (sur fond foncé)', 0),
      logo_dark: imageField('Logo (sur fond clair)', 1),
      book_label: textField('Libellé bouton "Réserver"', 2),
      map_label: textField('Libellé bouton "Carte"', 3),
      nav_primary: bloksField('Navigation principale', 4, ['link'], 4),
      nav_primary_descriptions: {
        type: 'textarea',
        pos: 5,
        display_name: 'Descriptions menu mobile (1 par ligne, ordre des liens primaires)',
        translatable: true,
      },
      nav_secondary: bloksField('Accès rapide (menu mobile)', 6, ['link'], 6),
      mobile_open_label: textField('Libellé "Ouvrir le menu" (a11y)', 7),
      mobile_close_label: textField('Libellé "Fermer le menu" (a11y)', 8),
      mobile_navigation_label: textField('Titre section "Navigation"', 9),
      mobile_quick_access_label: textField('Titre section "Accès rapide"', 10),
      mobile_footer_text: textareaField('Texte du pied de menu mobile', 11),
      mobile_footer_button_label: textField('Libellé bouton pied de menu', 12),
      mobile_footer_button_link: linkField('Lien bouton pied de menu', 13),
    },
  },
  {
    name: 'footer_global',
    display_name: 'Global - Pied de page',
    is_root: true,
    is_nestable: false,
    schema: {
      logo: imageField('Logo', 0),
      logo_aria_label: textField('Libellé a11y du logo', 1),
      cta_title: textField('Titre CTA contact', 2),
      cta_body: textareaField('Texte CTA contact', 3),
      cta_button: bloksField('Bouton CTA', 4, ['cta_button'], 1),
      nav_links: bloksField('Liens de navigation', 5, ['link']),
      copyright: textField('Texte copyright', 6),
      nav_aria_label: textField('Libellé a11y de la navigation', 7),
    },
  },
  {
    name: 'sticky_cta_global',
    display_name: 'Global - CTA flottant',
    is_root: true,
    is_nestable: false,
    schema: {
      enabled: boolField('Activé', 0, true),
      threshold_vh: numberField('Seuil d’apparition (% hauteur écran)', 1, 80),
    },
  },
  {
    name: 'shared_assets_global',
    display_name: 'Global - Assets partagés',
    is_root: true,
    is_nestable: false,
    schema: {
      location_avatar_1: imageField('Avatar lieux 1', 0),
      location_avatar_2: imageField('Avatar lieux 2', 1),
      location_avatar_3: imageField('Avatar lieux 3', 2),
      location_avatar_1_alt: textField('Alt avatar lieux 1', 3),
      location_avatar_2_alt: textField('Alt avatar lieux 2', 4),
      location_avatar_3_alt: textField('Alt avatar lieux 3', 5),
      traveler_avatar_1: imageField('Avatar voyageurs 1', 6),
      traveler_avatar_2: imageField('Avatar voyageurs 2', 7),
      traveler_avatar_3: imageField('Avatar voyageurs 3', 8),
      traveler_avatar_1_alt: textField('Alt avatar voyageurs 1', 9),
      traveler_avatar_2_alt: textField('Alt avatar voyageurs 2', 10),
      traveler_avatar_3_alt: textField('Alt avatar voyageurs 3', 11),
      footer_background: imageField('Image de fond du footer', 12),
    },
  },
  {
    name: 'shared_testimonials_global',
    display_name: 'Global - Témoignages partagés',
    is_root: true,
    is_nestable: false,
    schema: {
      items: bloksField('Témoignages', 0, ['testimonial']),
    },
  },
  {
    name: 'faq_global',
    display_name: 'Global - FAQ appartements',
    is_root: true,
    is_nestable: false,
    schema: {
      eyebrow: textField('Sur-titre', 0),
      title: textField('Titre', 1),
      items: bloksField('Questions', 2, ['faq_item']),
    },
  },
]

export const ALL_COMPONENTS: ComponentDefinition[] = [...ATOMS, ...SECTIONS, ...ROOTS]
