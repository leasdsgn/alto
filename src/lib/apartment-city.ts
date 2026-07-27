const SUPPORTED_CITIES = ['paris', 'lyon'] as const

interface ApartmentLocation {
  city?: string
  address?: string
}

export function normalizeCity(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function getApartmentCityKey(apartment: ApartmentLocation): string {
  const city = normalizeCity(apartment.city)
  if (city) return city

  const address = normalizeCity(apartment.address)
  return SUPPORTED_CITIES.find((candidate) => address.includes(candidate)) ?? ''
}

export function filterApartmentsByCity<T extends ApartmentLocation>(
  apartments: T[],
  city: string,
): T[] {
  const needle = normalizeCity(city)
  if (!needle) return apartments

  return apartments.filter((apartment) => isApartmentInCity(apartment, needle))
}

export function isApartmentInCity(apartment: ApartmentLocation, city: string): boolean {
  return getApartmentCityKey(apartment).includes(normalizeCity(city))
}
