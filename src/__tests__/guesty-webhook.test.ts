import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { verifyGuestySignature } from '@/lib/guesty-webhook'

function sign(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest('hex')
}

describe('verifyGuestySignature', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('valide une signature HMAC SHA256 correcte', () => {
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', 'test-secret')
    const body = '{"event":"reservation.updated"}'
    const signature = sign('test-secret', body)

    const headers = new Headers({ 'x-guesty-signature': signature })
    expect(verifyGuestySignature(headers, body)).toBe(true)
  })

  it('accepte le prefix sha256=', () => {
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', 'test-secret')
    const body = '{"event":"reservation.updated"}'
    const signature = `sha256=${sign('test-secret', body)}`

    const headers = new Headers({ 'x-guesty-signature': signature })
    expect(verifyGuestySignature(headers, body)).toBe(true)
  })

  it('rejette une signature invalide', () => {
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', 'test-secret')
    const body = '{"event":"reservation.updated"}'

    const headers = new Headers({ 'x-guesty-signature': 'deadbeef' })
    expect(verifyGuestySignature(headers, body)).toBe(false)
  })

  it('rejette si header de signature manquant', () => {
    vi.stubEnv('GUESTY_WEBHOOK_SECRET', 'test-secret')
    const headers = new Headers()
    expect(verifyGuestySignature(headers, '{}')).toBe(false)
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
