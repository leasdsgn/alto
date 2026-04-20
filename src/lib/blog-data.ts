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

export const BLOG_CATEGORIES = ['Tous', 'Quartiers', 'Adresses', 'Architecture']

export const BLOG_ARTICLES: BlogArticle[] = [
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
]
