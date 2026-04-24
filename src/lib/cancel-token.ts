import { createHmac, timingSafeEqual } from 'node:crypto'

const DEFAULT_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60

export interface CancellationTokenPayload {
  reservationId: string
  email: string
  exp: number
}

export function generateCancellationToken(args: {
  reservationId: string
  email: string
  expiresInSeconds?: number
  now?: Date
}): string {
  const now = args.now ?? new Date()
  const payload: CancellationTokenPayload = {
    reservationId: args.reservationId,
    email: args.email,
    exp: Math.floor(now.getTime() / 1000) + (args.expiresInSeconds ?? DEFAULT_TOKEN_TTL_SECONDS),
  }

  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function verifyCancellationToken(
  token: string,
  now: Date = new Date(),
): CancellationTokenPayload {
  const [encodedPayload, receivedSignature] = token.split('.', 2)

  if (!encodedPayload || !receivedSignature) {
    throw new Error('invalid_token_format')
  }

  const expectedSignature = sign(encodedPayload)
  if (!safeCompare(receivedSignature, expectedSignature)) {
    throw new Error('invalid_token_signature')
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload)) as Partial<CancellationTokenPayload>

  if (
    typeof payload.reservationId !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    throw new Error('invalid_token_payload')
  }

  if (payload.exp <= Math.floor(now.getTime() / 1000)) {
    throw new Error('expired_token')
  }

  return payload as CancellationTokenPayload
}

function sign(value: string): string {
  return createHmac('sha256', getCancellationTokenSecret()).update(value).digest('base64url')
}

function getCancellationTokenSecret(): string {
  const secret = process.env.CANCEL_TOKEN_SECRET
  if (!secret) {
    throw new Error('CANCEL_TOKEN_SECRET requis')
  }

  return secret
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}
