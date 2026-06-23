import { describe, it, expect } from 'vitest'
import { z } from 'zod/v4'

const reservationGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
})

const reservationBaseSchema = z.object({
  quoteId: z.string().min(1),
  ratePlanId: z.string().min(1),
  guest: reservationGuestSchema,
  policy: z.object({
    privacy: z.literal(true),
    terms: z.literal(true),
  }),
})

const reservationSchema = reservationBaseSchema.extend({
  confirmationToken: z.string().min(1),
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
        guest: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@test.fr',
          phone: '+33612345678',
        },
        confirmationToken: 'ctoken_test_abc123',
        policy: { privacy: true, terms: true },
      })
      expect(result.success).toBe(true)
    })

    it('rejette si privacy est false', () => {
      const result = reservationSchema.safeParse({
        quoteId: 'q-123',
        ratePlanId: 'rp-456',
        guest: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@test.fr',
          phone: '+33612345678',
        },
        confirmationToken: 'ctoken_test_abc123',
        policy: { privacy: false, terms: true },
      })
      expect(result.success).toBe(false)
    })

    it('rejette un email invalide', () => {
      const result = reservationSchema.safeParse({
        quoteId: 'q-123',
        ratePlanId: 'rp-456',
        guest: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'pas-un-email',
          phone: '+33612345678',
        },
        confirmationToken: 'ctoken_test_abc123',
        policy: { privacy: true, terms: true },
      })
      expect(result.success).toBe(false)
    })

    it('rejette une réservation sans confirmationToken', () => {
      const result = reservationSchema.safeParse({
        quoteId: 'q-123',
        ratePlanId: 'rp-456',
        guest: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean@test.fr',
          phone: '+33612345678',
        },
        policy: { privacy: true, terms: true },
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
