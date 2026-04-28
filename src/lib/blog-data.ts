export type BlogSectionKey = 'paris' | 'lyon' | 'voyage'

export interface BlogArticle {
  slug: string
  title: string
  subtitle: string
  date: string
  category: string
  image: string
  section: BlogSectionKey
  sections: Array<{
    label?: string
    heading: string
    body: string
  }>
}

export const BLOG_CATEGORIES = {
  fr: ['Tous', 'Quartiers', 'Adresses', 'Architecture', 'Voyages'],
  en: ['All', 'Districts', 'Addresses', 'Architecture', 'Travel'],
}

export const BLOG_ARTICLES_BY_LOCALE: Record<'fr' | 'en', BlogArticle[]> = {
  fr: [
    {
      slug: 'le-marais-a-hauteur-de-regard',
      title: 'Le Marais à hauteur de regard',
      subtitle: 'Adresses confidentielles et façades d’époque.',
      date: '12 mars 2026',
      category: 'Quartiers',
      image: '/images/blog-1.jpg',
      section: 'paris',
      sections: [
        {
          heading: 'Le Marais ne se traverse pas, il s’observe.',
          body: 'Derrière ses façades patinées, ses portes cochères et ses pavés irréguliers, le quartier dévoile un dialogue subtil entre patrimoine et création contemporaine.\nIci, chaque détail mérite qu’on ralentisse le pas.',
        },
        {
          label: 'Un musée à ciel ouvert',
          heading:
            'Entre hôtels particuliers, cours silencieuses et vitrines plus pointues, le quartier garde une élégance très parisienne.',
          body: 'Les adresses les plus intéressantes se découvrent souvent à quelques mètres de l’artère principale. Il faut accepter de sortir du flux, regarder les seuils, observer la lumière qui entre dans les passages.',
        },
      ],
    },
    {
      slug: 'un-week-end-a-saint-germain',
      title: 'Un week-end à Saint-Germain',
      subtitle: 'Librairies, terrasses et adresses choisies.',
      date: '12 mars 2026',
      category: 'Adresses',
      image: '/images/blog-2.jpg',
      section: 'paris',
      sections: [
        {
          heading: 'Saint-Germain demande un rythme plus lent.',
          body: 'Le quartier se révèle dans les habitudes. Un café tôt le matin, une librairie avant l’affluence, une rue calme à la fin du jour. Ce n’est pas un décor, c’est une cadence.',
        },
      ],
    },
    {
      slug: 'autour-de-l-opera',
      title: 'Autour de l’Opéra',
      subtitle: 'Grandeur haussmannienne et nouvelles tables parisiennes.',
      date: '12 mars 2026',
      category: 'Architecture',
      image: '/images/blog-3.jpg',
      section: 'paris',
      sections: [
        {
          heading: 'Autour de l’Opéra, Paris devient plus ample.',
          body: 'Les grands boulevards, les façades de pierre blonde et les halls monumentaux composent une expérience plus théâtrale. Le quartier mélange institutions, hôtels historiques et nouvelles adresses bien installées.',
        },
      ],
    },
    {
      slug: 'lyon-entre-terrasses-et-traboules',
      title: 'Lyon entre terrasses et traboules',
      subtitle: 'Une ville à parcourir à pied, quartier par quartier.',
      date: '19 mars 2026',
      category: 'Quartiers',
      image: '/images/lyon/blog-terreaux.jpg',
      section: 'lyon',
      sections: [
        {
          heading: 'Lyon se découvre en séquences très différentes.',
          body: 'La Presqu’île déroule ses façades ordonnancées, le Vieux Lyon joue sur les passages et les cours intérieures, les pentes installent une relation plus directe avec la ville. Chaque morceau impose un rythme propre.',
        },
      ],
    },
    {
      slug: '48-heures-autour-de-bellecour',
      title: '48 heures autour de Bellecour',
      subtitle: 'Un itinéraire dense, élégant et très marchable.',
      date: '19 mars 2026',
      category: 'Adresses',
      image: '/images/lyon/apt-bellecour.jpg',
      section: 'lyon',
      sections: [
        {
          heading: 'Bellecour est un point de départ très lisible.',
          body: 'On rejoint rapidement les quais, les commerces, les restaurants et plusieurs musées. C’est un bon ancrage pour un séjour court, à condition de sélectionner quelques haltes plutôt que tout vouloir faire.',
        },
      ],
    },
    {
      slug: 'vieux-lyon-et-escaliers-secrets',
      title: 'Vieux Lyon et escaliers secrets',
      subtitle: 'Patrimoine, lumière basse et détails à lever les yeux.',
      date: '19 mars 2026',
      category: 'Architecture',
      image: '/images/lyon/apt-vieux-lyon.jpg',
      section: 'lyon',
      sections: [
        {
          heading: 'Le Vieux Lyon récompense l’attention.',
          body: 'Sous les arches, dans les montées et les petites places, la ville révèle une matière plus ancienne. Le plaisir vient souvent de ce qui ne se voit pas depuis la rue principale.',
        },
      ],
    },
    {
      slug: 'preparer-un-sejour-sans-frictions',
      title: 'Préparer un séjour sans frictions',
      subtitle: 'Les quelques choix qui changent vraiment l’expérience.',
      date: '26 mars 2026',
      category: 'Voyages',
      image: '/images/blog-4.jpg',
      section: 'voyage',
      sections: [
        {
          heading: 'Le confort d’un séjour commence avant l’arrivée.',
          body: 'Choisir un quartier cohérent avec ses déplacements, anticiper l’heure d’arrivée et limiter les changements de plan inutiles simplifie tout. Une bonne expérience repose souvent sur une logistique discrète mais bien pensée.',
        },
      ],
    },
    {
      slug: 'voyager-leger-mais-bien',
      title: 'Voyager léger, mais bien',
      subtitle: 'Ce qu’il faut emporter, et ce qu’il faut laisser.',
      date: '26 mars 2026',
      category: 'Voyages',
      image: '/images/alto-salon.jpg',
      section: 'voyage',
      sections: [
        {
          heading: 'Mieux vaut un bagage simple qu’un bagage plein.',
          body: 'Un bon séjour tient rarement à la quantité d’objets emportés. Il tient plutôt à quelques essentiels fiables, faciles à retrouver et adaptés au programme réel du voyage.',
        },
      ],
    },
    {
      slug: 'choisir-un-pied-a-terre-bien-place',
      title: 'Choisir un pied-à-terre bien placé',
      subtitle: 'L’adresse juste vaut souvent plus qu’un grand programme.',
      date: '26 mars 2026',
      category: 'Voyages',
      image: '/images/hero-home.jpg',
      section: 'voyage',
      sections: [
        {
          heading: 'Le bon emplacement réduit tout ce qui fatigue.',
          body: 'Quand l’adresse permet de marcher, de revenir facilement entre deux rendez-vous et de profiter du quartier sans détour, le séjour devient plus souple. C’est souvent le critère qui a le plus d’effet.',
        },
      ],
    },
  ],
  en: [
    {
      slug: 'le-marais-a-hauteur-de-regard',
      title: 'Le Marais at eye level',
      subtitle: 'Quiet addresses and period façades.',
      date: '12 March 2026',
      category: 'Districts',
      image: '/images/blog-1.jpg',
      section: 'paris',
      sections: [
        {
          heading: 'Le Marais is not crossed, it is observed.',
          body: 'Behind weathered façades, carriage doors and uneven paving stones, the district reveals a measured dialogue between heritage and contemporary life.\nEvery detail asks for a slower pace.',
        },
      ],
    },
    {
      slug: 'un-week-end-a-saint-germain',
      title: 'A weekend in Saint-Germain',
      subtitle: 'Bookshops, terraces and selected addresses.',
      date: '12 March 2026',
      category: 'Addresses',
      image: '/images/blog-2.jpg',
      section: 'paris',
      sections: [
        {
          heading: 'Saint-Germain asks for a calmer tempo.',
          body: 'It reveals itself through habits. A coffee early in the morning, a bookshop before the rush, a quieter street at the end of the day. It is less a postcard than a rhythm.',
        },
      ],
    },
    {
      slug: 'autour-de-l-opera',
      title: 'Around the Opéra',
      subtitle: 'Haussmannian scale and new Paris tables.',
      date: '12 March 2026',
      category: 'Architecture',
      image: '/images/blog-3.jpg',
      section: 'paris',
      sections: [
        {
          heading: 'Around the Opéra, Paris becomes wider and more theatrical.',
          body: 'Grand boulevards, pale-stone façades and monumental lobbies create a different experience of the city, one shaped by scale, movement and carefully restored addresses.',
        },
      ],
    },
    {
      slug: 'lyon-entre-terrasses-et-traboules',
      title: 'Lyon between terraces and traboules',
      subtitle: 'A city best understood one district at a time.',
      date: '19 March 2026',
      category: 'Districts',
      image: '/images/lyon/blog-terreaux.jpg',
      section: 'lyon',
      sections: [
        {
          heading: 'Lyon unfolds in very distinct sequences.',
          body: 'Presqu’île offers a composed urban rhythm, Vieux Lyon plays with passages and inner courtyards, and the slopes create a more direct relationship with the city. Each area sets its own pace.',
        },
      ],
    },
    {
      slug: '48-heures-autour-de-bellecour',
      title: '48 hours around Bellecour',
      subtitle: 'A compact itinerary that remains elegant and easy to walk.',
      date: '19 March 2026',
      category: 'Addresses',
      image: '/images/lyon/apt-bellecour.jpg',
      section: 'lyon',
      sections: [
        {
          heading: 'Bellecour is a very readable base for a short stay.',
          body: 'Quays, shops, restaurants and museums stay close at hand. For a short visit, the value lies less in covering everything than in choosing the right sequence of stops.',
        },
      ],
    },
    {
      slug: 'vieux-lyon-et-escaliers-secrets',
      title: 'Old Lyon and hidden stairways',
      subtitle: 'Heritage, low light and details worth looking up for.',
      date: '19 March 2026',
      category: 'Architecture',
      image: '/images/lyon/apt-vieux-lyon.jpg',
      section: 'lyon',
      sections: [
        {
          heading: 'Old Lyon rewards attention.',
          body: 'Under the arches, along the climbs and through the smaller squares, the city reveals an older material quality. Much of the pleasure comes from what is not immediately visible from the main street.',
        },
      ],
    },
    {
      slug: 'preparer-un-sejour-sans-frictions',
      title: 'Preparing a stay without friction',
      subtitle: 'The small decisions that materially improve the trip.',
      date: '26 March 2026',
      category: 'Travel',
      image: '/images/blog-4.jpg',
      section: 'voyage',
      sections: [
        {
          heading: 'A comfortable stay starts before arrival.',
          body: 'Choosing the right district, anticipating the arrival window and reducing unnecessary plan changes simplifies everything. Good hospitality often begins with quiet logistics.',
        },
      ],
    },
    {
      slug: 'voyager-leger-mais-bien',
      title: 'Travel light, but well',
      subtitle: 'What to pack, and what to leave behind.',
      date: '26 March 2026',
      category: 'Travel',
      image: '/images/alto-salon.jpg',
      section: 'voyage',
      sections: [
        {
          heading: 'A lighter bag usually makes for a better stay.',
          body: 'The quality of a trip rarely depends on quantity. It depends on a few reliable essentials that are easy to find, easy to carry and actually useful once there.',
        },
      ],
    },
    {
      slug: 'choisir-un-pied-a-terre-bien-place',
      title: 'Choosing a well-placed pied-à-terre',
      subtitle: 'The right address often matters more than a long plan.',
      date: '26 March 2026',
      category: 'Travel',
      image: '/images/hero-home.jpg',
      section: 'voyage',
      sections: [
        {
          heading: 'The right location removes a lot of friction.',
          body: 'When you can walk, return easily between appointments and enjoy the district without detours, the whole stay becomes more flexible. In practice, this is often the deciding factor.',
        },
      ],
    },
  ],
}

export const BLOG_ARTICLES = BLOG_ARTICLES_BY_LOCALE.fr

export function getFallbackBlogArticles(locale: 'fr' | 'en') {
  return BLOG_ARTICLES_BY_LOCALE[locale]
}

const SECTION_ALIASES: Record<BlogSectionKey, string[]> = {
  paris: ['paris', 'marais', 'saint germain', 'opera', 'haussmann'],
  lyon: ['lyon', 'bellecour', 'terreaux', 'vieux lyon', 'croix rousse'],
  voyage: ['voyage', 'travel', 'week end', 'weekend', 'itineraire', 'sejour', 'guide'],
}

export function inferBlogSection(input: {
  section?: string | null
  city?: string | null
  category?: string | null
  slug?: string | null
  title?: string | null
  subtitle?: string | null
}): BlogSectionKey {
  const haystack = [
    input.section,
    input.city,
    input.category,
    input.slug,
    input.title,
    input.subtitle,
  ]
    .map(normalizeString)
    .filter(Boolean)
    .join(' ')

  for (const key of ['paris', 'lyon', 'voyage'] as const) {
    if (SECTION_ALIASES[key].some((alias) => haystack.includes(alias))) {
      return key
    }
  }

  return 'paris'
}

function normalizeString(value: string | null | undefined) {
  if (!value) return ''

  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
