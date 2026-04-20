import { getSupabaseAdmin } from './supabase-client'

const CACHE_ID = 'default'

interface OAuthCacheRow {
  id: string
  access_token: string
  expires_at: string
  rate_limited_until: string | null
}

export interface CachedToken {
  accessToken: string
  expiresAt: number
}

export interface RateLimitState {
  rateLimitedUntil: number | null
}

export async function readOAuthCache(): Promise<
  (CachedToken & RateLimitState) | null
> {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('guesty_oauth_cache')
      .select('*')
      .eq('id', CACHE_ID)
      .maybeSingle()

    if (error || !data) return null
    const row = data as unknown as OAuthCacheRow

    return {
      accessToken: row.access_token,
      expiresAt: new Date(row.expires_at).getTime(),
      rateLimitedUntil: row.rate_limited_until
        ? new Date(row.rate_limited_until).getTime()
        : null,
    }
  } catch {
    return null
  }
}

export async function writeOAuthCache(token: CachedToken): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    await supabase
      .from('guesty_oauth_cache')
      .upsert(
        {
          id: CACHE_ID,
          access_token: token.accessToken,
          expires_at: new Date(token.expiresAt).toISOString(),
          rate_limited_until: null,
        } as never,
        { onConflict: 'id' },
      )
  } catch (error) {
    console.error('[guesty-oauth-cache] write failed', error)
  }
}

export async function writeRateLimit(rateLimitedUntil: number): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    await supabase
      .from('guesty_oauth_cache')
      .upsert(
        {
          id: CACHE_ID,
          access_token: '',
          expires_at: new Date(0).toISOString(),
          rate_limited_until: new Date(rateLimitedUntil).toISOString(),
        } as never,
        { onConflict: 'id' },
      )
  } catch (error) {
    console.error('[guesty-oauth-cache] rate limit write failed', error)
  }
}
