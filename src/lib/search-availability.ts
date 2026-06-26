import type { GuestyCalendarDay } from '@/types/guesty'

export function isCalendarDateAvailableForRequestedStay({
  daysByDate,
  startDate,
  requestedNights,
  fallbackMinNights,
  fallbackMaxNights,
}: {
  daysByDate: Map<string, GuestyCalendarDay>
  startDate: string
  requestedNights: number
  fallbackMinNights?: number
  fallbackMaxNights?: number
}): boolean {
  const startDay = daysByDate.get(startDate)
  if (!startDay || startDay.status !== 'available' || startDay.cta === true) return false

  const maxNights = startDay.maxNights || fallbackMaxNights
  if (maxNights && requestedNights > maxNights) return false

  const requiredNights = Math.max(1, requestedNights, startDay.minNights || fallbackMinNights || 1)

  for (let offset = 0; offset < requiredNights; offset += 1) {
    const date = addDays(startDate, offset)
    if (daysByDate.get(date)?.status !== 'available') return false
  }

  return true
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
