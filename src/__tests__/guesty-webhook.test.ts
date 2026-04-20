import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { verifyGuestySignature } from '@/lib/guesty-webhook'

const originalEnv = process.env.GUESTY_WEBHOOK_SECRET
const originalNodeEnv = process.env.NODE_ENV

function sign(secret: string, body: string): string {
  return createHmac('sha256', secret).update(body).digest('hex')
}

describe('verifyGuestySignature', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    process.env.GUESTY_WEBHOOK_SECRET = originalEnv
    process.env.NODE_ENV = originalNodeEnv
  })

  it('valide une signature HMAC SHA256 correcte', () => {
    process.env.GUESTY_WEBHOOK_SECRET = 'test-secret'
    const body = '{"event":"reservation.updated"}'
    const signature = sign('test-secret', body)

    const headers = new Headers({ 'x-guesty-signature': signature })
    expect(verifyGuestySignature(headers, body)).toBe(true)
  })

  it('accepte le prefix sha256=', () => {
    process.env.GUESTY_WEBHOOK_SECRET = 'test-secret'
    const body = '{"event":"reservation.updated"}'
    const signature = `sha256=${sign('test-secret', body)}`

    const headers = new Headers({ 'x-guesty-signature': signature })
    expect(verifyGuestySignature(headers, body)).toBe(true)
  })

  it('rejette une signature invalide', () => {
    process.env.GUESTY_WEBHOOK_SECRET = 'test-secret'
    const body = '{"event":"reservation.updated"}'

    const headers = new Headers({ 'x-guesty-signature': 'deadbeef' })
    expect(verifyGuestySignature(headers, body)).toBe(false)
  })

  it('rejette si header de signature manquant', () => {
    process.env.GUESTY_WEBHOOK_SECRET = 'test-secret'
    const headers = new Headers()
    expect(verifyGuestySignature(headers, '{}')).toBe(false)
  })

  it('bypass en dev sans secret configuré', () => {
    delete process.env.GUESTY_WEBHOOK_SECRET
    process.env.NODE_ENV = 'development'

    const headers = new Headers()
    expect(verifyGuestySignature(headers, '{}')).toBe(true)
  })

  it('rejette en prod sans secret configuré', () => {
    delete process.env.GUESTY_WEBHOOK_SECRET
    process.env.NODE_ENV = 'production'

    const headers = new Headers()
    expect(verifyGuestySignature(headers, '{}')).toBe(false)
  })
})
