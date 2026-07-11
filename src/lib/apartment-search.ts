interface ApartmentSearchParamsInput {
  city: string
  guests: number
  dates?: {
    checkIn: string
    checkOut: string
  } | null
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
