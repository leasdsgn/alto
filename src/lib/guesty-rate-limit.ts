import { hasRedisConfig, redisCommand } from './guesty-oauth-cache'

const API_RATE_LIMIT_KEY = 'guesty:beapi:api_rate_limited_until'
const CONCURRENCY_SLOT_PREFIX = 'guesty:beapi:concurrency'
const RATE_SLOT_PREFIX = 'guesty:beapi:rate'

const MAX_CONCURRENT_REQUESTS = 12
const MAX_REQUESTS_PER_SECOND = 4
const CONCURRENCY_TTL_MS = 30 * 1000
const RATE_INTERVAL_MS = 1000 / MAX_REQUESTS_PER_SECOND
const RATE_SLOT_TTL_MS = RATE_INTERVAL_MS * 2
const RATE_LIMIT_WAIT_MS = 10 * 1000
const RATE_LIMIT_POLL_MS = 100

export async function withGuestyRateLimit<T>(operation: () => Promise<T>): Promise<T> {
  if (!hasRedisConfig()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Guesty rate limit cache unavailable')
    }

    return operation()
  }

  await assertNoApiCooldown()

  const owner = crypto.randomUUID()
  const slotKey = await acquireConcurrencySlot(owner)

  try {
    await acquireRateSlot(owner)
    return await operation()
  } finally {
    if (slotKey) await releaseConcurrencySlot(slotKey, owner)
  }
}

export async function writeApiRateLimit(rateLimitedUntil: number): Promise<void> {
  try {
    const ttl = Math.max(1, Math.ceil((rateLimitedUntil - Date.now()) / 1000))
    await redisCommand<string>(['SET', API_RATE_LIMIT_KEY, String(rateLimitedUntil), 'EX', ttl])
  } catch (error) {
    console.error('[guesty-rate-limit] write failed', error)
  }
}

async function assertNoApiCooldown(): Promise<void> {
  const value = await redisCommand<string>(['GET', API_RATE_LIMIT_KEY])
  const rateLimitedUntil = value ? Number(value) : null

  if (rateLimitedUntil && Number.isFinite(rateLimitedUntil) && Date.now() < rateLimitedUntil) {
    throw new Error(
      'Guesty rate limited, retry apres ' +
        new Date(rateLimitedUntil).toLocaleTimeString('fr-FR'),
    )
  }
}

async function acquireConcurrencySlot(owner: string): Promise<string> {
  const deadline = Date.now() + RATE_LIMIT_WAIT_MS

  while (Date.now() < deadline) {
    for (let slot = 0; slot < MAX_CONCURRENT_REQUESTS; slot += 1) {
      const slotKey = `${CONCURRENCY_SLOT_PREFIX}:${slot}`
      const acquired = await redisCommand<string>([
        'SET',
        slotKey,
        owner,
        'NX',
        'PX',
        CONCURRENCY_TTL_MS,
      ])

      if (acquired === 'OK') return slotKey
    }

    await wait(RATE_LIMIT_POLL_MS)
  }

  throw new Error('Guesty concurrency limit timeout')
}

async function releaseConcurrencySlot(slotKey: string, owner: string): Promise<void> {
  try {
    const currentOwner = await redisCommand<string>(['GET', slotKey])
    if (currentOwner === owner) await redisCommand<number>(['DEL', slotKey])
  } catch (error) {
    console.error('[guesty-rate-limit] release failed', error)
  }
}

async function acquireRateSlot(owner: string): Promise<void> {
  const deadline = Date.now() + RATE_LIMIT_WAIT_MS

  while (Date.now() < deadline) {
    const bucket = Math.floor(Date.now() / RATE_INTERVAL_MS)
    const slotKey = `${RATE_SLOT_PREFIX}:${bucket}`
    const acquired = await redisCommand<string>([
      'SET',
      slotKey,
      owner,
      'NX',
      'PX',
      RATE_SLOT_TTL_MS,
    ])

    if (acquired === 'OK') return

    await waitUntilNextRateInterval()
  }

  throw new Error('Guesty rate limit timeout')
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function waitUntilNextRateInterval() {
  const now = Date.now()
  const delay = RATE_INTERVAL_MS - (now % RATE_INTERVAL_MS) + 10
  return wait(delay)
}
