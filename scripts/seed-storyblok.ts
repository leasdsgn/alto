/**
 * Script pour créer les articles placeholder dans Storyblok.
 * Usage : STORYBLOK_PERSONAL_TOKEN=xxx npx tsx scripts/seed-storyblok.ts
 */

const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN
const SPACE_ID = '291441851126938'

if (!TOKEN) {
  console.error('STORYBLOK_PERSONAL_TOKEN requis')
  process.exit(1)
}

const API = `https://mapi.storyblok.com/v1/spaces/${SPACE_ID}`

const headers = {
  Authorization: TOKEN,
  'Content-Type': 'application/json',
}

const ARTICLES = [
  {
    name: 'Le Marais à hauteur de regard',
    slug: 'le-marais-a-hauteur-de-regard',
    subtitle: "Adresses confidentielles et façades d'époque.",
    category: 'Quartiers',
    date: '2026-03-12',
    body: [
      {
        component: 'article_section',
        heading: "Le Marais ne se traverse pas, il s'observe.",
        text: "Derrière ses façades patinées, ses portes cochères et ses pavés irréguliers, le quartier dévoile un dialogue subtil entre patrimoine et création contemporaine.\nIci, chaque détail mérite qu'on ralentisse le pas.",
      },
      {
        component: 'article_section',
        label: 'Un musée à ciel ouvert',
        heading: 'Du XVIIe siècle aux lignes plus modernistes, le Marais concentre certaines des plus belles architectures parisiennes.',
        text: "Les hôtels particuliers, discrets derrière leurs murs de pierre, racontent une époque où l'élégance se lisait dans la symétrie des fenêtres et la délicatesse des ferronneries.",
      },
      {
        component: 'article_section',
        label: 'Entre effervescence et douceur de vivre',
        heading: "Le matin, la lumière de l'est glisse le long des façades et révèle les nuances de la pierre.",
        text: "Les cafés installent leurs premières tables, les riverains saluent les commerçants.\n\nC'est ce contraste qui définit le Marais : vivant mais jamais bruyant, animé mais toujours élégant.",
      },
    ],
  },
  {
    name: 'Un week-end à Saint-Germain',
    slug: 'un-week-end-a-saint-germain',
    subtitle: 'Librairies, terrasses et adresses choisies.',
    category: 'Adresses',
    date: '2026-03-12',
    body: [
      {
        component: 'article_section',
        heading: 'Saint-Germain est un quartier qui se mérite.',
        text: "Il ne livre pas ses secrets au premier passage. Il faut s'asseoir, observer, revenir.",
      },
    ],
  },
  {
    name: "Autour de l'Opéra",
    slug: 'autour-de-l-opera',
    subtitle: 'Grandeur haussmannienne et nouvelles tables parisiennes.',
    category: 'Quartiers',
    date: '2026-03-12',
    body: [
      {
        component: 'article_section',
        heading: "L'Opéra Garnier impose sa majesté.",
        text: 'Autour, les grands boulevards dessinent un Paris monumental, ponctué de terrasses et de nouvelles adresses.',
      },
    ],
  },
  {
    name: 'Vivre le Marais autrement',
    slug: 'vivre-le-marais-autrement',
    subtitle: 'Galeries discrètes et cours pavées.',
    category: 'Quartiers',
    date: '2026-03-12',
    body: [
      {
        component: 'article_section',
        heading: 'Le Marais recèle des trésors cachés.',
        text: "Derrière les portes cochères, des cours pavées mènent à des galeries d'art, des ateliers et des jardins secrets.",
      },
    ],
  },
  {
    name: 'Paris côté architecture',
    slug: 'paris-cote-architecture',
    subtitle: 'Moulures, lumière et art de vivre.',
    category: 'Architecture',
    date: '2026-03-12',
    body: [
      {
        component: 'article_section',
        heading: "L'architecture parisienne est un art de vivre.",
        text: 'Chaque immeuble raconte une histoire, chaque moulure est un héritage.',
      },
    ],
  },
  {
    name: 'Saint-Germain, entre héritage littéraire et design contemporain',
    slug: 'saint-germain-heritage-et-design',
    subtitle: "Où le passé rencontre l'avant-garde.",
    category: 'Adresses',
    date: '2026-03-12',
    body: [
      {
        component: 'article_section',
        heading: 'Saint-Germain réinvente sa légende.',
        text: 'Entre les librairies mythiques et les concept stores, le quartier écrit un nouveau chapitre.',
      },
    ],
  },
]

async function createComponent() {
  const res = await fetch(`${API}/components`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      component: {
        name: 'article',
        display_name: 'Article',
        is_root: true,
        is_nestable: false,
        schema: {
          title: { type: 'text', pos: 0, display_name: 'Titre' },
          subtitle: { type: 'text', pos: 1, display_name: 'Sous-titre' },
          category: { type: 'text', pos: 2, display_name: 'Catégorie' },
          date: { type: 'text', pos: 3, display_name: 'Date' },
          image: { type: 'image', pos: 4, display_name: 'Image' },
          sections: { type: 'bloks', pos: 5, display_name: 'Sections', restrict_components: true, component_whitelist: ['article_section'] },
        },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    if (text.includes('already exists')) {
      console.log('Component "article" existe déjà')
      return
    }
    console.error('Erreur création component article:', text)
    return
  }
  console.log('Component "article" créé')
}

async function createSectionComponent() {
  const res = await fetch(`${API}/components`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      component: {
        name: 'article_section',
        display_name: 'Section article',
        is_root: false,
        is_nestable: true,
        schema: {
          label: { type: 'text', pos: 0, display_name: 'Label' },
          heading: { type: 'text', pos: 1, display_name: 'Titre' },
          text: { type: 'textarea', pos: 2, display_name: 'Texte' },
        },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    if (text.includes('already exists')) {
      console.log('Component "article_section" existe déjà')
      return
    }
    console.error('Erreur création component article_section:', text)
    return
  }
  console.log('Component "article_section" créé')
}

async function createStory(article: (typeof ARTICLES)[0]) {
  const res = await fetch(`${API}/stories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      story: {
        name: article.name,
        slug: article.slug,
        parent_id: 0,
        content: {
          component: 'article',
          title: article.name,
          subtitle: article.subtitle,
          category: article.category,
          date: article.date,
          image: '',
          sections: article.body,
        },
      },
      publish: 1,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`Erreur création "${article.name}":`, text)
    return
  }
  console.log(`Article créé : ${article.name}`)
}

async function main() {
  console.log('Création des components...')
  await createSectionComponent()
  await createComponent()

  console.log('\nCréation des articles...')
  for (const article of ARTICLES) {
    await createStory(article)
  }

  console.log('\nTerminé.')
}

main()
