import { describe, expect, it } from 'vitest'
import { calculateRefundAmountCents } from '@/lib/cancellation-policy'

describe('calculateRefundAmountCents', () => {
  it('rembourse 100% à plus de 30 jours', () => {
    const amount = calculateRefundAmountCents(
      120000,
      '2026-06-30',
      new Date('2026-05-20T12:00:00.000Z'),
    )

    expect(amount).toBe(120000)
  })

  it('rembourse 50% entre 7 et 30 jours', () => {
    const amount = calculateRefundAmountCents(
      120000,
      '2026-05-20',
      new Date('2026-05-01T12:00:00.000Z'),
    )

    expect(amount).toBe(60000)
  })

  it('ne rembourse rien à moins de 7 jours', () => {
    const amount = calculateRefundAmountCents(
      120000,
      '2026-05-05',
      new Date('2026-05-01T12:00:00.000Z'),
    )

    expect(amount).toBe(0)
  })
})
