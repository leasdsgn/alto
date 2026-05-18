const TOKEN_KEY = 'guesty:beapi:token'
const RATE_LIMIT_KEY = 'guesty:beapi:rate_limited_until'
const TOKEN_LOCK_KEY = 'guesty:beapi:token_lock'

export interface CachedToken {
  accessToken: string
  expiresAt: number
}

export interface RateLimitState {
  rateLimitedUntil: number | null
}

type RedisCommandArg = string | number

interface UpstashResponse<T> {
  result?: T
  error?: string
}

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

  if (!url || !token) return null
  return { url, token }
}

async function redisCommand<T>(command: RedisCommandArg[]): Promise<T | null> {
  const config = getRedisConfig()
  if (!config) return null

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upstash Redis error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as UpstashResponse<T>
  if (data.error) throw new Error(`Upstash Redis error: ${data.error}`)

  return data.result ?? null
}

export async function readOAuthCache(): Promise<(CachedToken & RateLimitState) | null> {
  try {
    const result = await redisCommand<Array<string | null>>(['MGET', TOKEN_KEY, RATE_LIMIT_KEY])
    if (!result) return null

    const [tokenValue, rateLimitValue] = result
    const token = parseCachedToken(tokenValue)
    const rateLimitedUntil = rateLimitValue ? Number(rateLimitValue) : null

    return {
      accessToken: token?.accessToken ?? '',
      expiresAt: token?.expiresAt ?? 0,
      rateLimitedUntil: Number.isFinite(rateLimitedUntil) ? rateLimitedUntil : null,
    }
  } catch (error) {
    console.error('[guesty-oauth-cache] read failed', error)
    return null
  }
}

export async function writeOAuthCache(token: CachedToken): Promise<void> {
  try {
    const ttl = Math.floor((token.expiresAt - Date.now()) / 1000)
    if (!token.accessToken || ttl <= 0) {
      await redisCommand<number>(['DEL', TOKEN_KEY])
      return
    }

    await redisCommand<string>(['SET', TOKEN_KEY, JSON.stringify(token), 'EX', ttl])
    await redisCommand<number>(['DEL', RATE_LIMIT_KEY])
  } catch (error) {
    console.error('[guesty-oauth-cache] write failed', error)
  }
}

export async function writeRateLimit(rateLimitedUntil: number): Promise<void> {
  try {
    const ttl = Math.max(1, Math.ceil((rateLimitedUntil - Date.now()) / 1000))
    await redisCommand<string>(['SET', RATE_LIMIT_KEY, String(rateLimitedUntil), 'EX', ttl])
  } catch (error) {
    console.error('[guesty-oauth-cache] rate limit write failed', error)
  }
}

export async function acquireOAuthLock(owner: string, ttlMs: number): Promise<boolean | null> {
  try {
    const result = await redisCommand<string>(['SET', TOKEN_LOCK_KEY, owner, 'NX', 'PX', ttlMs])
    return result === 'OK'
  } catch (error) {
    console.error('[guesty-oauth-cache] lock acquire failed', error)
    return null
  }
}

export async function releaseOAuthLock(owner: string): Promise<void> {
  try {
    const currentOwner = await redisCommand<string>(['GET', TOKEN_LOCK_KEY])
    if (currentOwner === owner) await redisCommand<number>(['DEL', TOKEN_LOCK_KEY])
  } catch (error) {
    console.error('[guesty-oauth-cache] lock release failed', error)
  }
}

function parseCachedToken(value: string | null): CachedToken | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<CachedToken>
    if (
      typeof parsed.accessToken === 'string'
      && typeof parsed.expiresAt === 'number'
      && parsed.expiresAt > Date.now()
    ) {
      return {
        accessToken: parsed.accessToken,
        expiresAt: parsed.expiresAt,
      }
    }
  } catch {
    return null
  }

  return null
}
