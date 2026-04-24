import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { verifyGuestySignature } from '@/lib/guesty-webhook'

function buildSecret(secret: string): string {
  return `whsec_${Buffer.from(secret).toString('base64')}`
}

function sign(secret: string, id: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${id}.${timestamp}.${body}`).digest('base64')
}

describe('verifyGuestySignature', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-21T10:00:00.000Z'))
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
  })

  it('valide une signature Svix correcte', () => {
    const rawSecret = 'test-secret'
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', buildSecret(rawSecret))

    const id = 'msg_123'
    const timestamp = String(Math.floor(new Date('2026-04-21T10:00:00.000Z').getTime() / 1000))
    const body = '{"event":"payments.received"}'
    const signature = sign(rawSecret, id, timestamp, body)

    const headers = new Headers({
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': `v1,${signature}`,
    })

    expect(verifyGuestySignature(headers, body)).toBe(true)
  })

  it('accepte plusieurs signatures si une v1 est valide', () => {
    const rawSecret = 'test-secret'
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', buildSecret(rawSecret))

    const id = 'msg_123'
    const timestamp = String(Math.floor(new Date('2026-04-21T10:00:00.000Z').getTime() / 1000))
    const body = '{"event":"payments.received"}'
    const signature = sign(rawSecret, id, timestamp, body)

    const headers = new Headers({
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': `v0,legacy v1,${signature}`,
    })

    expect(verifyGuestySignature(headers, body)).toBe(true)
  })

  it('rejette une signature invalide', () => {
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', buildSecret('test-secret'))

    const headers = new Headers({
      'svix-id': 'msg_123',
      'svix-timestamp': '1776765600',
      'svix-signature': 'v1,invalid',
    })

    expect(verifyGuestySignature(headers, '{"event":"reservation.updated"}')).toBe(false)
  })

  it('rejette un timestamp trop ancien', () => {
    const rawSecret = 'test-secret'
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', buildSecret(rawSecret))

    const id = 'msg_123'
    const timestamp = String(Math.floor(new Date('2026-04-21T09:40:00.000Z').getTime() / 1000))
    const body = '{"event":"reservation.updated"}'
    const signature = sign(rawSecret, id, timestamp, body)

    const headers = new Headers({
      'svix-id': id,
      'svix-timestamp': timestamp,
      'svix-signature': `v1,${signature}`,
    })

    expect(verifyGuestySignature(headers, body)).toBe(false)
  })

  it('bypass en dev sans secret configuré', () => {
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', '')
    vi.stubEnv('NODE_ENV', 'development')

    const headers = new Headers()
    expect(verifyGuestySignature(headers, '{}')).toBe(true)
  })

  it('rejette en prod sans secret configuré', () => {
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', '')
    vi.stubEnv('NODE_ENV', 'production')

    const headers = new Headers()
    expect(verifyGuestySignature(headers, '{}')).toBe(false)
  })
})
