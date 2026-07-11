import { CalendarDate } from '@internationalized/date'
import { describe, expect, it } from 'vitest'
import { formatDateShort } from '@/lib/format-date'

describe('formatDateShort', () => {
  const date = new CalendarDate(2026, 8, 12)

  it('formate une date en français avec les accents', () => {
    expect(formatDateShort(date, 'fr')).toBe('12 août 2026')
  })

  it('formate une date en anglais', () => {
    expect(formatDateShort(date, 'en')).toBe('August 12, 2026')
  })
})
