import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { generateCancellationToken, verifyCancellationToken } from '@/lib/cancel-token'

describe('cancel-token', () => {
  beforeEach(() => {
    vi.stubEnv('CANCEL_TOKEN_SECRET', 'test-cancel-secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('valide un token signé', () => {
    const token = generateCancellationToken({
      reservationId: 'res_123',
      email: 'camille@example.com',
      now: new Date('2026-04-21T09:00:00.000Z'),
    })

    const payload = verifyCancellationToken(token, new Date('2026-04-21T10:00:00.000Z'))

    expect(payload).toMatchObject({
      reservationId: 'res_123',
      email: 'camille@example.com',
    })
  })

  it('rejette un token expiré', () => {
    const token = generateCancellationToken({
      reservationId: 'res_123',
      email: 'camille@example.com',
      expiresInSeconds: 60,
      now: new Date('2026-04-21T09:00:00.000Z'),
    })

    expect(() =>
      verifyCancellationToken(token, new Date('2026-04-21T09:02:00.000Z')),
    ).toThrow('expired_token')
  })

  it('rejette un token falsifié', () => {
    const token = generateCancellationToken({
      reservationId: 'res_123',
      email: 'camille@example.com',
      now: new Date('2026-04-21T09:00:00.000Z'),
    })

    const [payload, signature] = token.split('.')
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      reservationId: string
      email: string
      exp: number
    }
    decoded.reservationId = 'res_456'
    const tamperedPayload = Buffer.from(JSON.stringify(decoded), 'utf8').toString('base64url')
    const tampered = `${tamperedPayload}.${signature}`

    expect(() =>
      verifyCancellationToken(tampered, new Date('2026-04-21T10:00:00.000Z')),
    ).toThrow('invalid_token_signature')
  })
})
