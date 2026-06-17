'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

interface DateRange {
  start: DateValue
  end: DateValue
}

interface SearchDateAvailabilityArgs {
  city: string
  guests: number
  dates: DateRange
  viewYear: number
  viewMonth: number
  enabled: boolean
}

const MAX_CACHE_ENTRIES = 40
const availabilityCache = new Map<string, string[]>()

export function useSearchDateAvailability({
  city,
  guests,
  dates,
  viewYear,
  viewMonth,
  enabled,
}: SearchDateAvailabilityArgs) {
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const nights = Math.max(1, dates.end.compare(dates.start))

  const range = useMemo(() => {
    const firstDay = new CalendarDate(viewYear, viewMonth, 1)
    const lastDay = new CalendarDate(viewYear, viewMonth, daysInMonth(viewYear, viewMonth))
    return { firstDay, lastDay }
  }, [viewMonth, viewYear])

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    const cacheKey = [
      city,
      guests,
      range.firstDay.toString(),
      range.lastDay.toString(),
      nights,
    ].join('|')

    const cached = availabilityCache.get(cacheKey)
    if (cached) {
      setUnavailableDates(new Set(cached))
      setIsLoading(false)
      setHasError(false)
      return
    }

    const params = new URLSearchParams({
      city,
      guests: String(guests),
      from: range.firstDay.toString(),
      to: range.lastDay.toString(),
      nights: String(nights),
    })

    async function loadAvailability() {
      setIsLoading(true)
      setHasError(false)
      setUnavailableDates(new Set())

      try {
        const response = await fetch(`/api/guesty/search-availability?${params}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('search_availability_failed')

        const data = (await response.json()) as { unavailableDates?: string[] }
        const nextUnavailableDates = data.unavailableDates ?? []
        writeAvailabilityCache(cacheKey, nextUnavailableDates)
        setUnavailableDates(new Set(nextUnavailableDates))
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('[search date availability] failed', error)
          setHasError(true)
          setUnavailableDates(new Set())
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadAvailability()

    return () => controller.abort()
  }, [city, enabled, guests, nights, range.firstDay, range.lastDay])

  return {
    unavailableDates,
    isLoading,
    hasError,
    isDateUnavailable: (date: DateValue) => unavailableDates.has(date.toString()),
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function writeAvailabilityCache(key: string, unavailableDates: string[]) {
  availabilityCache.set(key, unavailableDates)

  if (availabilityCache.size <= MAX_CACHE_ENTRIES) return

  const oldestKey = availabilityCache.keys().next().value
  if (oldestKey) availabilityCache.delete(oldestKey)
}
