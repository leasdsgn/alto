const NEIGHBORHOOD_BY_SLUG: Record<string, string> = {
  'le-faubourg': 'Le Marais',
  'l-opera': '9e arr.',
  'le-saint-germain': '6e arr.',
  'le-marais': 'Le Marais',
  'le-bellecour': "Presqu'île",
  'les-terreaux': 'Terreaux',
  'le-vieux-lyon': 'Vieux-Lyon',
  'la-croix-rousse': 'Croix-Rousse',
  'voltaire-i': 'République',
  'voltaire-ii': 'République',
  'voltaire-iii': 'République',
  capucine: 'Opéra',
  'terreaux-i': 'Terreaux',
  'terreaux-ii': 'Terreaux',
  'terreaux-iii': 'Terreaux',
  'terreaux-iv': 'Terreaux',
  'constantine-i': 'Terreaux',
  'constantine-ii': 'Terreaux',
  'constantine-i-et-ii': 'Terreaux',
}

export function getNeighborhoodBySlug(slug: string) {
  return NEIGHBORHOOD_BY_SLUG[slug] ?? ''
}
