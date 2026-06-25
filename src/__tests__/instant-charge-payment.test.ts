import { describe, expect, it } from 'vitest'
import { extractStripeClientSecret, redactStripeClientSecrets } from '@/lib/instant-charge-payment'
import type { GuestyInstantChargeReservation } from '@/types/guesty'

function instantChargeResponse(
  overrides: Partial<GuestyInstantChargeReservation> = {},
): GuestyInstantChargeReservation {
  return {
    reservation: {
      _id: 'res-123',
      status: 'reserved',
    },
    payment: {
      _id: 'pay-123',
      status: 'PENDING_AUTH',
      amount: 489,
      currency: 'EUR',
      reservationId: 'res-123',
    },
    ...overrides,
  }
}

describe('instant-charge-payment', () => {
  it('extrait le client_secret depuis threeDSChallenge', () => {
    const clientSecret = 'pi_123456789_secret_abcdef'
    const response = instantChargeResponse({
      threeDSChallenge: {
        paymentIntentClientSecret: clientSecret,
      },
    })

    expect(extractStripeClientSecret(response)).toBe(clientSecret)
  })

  it('extrait le client_secret depuis une tentative de paiement imbriquée', () => {
    const clientSecret = 'seti_123456789_secret_abcdef'
    const response = instantChargeResponse({
      payment: {
        _id: 'pay-123',
        status: 'PENDING_AUTH',
        amount: 489,
        currency: 'EUR',
        reservationId: 'res-123',
        processorError: {
          message: 'Authentication required',
        },
      },
      attempts: [
        {
          processorResponse: {
            paymentIntent: {
              client_secret: clientSecret,
            },
          },
        },
      ],
    } as Partial<GuestyInstantChargeReservation>)

    expect(extractStripeClientSecret(response)).toBe(clientSecret)
  })

  it('masque les client_secret dans les logs de diagnostic', () => {
    const redacted = redactStripeClientSecrets({
      paymentIntent: {
        client_secret: 'pi_123456789_secret_abcdef',
      },
    })

    expect(redacted).toEqual({
      paymentIntent: {
        client_secret: '[stripe_client_secret]',
      },
    })
  })
})
