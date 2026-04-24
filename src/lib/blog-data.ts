export interface BlogArticle {
  slug: string
  title: string
  subtitle: string
  date: string
  category: string
  image: string
  sections: Array<{
    label?: string
    heading: string
    body: string
  }>
}

export const BLOG_CATEGORIES = {
  fr: ['Tous', 'Quartiers', 'Adresses', 'Architecture'],
  en: ['All', 'Districts', 'Addresses', 'Architecture'],
}

export const BLOG_ARTICLES_BY_LOCALE: Record<'fr' | 'en', BlogArticle[]> = {
  fr: [
    {
      slug: 'le-marais-a-hauteur-de-regard',
      title: 'Le Marais à hauteur de regard',
      subtitle: 'Adresses confidentielles et façades d\'époque.',
      date: '12 mars 2026',
      category: 'Quartiers',
      image: '/images/alto-salon.jpg',
      sections: [
      {
        heading: 'Le Marais ne se traverse pas, il s\'observe.',
        body: 'Derrière ses façades patinées, ses portes cochères et ses pavés irréguliers, le quartier dévoile un dialogue subtil entre patrimoine et création contemporaine.\nIci, chaque détail mérite qu\'on ralentisse le pas.',
      },
      {
        label: 'Un musée à ciel ouvert',
        heading: 'Du XVIIe siècle aux lignes plus modernistes, le Marais concentre certaines des plus belles architectures parisiennes.',
        body: 'Les hôtels particuliers, discrets derrière leurs murs de pierre, racontent une époque où l\'élégance se lisait dans la symétrie des fenêtres et la délicatesse des ferronneries.\n\nLever les yeux suffit : mascarons sculptés, balcons ouvragés, encadrements délicatement moulurés. Une richesse silencieuse, presque intime.',
      },
      {
        label: 'Entre effervescence et douceur de vivre',
        heading: 'Le matin, la lumière de l\'est glisse le long des façades et révèle les nuances de la pierre.',
        body: 'Les cafés installent leurs premières tables, les riverains saluent les commerçants.\n\nLe soir, le quartier s\'anime sans jamais perdre son équilibre. Les terrasses se remplissent, les conversations se prolongent, et l\'atmosphère reste étonnamment apaisée.\n\nC\'est ce contraste qui définit le Marais : vivant mais jamais bruyant, animé mais toujours élégant.',
      },
      ],
    },
    {
      slug: 'un-week-end-a-saint-germain',
      title: 'Un week-end à Saint-Germain',
      subtitle: 'Librairies, terrasses et adresses choisies.',
      date: '12 mars 2026',
      category: 'Adresses',
      image: '/images/alto-salon.jpg',
      sections: [
      {
        heading: 'Saint-Germain est un quartier qui se mérite.',
        body: 'Il ne livre pas ses secrets au premier passage. Il faut s\'asseoir, observer, revenir.',
      },
      ],
    },
    {
      slug: 'autour-de-l-opera',
      title: 'Autour de l\'Opéra',
      subtitle: 'Grandeur haussmannienne et nouvelles tables parisiennes.',
      date: '12 mars 2026',
      category: 'Quartiers',
      image: '/images/alto-salon.jpg',
      sections: [
      {
        heading: 'L\'Opéra Garnier impose sa majesté.',
        body: 'Autour, les grands boulevards dessinent un Paris monumental, ponctué de terrasses et de nouvelles adresses.',
      },
      ],
    },
    {
      slug: 'vivre-le-marais-autrement',
      title: 'Vivre le Marais autrement',
      subtitle: 'Galeries discrètes et cours pavées.',
      date: '12 mars 2026',
      category: 'Quartiers',
      image: '/images/alto-salon.jpg',
      sections: [
      {
        heading: 'Le Marais recèle des trésors cachés.',
        body: 'Derrière les portes cochères, des cours pavées mènent à des galeries d\'art, des ateliers et des jardins secrets.',
      },
      ],
    },
    {
      slug: 'paris-cote-architecture',
      title: 'Paris côté architecture',
      subtitle: 'Moulures, lumière et art de vivre.',
      date: '12 mars 2026',
      category: 'Architecture',
      image: '/images/alto-salon.jpg',
      sections: [
      {
        heading: 'L\'architecture parisienne est un art de vivre.',
        body: 'Chaque immeuble raconte une histoire, chaque moulure est un héritage.',
      },
      ],
    },
    {
      slug: 'saint-germain-heritage-et-design',
      title: 'Saint-Germain, entre héritage littéraire et design contemporain',
      subtitle: 'Où le passé rencontre l\'avant-garde.',
      date: '12 mars 2026',
      category: 'Adresses',
      image: '/images/alto-salon.jpg',
      sections: [
      {
        heading: 'Saint-Germain réinvente sa légende.',
        body: 'Entre les librairies mythiques et les concept stores, le quartier écrit un nouveau chapitre.',
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
      image: '/images/alto-salon.jpg',
      sections: [
        {
          heading: 'Le Marais is not crossed, it is observed.',
          body: 'Behind its weathered façades, carriage doors and uneven paving stones, the district reveals a subtle dialogue between heritage and contemporary creation.\nEvery detail invites a slower pace.',
        },
        {
          label: 'An open-air museum',
          heading: 'From seventeenth-century lines to more modern silhouettes, Le Marais gathers some of Paris’ most beautiful architecture.',
          body: 'Private mansions sit quietly behind stone walls, recalling a time when elegance lived in window symmetry and delicate ironwork.\n\nLook up and the details appear: carved mascarons, worked balconies, finely moulded frames. A quiet, intimate richness.',
        },
      ],
    },
    {
      slug: 'un-week-end-a-saint-germain',
      title: 'A weekend in Saint-Germain',
      subtitle: 'Bookshops, terraces and selected addresses.',
      date: '12 March 2026',
      category: 'Addresses',
      image: '/images/alto-salon.jpg',
      sections: [
        {
          heading: 'Saint-Germain is a district that asks for time.',
          body: 'It does not reveal everything on a first visit. You sit down, observe, return.',
        },
      ],
    },
    {
      slug: 'autour-de-l-opera',
      title: 'Around the Opéra',
      subtitle: 'Haussmannian scale and new Paris tables.',
      date: '12 March 2026',
      category: 'Districts',
      image: '/images/alto-salon.jpg',
      sections: [
        {
          heading: 'The Opéra Garnier sets the tone.',
          body: 'Around it, the grands boulevards draw a monumental Paris, punctuated by terraces and new addresses.',
        },
      ],
    },
    {
      slug: 'vivre-le-marais-autrement',
      title: 'Living Le Marais differently',
      subtitle: 'Quiet galleries and paved courtyards.',
      date: '12 March 2026',
      category: 'Districts',
      image: '/images/alto-salon.jpg',
      sections: [
        {
          heading: 'Le Marais hides its best details.',
          body: 'Behind carriage doors, paved courtyards lead to art galleries, studios and secret gardens.',
        },
      ],
    },
    {
      slug: 'paris-cote-architecture',
      title: 'Paris through architecture',
      subtitle: 'Mouldings, light and the art of living.',
      date: '12 March 2026',
      category: 'Architecture',
      image: '/images/alto-salon.jpg',
      sections: [
        {
          heading: 'Parisian architecture is an art of living.',
          body: 'Every building tells a story, every moulding carries an inheritance.',
        },
      ],
    },
    {
      slug: 'saint-germain-heritage-et-design',
      title: 'Saint-Germain, between literary heritage and contemporary design',
      subtitle: 'Where the past meets the avant-garde.',
      date: '12 March 2026',
      category: 'Addresses',
      image: '/images/alto-salon.jpg',
      sections: [
        {
          heading: 'Saint-Germain is rewriting its legend.',
          body: 'Between historic bookshops and concept stores, the district opens a new chapter.',
        },
      ],
    },
  ],
}

export const BLOG_ARTICLES = BLOG_ARTICLES_BY_LOCALE.fr

export function getFallbackBlogArticles(locale: 'fr' | 'en') {
  return BLOG_ARTICLES_BY_LOCALE[locale]
}
