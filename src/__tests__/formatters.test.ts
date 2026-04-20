import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, nightsBetween } from '@/lib/formatters'

describe('formatDate', () => {
  it('formate en français', () => {
    const result = formatDate('2026-04-28', 'fr')
    expect(result).toMatch(/28 avril 2026/)
  })

  it('formate en anglais', () => {
    const result = formatDate('2026-04-28', 'en')
    expect(result).toMatch(/28 April 2026/)
  })
})

describe('formatCurrency', () => {
  it('formate les centimes en EUR FR', () => {
    const result = formatCurrency(112000, 'eur', 'fr')
    expect(result).toMatch(/1\s?120\s?€/)
  })

  it('formate les centimes en EUR EN', () => {
    const result = formatCurrency(112000, 'eur', 'en')
    expect(result).toMatch(/€1,120/)
  })
})

describe('nightsBetween', () => {
  it('compte le nombre de nuits entre deux dates ISO', () => {
    expect(nightsBetween('2026-04-28', '2026-05-02')).toBe(4)
  })

  it('retourne au moins 1 si dates égales', () => {
    expect(nightsBetween('2026-04-28', '2026-04-28')).toBe(1)
  })

  it('gère les dates ISO avec heures', () => {
    expect(nightsBetween('2026-04-28T15:00:00Z', '2026-05-02T11:00:00Z')).toBe(4)
  })
})
