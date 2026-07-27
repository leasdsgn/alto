import { beforeEach, describe, expect, it, vi } from 'vitest'

const openApi = vi.hoisted(() => ({
  getListingVisibilityPage: vi.fn(),
}))

vi.mock('@/lib/guesty-openapi', () => ({
  guestyOpenApi: openApi,
}))

describe('guesty listing metadata', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
    delete process.env.KV_REST_API_URL
    delete process.env.KV_REST_API_TOKEN

    const metadataCache = globalThis as typeof globalThis & {
      __guestyListingMetadata?: unknown
    }
    metadataCache.__guestyListingMetadata = undefined
  })

  it('filtre les logements masqués et ajoute leur surface Guesty', async () => {
    openApi.getListingVisibilityPage.mockResolvedValue({
      results: [
        {
          _id: 'visible',
          customFields: { show_on_website: true },
          areaSquareFeet: 538,
        },
        {
          _id: 'hidden',
          customFields: { show_on_website: false },
          areaSquareFeet: 700,
        },
      ],
      count: 2,
    })

    const { filterListingsAvailableOnWebsite } =
      await import('@/lib/guesty-listing-visibility-server')
    const listings = await filterListingsAvailableOnWebsite([
      { _id: 'visible', title: 'Visible' },
      { _id: 'hidden', title: 'Hidden' },
    ])

    expect(listings).toEqual([{ _id: 'visible', title: 'Visible', areaSquareFeet: 538 }])
    expect(openApi.getListingVisibilityPage).toHaveBeenCalledTimes(1)
  })
})
