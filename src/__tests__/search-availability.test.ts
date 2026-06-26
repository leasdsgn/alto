import { describe, expect, it } from 'vitest'
import { isCalendarDateAvailableForRequestedStay } from '@/lib/search-availability'
import type { GuestyCalendarDay } from '@/types/guesty'

describe('search availability', () => {
  it('accepte une date de début disponible si le minNights peut être respecté', () => {
    const daysByDate = toDaysByDate([
      { date: '2026-07-03', status: 'available', minNights: 2 },
      { date: '2026-07-04', status: 'available', minNights: 2 },
    ])

    expect(
      isCalendarDateAvailableForRequestedStay({
        daysByDate,
        startDate: '2026-07-03',
        requestedNights: 1,
      }),
    ).toBe(true)
  })

  it('refuse une date de début si le minNights déborde sur une nuit indisponible', () => {
    const daysByDate = toDaysByDate([
      { date: '2026-07-10', status: 'available', minNights: 2 },
      { date: '2026-07-11', status: 'booked', minNights: 1 },
    ])

    expect(
      isCalendarDateAvailableForRequestedStay({
        daysByDate,
        startDate: '2026-07-10',
        requestedNights: 1,
      }),
    ).toBe(false)
  })

  it('refuse une durée demandée au-dessus du maxNights', () => {
    const daysByDate = toDaysByDate([
      { date: '2026-07-03', status: 'available', minNights: 1, maxNights: 2 },
      { date: '2026-07-04', status: 'available', minNights: 1, maxNights: 2 },
      { date: '2026-07-05', status: 'available', minNights: 1, maxNights: 2 },
    ])

    expect(
      isCalendarDateAvailableForRequestedStay({
        daysByDate,
        startDate: '2026-07-03',
        requestedNights: 3,
      }),
    ).toBe(false)
  })
})

function toDaysByDate(days: Array<Partial<GuestyCalendarDay> & { date: string }>) {
  return new Map(
    days.map((day) => [
      day.date,
      {
        status: 'available',
        minNights: 1,
        ...day,
      } as GuestyCalendarDay,
    ]),
  )
}
