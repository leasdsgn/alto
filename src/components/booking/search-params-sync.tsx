'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { parseDate } from '@internationalized/date'
import { useSearchStore } from '@/lib/stores/search'

export function SearchParamsSync() {
  const params = useSearchParams()
  const setCity = useSearchStore((s) => s.setCity)
  const setDates = useSearchStore((s) => s.setDates)
  const setGuests = useSearchStore((s) => s.setGuests)

  useEffect(() => {
    const city = params.get('city')
    const checkIn = params.get('checkIn')
    const checkOut = params.get('checkOut')
    const guests = params.get('guests')

    if (city) setCity(capitalize(city))

    if (checkIn && checkOut) {
      try {
        setDates({ start: parseDate(checkIn), end: parseDate(checkOut) })
      } catch {
        // ignore dates invalides
      }
    }

    if (guests) {
      const n = Number(guests)
      if (Number.isFinite(n) && n > 0) setGuests(n)
    }
  }, [params, setCity, setDates, setGuests])

  return null
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
