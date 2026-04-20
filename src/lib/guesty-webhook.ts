import { createHmac, timingSafeEqual } from 'node:crypto'

const SIGNATURE_HEADERS = ['x-guesty-signature', 'x-webhook-signature', 'x-signature'] as const

export function verifyGuestySignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.GUESTY_WEBHOOK_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }

  const received = findSignatureHeader(headers)
  if (!received) return false

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

  const receivedBuffer = Buffer.from(received.replace(/^sha256=/, ''), 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')

  if (receivedBuffer.length !== expectedBuffer.length) return false
  return timingSafeEqual(receivedBuffer, expectedBuffer)
}

function findSignatureHeader(headers: Headers): string | null {
  for (const name of SIGNATURE_HEADERS) {
    const value = headers.get(name)
    if (value) return value
  }
  return null
}
