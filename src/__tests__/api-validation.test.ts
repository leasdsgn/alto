import { describe, it, expect } from 'vitest'
import { z } from 'zod/v4'

const reservationGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
})

const reservationSchema = z.object({
  quoteId: z.string().min(1),
  ratePlanId: z.string().min(1),
  guest: reservationGuestSchema,
  ccToken: z.string().optional(),
  policy: z.object({
    privacy: z.literal(true),
    terms: z.literal(true),
  }),
  mode: z.enum(['instant', 'inquiry']),
})

const availabilitySchema = z.object({
  listingId: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  guests: z.coerce.number().int().positive().optional(),
})

describe('validation des schémas API', () => {
  describe('réservation', () => {
    it('accepte une réservation instantanée valide', () => {
      const result = reservationSchema.safeParse({
        quoteId: 'q-123',
        ratePlanId: 'rp-456',
        guest: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.fr', phone: '+33612345678' },
        ccToken: 'pm_test_abc123',
        policy: { privacy: true, terms: true },
        mode: 'instant',
      })
      expect(result.success).toBe(true)
    })

    it('rejette si privacy est false', () => {
      const result = reservationSchema.safeParse({
        quoteId: 'q-123',
        ratePlanId: 'rp-456',
        guest: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.fr', phone: '+33612345678' },
        policy: { privacy: false, terms: true },
        mode: 'inquiry',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un email invalide', () => {
      const result = reservationSchema.safeParse({
        quoteId: 'q-123',
        ratePlanId: 'rp-456',
        guest: { firstName: 'Jean', lastName: 'Dupont', email: 'pas-un-email', phone: '+33612345678' },
        policy: { privacy: true, terms: true },
        mode: 'inquiry',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un mode inconnu', () => {
      const result = reservationSchema.safeParse({
        quoteId: 'q-123',
        ratePlanId: 'rp-456',
        guest: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.fr', phone: '+33612345678' },
        policy: { privacy: true, terms: true },
        mode: 'express',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('disponibilité', () => {
    it('accepte des paramètres valides', () => {
      const result = availabilitySchema.safeParse({
        listingId: 'lst-123',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        guests: '2',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.guests).toBe(2)
      }
    })

    it('rejette une date invalide', () => {
      const result = availabilitySchema.safeParse({
        listingId: 'lst-123',
        checkIn: 'pas-une-date',
        checkOut: '2026-06-05',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un listingId vide', () => {
      const result = availabilitySchema.safeParse({
        listingId: '',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
      })
      expect(result.success).toBe(false)
    })
  })
})
