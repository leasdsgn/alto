import { describe, expect, it } from 'vitest'
import { getEffectiveMinimumNights } from '@/lib/booking-minimum-stay'

describe('getEffectiveMinimumNights', () => {
  it('uses the dynamic Guesty rule for the selected arrival date', () => {
    const rules = new Map([
      ['2026-10-13', 3],
      ['2026-11-19', 2],
    ])

    expect(getEffectiveMinimumNights(undefined, '2026-10-13', rules)).toBe(3)
    expect(getEffectiveMinimumNights(undefined, '2026-11-19', rules)).toBe(2)
  })

  it('never weakens the base listing rule', () => {
    const rules = new Map([['2026-11-19', 2]])

    expect(getEffectiveMinimumNights(4, '2026-11-19', rules)).toBe(4)
  })

  it('defaults to one night when Guesty provides no rule', () => {
    expect(getEffectiveMinimumNights(undefined, '2026-12-01', new Map())).toBe(1)
  })
})
