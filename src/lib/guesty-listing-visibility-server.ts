import { guestyOpenApi, type GuestyOpenApiListingVisibility } from '@/lib/guesty-openapi'
import {
  assertListingShownOnWebsite,
  filterListingsShownOnWebsite,
} from '@/lib/guesty-listing-visibility'
import type { GuestyListing } from '@/types/guesty'

const VISIBILITY_CACHE_TTL_MS = 5 * 60 * 1000
const VISIBILITY_PAGE_LIMIT = 100

const cache = globalThis as unknown as {
  __guestyVisibleListingIds?: Set<string>
  __guestyVisibleListingIdsExpiresAt?: number
}

export async function filterListingsAvailableOnWebsite<T extends Pick<GuestyListing, '_id'>>(
  listings: T[],
): Promise<T[]> {
  const visibleIds = await getVisibleListingIds()
  if (!visibleIds) return listings
  return listings.filter((listing) => visibleIds.has(listing._id))
}

export async function assertListingAvailableOnWebsite(
  listingId: string,
  fallbackListing?: Pick<GuestyListing, 'customFields'>,
) {
  const visibleIds = await getVisibleListingIds()
  if (visibleIds) {
    if (visibleIds.has(listingId)) return
    throw new Error('{"error":{"code":"LISTING_IS_NOT_AVAILABLE"}}')
  }

  if (fallbackListing?.customFields !== undefined) {
    assertListingShownOnWebsite(fallbackListing)
  }
}

async function getVisibleListingIds(): Promise<Set<string> | null> {
  const now = Date.now()
  if (cache.__guestyVisibleListingIds && now < (cache.__guestyVisibleListingIdsExpiresAt ?? 0)) {
    return cache.__guestyVisibleListingIds
  }

  try {
    const listings = await getListingVisibilityRows()
    const visibleIds = new Set(
      filterListingsShownOnWebsite(listings).flatMap((listing) => {
        const id = listing._id || listing.id
        return id ? [id] : []
      }),
    )

    cache.__guestyVisibleListingIds = visibleIds
    cache.__guestyVisibleListingIdsExpiresAt = now + VISIBILITY_CACHE_TTL_MS
    return visibleIds
  } catch (error) {
    console.error('[listing visibility] Open API visibility fetch failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
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
