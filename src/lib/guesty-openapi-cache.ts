import { hasRedisConfig, redisCommand } from './guesty-oauth-cache'

const TOKEN_KEY = 'guesty:openapi:token'
const RATE_LIMIT_KEY = 'guesty:openapi:oauth_rate_limited_until'
const TOKEN_LOCK_KEY = 'guesty:openapi:token_lock'

export interface GuestyOpenApiCachedToken {
  accessToken: string
  expiresAt: number
}

interface GuestyOpenApiOAuthCache extends GuestyOpenApiCachedToken {
  rateLimitedUntil: number | null
}

export async function readOpenApiOAuthCache(): Promise<GuestyOpenApiOAuthCache | null> {
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
    console.error('[guesty-openapi-cache] read failed', error)
    return null
  }
}

export async function writeOpenApiOAuthCache(token: GuestyOpenApiCachedToken): Promise<void> {
  try {
    const ttl = Math.floor((token.expiresAt - Date.now()) / 1000)
    if (!token.accessToken || ttl <= 0) {
      await redisCommand<number>(['DEL', TOKEN_KEY])
      return
    }

    await redisCommand<string>(['SET', TOKEN_KEY, JSON.stringify(token), 'EX', ttl])
    await redisCommand<number>(['DEL', RATE_LIMIT_KEY])
  } catch (error) {
    console.error('[guesty-openapi-cache] write failed', error)
  }
}

export async function writeOpenApiOAuthRateLimit(rateLimitedUntil: number): Promise<void> {
  try {
    const ttl = Math.max(1, Math.ceil((rateLimitedUntil - Date.now()) / 1000))
    await redisCommand<string>(['SET', RATE_LIMIT_KEY, String(rateLimitedUntil), 'EX', ttl])
  } catch (error) {
    console.error('[guesty-openapi-cache] rate limit write failed', error)
  }
}

export async function acquireOpenApiOAuthLock(
  owner: string,
  ttlMs: number,
): Promise<boolean | null> {
  try {
    if (!hasRedisConfig()) return null
    const result = await redisCommand<string>(['SET', TOKEN_LOCK_KEY, owner, 'NX', 'PX', ttlMs])
    return result === 'OK'
  } catch (error) {
    console.error('[guesty-openapi-cache] lock acquire failed', error)
    return null
  }
}

export async function releaseOpenApiOAuthLock(owner: string): Promise<void> {
  try {
    const currentOwner = await redisCommand<string>(['GET', TOKEN_LOCK_KEY])
    if (currentOwner === owner) await redisCommand<number>(['DEL', TOKEN_LOCK_KEY])
  } catch (error) {
    console.error('[guesty-openapi-cache] lock release failed', error)
  }
}

function parseCachedToken(value: string | null): GuestyOpenApiCachedToken | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<GuestyOpenApiCachedToken>
    if (
      typeof parsed.accessToken === 'string' &&
      typeof parsed.expiresAt === 'number' &&
      parsed.expiresAt > Date.now()
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
