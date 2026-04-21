'use client'

import useSWR from 'swr'
import { useCallback, useMemo } from 'react'
import type { DateValue } from '@internationalized/date'
import { today, getLocalTimeZone } from '@internationalized/date'
import type { GuestyCalendarDay } from '@/types/guesty'

const MONTHS_AHEAD = 12

async function fetcher(url: string): Promise<{ days: GuestyCalendarDay[] }> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`availability_fetch_failed_${response.status}`)
  return response.json()
}

export function useListingAvailability(listingId: string | null | undefined) {
  const { checkIn, checkOut } = useMemo(() => {
    const tz = getLocalTimeZone()
    const start = today(tz)
    const end = start.add({ months: MONTHS_AHEAD })
    return {
      checkIn: start.toString(),
      checkOut: end.toString(),
    }
  }, [])

  const key = listingId
    ? `/api/guesty/availability?listingId=${encodeURIComponent(listingId)}&checkIn=${checkIn}&checkOut=${checkOut}`
    : null

  const { data, error, isLoading } = useSWR<{ days: GuestyCalendarDay[] }>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  const unavailableSet = useMemo(() => {
    const set = new Set<string>()
    for (const day of data?.days ?? []) {
      if (day.status !== 'available') set.add(day.date.slice(0, 10))
    }
    return set
  }, [data])

  const isDateUnavailable = useCallback(
    (date: DateValue): boolean => unavailableSet.has(date.toString()),
    [unavailableSet],
  )

  return {
    isDateUnavailable,
    loading: isLoading,
    error: error instanceof Error ? error : null,
    hasData: Boolean(data),
  }
}
