interface Coordinates {
  lat?: number
  lng?: number
}

const LOCATION_BY_SLUG: Record<string, Required<Coordinates>> = {
  // Guesty contient des coordonnées incohérentes avec l’adresse Rue d’Algérie 21.
  'terreaux-iv': { lat: 45.7692822, lng: 4.8335897 },
}

export function getApartmentCoordinates(slug: string, coordinates: Coordinates) {
  return LOCATION_BY_SLUG[slug] ?? coordinates
}
