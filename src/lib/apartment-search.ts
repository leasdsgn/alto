interface ApartmentSearchParamsInput {
  city: string
  guests: number
  dates?: {
    checkIn: string
    checkOut: string
  } | null
}

interface ApartmentWithGuestCapacity {
  guests: number
}

export function buildApartmentSearchParams({
  city,
  guests,
  dates,
}: ApartmentSearchParamsInput): URLSearchParams {
  const params = new URLSearchParams({
    city: city.toLowerCase(),
    guests: String(guests),
  })

  if (dates) {
    params.set('checkIn', dates.checkIn)
    params.set('checkOut', dates.checkOut)
  }

  return params
}

export function buildApartmentSearchHref(input: ApartmentSearchParamsInput): string {
  return `/appartements?${buildApartmentSearchParams(input)}`
}

export function filterApartmentsByGuestCapacity<T extends ApartmentWithGuestCapacity>(
  apartments: T[],
  guests?: number,
): T[] {
  if (!guests || !Number.isFinite(guests) || guests < 1) return apartments
  return apartments.filter((apartment) => apartment.guests >= guests)
}
