import { createHmac, timingSafeEqual } from 'node:crypto'

const SVIX_ID_HEADER = 'svix-id'
const SVIX_TIMESTAMP_HEADER = 'svix-timestamp'
const SVIX_SIGNATURE_HEADER = 'svix-signature'
const SVIX_TOLERANCE_MS = 5 * 60 * 1000

export function verifyGuestySignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.GUESTY_WEBHOOK_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }

  const id = headers.get(SVIX_ID_HEADER)
  const timestamp = headers.get(SVIX_TIMESTAMP_HEADER)
  const signatureHeader = headers.get(SVIX_SIGNATURE_HEADER)

  if (!id || !timestamp || !signatureHeader) return false

  const timestampValue = Number(timestamp)
  if (!Number.isFinite(timestampValue)) return false

  if (Math.abs(Date.now() - timestampValue * 1000) > SVIX_TOLERANCE_MS) {
    return false
  }

  const signedContent = `${id}.${timestamp}.${rawBody}`
  const expectedSignature = createHmac('sha256', decodeSecret(secret))
    .update(signedContent)
    .digest('base64')

  const signatures = parseSvixSignatures(signatureHeader)
  if (signatures.length === 0) return false

  return signatures.some((signature) => safeCompare(signature, expectedSignature))
}

function decodeSecret(secret: string): Buffer | string {
  if (!secret.startsWith('whsec_')) return secret
  return Buffer.from(secret.slice('whsec_'.length), 'base64')
}

function parseSvixSignatures(headerValue: string): string[] {
  return headerValue
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .flatMap((part) => {
      const [version, signature] = part.split(',', 2)
      return version === 'v1' && signature ? [signature] : []
    })
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}
