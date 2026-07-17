import { guestyOpenApi, type GuestyOpenApiListingVisibility } from '@/lib/guesty-openapi'
import {
  assertListingShownOnWebsite,
  filterListingsShownOnWebsite,
} from '@/lib/guesty-listing-visibility'
import { hasRedisConfig, redisCommand } from '@/lib/guesty-oauth-cache'
import type { GuestyListing } from '@/types/guesty'

const VISIBILITY_CACHE_TTL_MS = 5 * 60 * 1000
const VISIBILITY_STALE_TTL_SECONDS = 7 * 24 * 60 * 60
const VISIBILITY_PAGE_LIMIT = 100
const VISIBILITY_CACHE_KEY = 'guesty:openapi:listing_metadata'
const VISIBILITY_CACHE_LOCK_KEY = 'guesty:openapi:listing_metadata_lock'
const VISIBILITY_CACHE_LOCK_TTL_MS = 30 * 1000
const VISIBILITY_CACHE_LOCK_WAIT_MS = 5 * 1000
const VISIBILITY_CACHE_LOCK_POLL_MS = 200

interface ListingMetadataSnapshot {
  visibleIds: string[]
  areaSquareFeetById: Record<string, number>
  expiresAt: number
  updatedAt: number
}

const cache = globalThis as unknown as {
  __guestyListingMetadata?: ListingMetadataSnapshot
}

let listingMetadataRequest: Promise<ListingMetadataSnapshot | null> | null = null

export async function filterListingsAvailableOnWebsite<T extends Pick<GuestyListing, '_id'>>(
  listings: T[],
): Promise<T[]> {
  const metadata = await getListingMetadata()
  if (!metadata) return listings

  const visibleIds = new Set(metadata.visibleIds)
  return listings.flatMap((listing) => {
    if (!visibleIds.has(listing._id)) return []

    const areaSquareFeet = metadata.areaSquareFeetById[listing._id]
    if (!areaSquareFeet) return [listing]

    return [{ ...listing, areaSquareFeet }]
  })
}

export async function assertListingAvailableOnWebsite(
  listingId: string,
  fallbackListing?: Pick<GuestyListing, 'customFields'>,
) {
  const metadata = await getListingMetadata()
  if (metadata) {
    if (metadata.visibleIds.includes(listingId)) return
    throw new Error('{"error":{"code":"LISTING_IS_NOT_AVAILABLE"}}')
  }

  if (fallbackListing?.customFields !== undefined) {
    assertListingShownOnWebsite(fallbackListing)
  }
}

async function getListingMetadata(): Promise<ListingMetadataSnapshot | null> {
  const now = Date.now()
  if (cache.__guestyListingMetadata && now < cache.__guestyListingMetadata.expiresAt) {
    return cache.__guestyListingMetadata
  }

  const sharedSnapshot = await readSharedListingMetadata()
  if (sharedSnapshot && now < sharedSnapshot.expiresAt) {
    cache.__guestyListingMetadata = sharedSnapshot
    return sharedSnapshot
  }

  if (listingMetadataRequest) return listingMetadataRequest

  listingMetadataRequest = refreshListingMetadata(sharedSnapshot ?? cache.__guestyListingMetadata)
    .catch((error) => {
      console.error('[listing visibility] Open API metadata fetch failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      return sharedSnapshot ?? cache.__guestyListingMetadata ?? null
    })
    .finally(() => {
      listingMetadataRequest = null
    })

  return listingMetadataRequest
}

async function refreshListingMetadata(
  staleSnapshot?: ListingMetadataSnapshot,
): Promise<ListingMetadataSnapshot | null> {
  const lockOwner = crypto.randomUUID()
  const lockAcquired = await acquireListingMetadataLock(lockOwner)

  if (lockAcquired === null && process.env.NODE_ENV === 'production') {
    throw new Error('Guesty Open API listing metadata cache unavailable')
  }

  if (lockAcquired === false) {
    return (await waitForSharedListingMetadata()) ?? staleSnapshot ?? null
  }

  try {
    const refreshedSnapshot = await readSharedListingMetadata()
    if (refreshedSnapshot && Date.now() < refreshedSnapshot.expiresAt) {
      cache.__guestyListingMetadata = refreshedSnapshot
      return refreshedSnapshot
    }

    const listings = await getListingVisibilityRows()
    const visibleListings = filterListingsShownOnWebsite(listings)
    const now = Date.now()
    const snapshot: ListingMetadataSnapshot = {
      visibleIds: visibleListings.flatMap((listing) => {
        const id = listing._id || listing.id
        return id ? [id] : []
      }),
      areaSquareFeetById: Object.fromEntries(
        visibleListings.flatMap((listing) => {
          const id = listing._id || listing.id
          if (!id || !isPositiveNumber(listing.areaSquareFeet)) return []
          return [[id, listing.areaSquareFeet]]
        }),
      ),
      expiresAt: now + VISIBILITY_CACHE_TTL_MS,
      updatedAt: now,
    }

    cache.__guestyListingMetadata = snapshot
    await writeSharedListingMetadata(snapshot)
    return snapshot
  } finally {
    if (lockAcquired) await releaseListingMetadataLock(lockOwner)
  }
}

async function readSharedListingMetadata(): Promise<ListingMetadataSnapshot | null> {
  try {
    const value = await redisCommand<string>(['GET', VISIBILITY_CACHE_KEY])
    return parseListingMetadata(value)
  } catch (error) {
    console.error('[listing visibility] shared cache read failed', error)
    return null
  }
}

async function writeSharedListingMetadata(snapshot: ListingMetadataSnapshot): Promise<void> {
  try {
    await redisCommand<string>([
      'SET',
      VISIBILITY_CACHE_KEY,
      JSON.stringify(snapshot),
      'EX',
      VISIBILITY_STALE_TTL_SECONDS,
    ])
  } catch (error) {
    console.error('[listing visibility] shared cache write failed', error)
  }
}

async function acquireListingMetadataLock(owner: string): Promise<boolean | null> {
  try {
    if (!hasRedisConfig()) return null
    const result = await redisCommand<string>([
      'SET',
      VISIBILITY_CACHE_LOCK_KEY,
      owner,
      'NX',
      'PX',
      VISIBILITY_CACHE_LOCK_TTL_MS,
    ])
    return result === 'OK'
  } catch (error) {
    console.error('[listing visibility] shared cache lock acquire failed', error)
    return null
  }
}

async function releaseListingMetadataLock(owner: string): Promise<void> {
  try {
    const currentOwner = await redisCommand<string>(['GET', VISIBILITY_CACHE_LOCK_KEY])
    if (currentOwner === owner) await redisCommand<number>(['DEL', VISIBILITY_CACHE_LOCK_KEY])
  } catch (error) {
    console.error('[listing visibility] shared cache lock release failed', error)
  }
}

async function waitForSharedListingMetadata(): Promise<ListingMetadataSnapshot | null> {
  const deadline = Date.now() + VISIBILITY_CACHE_LOCK_WAIT_MS

  while (Date.now() < deadline) {
    await wait(VISIBILITY_CACHE_LOCK_POLL_MS)
    const snapshot = await readSharedListingMetadata()
    if (snapshot && Date.now() < snapshot.expiresAt) return snapshot
  }

  return null
}

function parseListingMetadata(value: string | null): ListingMetadataSnapshot | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<ListingMetadataSnapshot>
    if (
      Array.isArray(parsed.visibleIds) &&
      isRecord(parsed.areaSquareFeetById) &&
      typeof parsed.expiresAt === 'number' &&
      typeof parsed.updatedAt === 'number'
    ) {
      return {
        visibleIds: parsed.visibleIds.filter((id): id is string => typeof id === 'string'),
        areaSquareFeetById: Object.fromEntries(
          Object.entries(parsed.areaSquareFeetById).filter((entry): entry is [string, number] =>
            isPositiveNumber(entry[1]),
          ),
        ),
        expiresAt: parsed.expiresAt,
        updatedAt: parsed.updatedAt,
      }
    }
  } catch {
    return null
  }

  return null
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

async function getListingVisibilityRows(): Promise<GuestyOpenApiListingVisibility[]> {
  const rows: GuestyOpenApiListingVisibility[] = []
  let skip = 0
  let count = Number.POSITIVE_INFINITY

  while (rows.length < count) {
    const page = await guestyOpenApi.getListingVisibilityPage({
      limit: VISIBILITY_PAGE_LIMIT,
      skip,
    })

    rows.push(...(page.results ?? []))
    count = typeof page.count === 'number' ? page.count : rows.length

    if (!page.results?.length) break
    skip += page.results.length
  }

  return rows
}
