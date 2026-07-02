import { describe, expect, it } from 'vitest'
import {
  appendListingVisibilityField,
  filterListingsShownOnWebsite,
  isListingShownOnWebsite,
} from '@/lib/guesty-listing-visibility'

describe('guesty-listing-visibility', () => {
  it('accepte un custom field booléen show_on_website à true', () => {
    expect(
      isListingShownOnWebsite({
        customFields: [{ fieldName: 'show_on_website', value: true }],
      }),
    ).toBe(true)
  })

  it('accepte la forme objet directe renvoyée par certains exports Guesty', () => {
    expect(
      isListingShownOnWebsite({
        customFields: { show_on_website: true },
      }),
    ).toBe(true)
  })

  it('accepte une définition imbriquée de custom field', () => {
    expect(
      isListingShownOnWebsite({
        customFields: [
          {
            field: { key: 'show_on_website' },
            value: 'true',
          },
        ],
      }),
    ).toBe(true)
  })

  it('accepte le fieldId Open API du custom field show_on_website', () => {
    expect(
      isListingShownOnWebsite({
        customFields: [
          {
            fieldId: '6a468efbb27c470012897c6b',
            value: true,
          },
        ],
      }),
    ).toBe(true)
  })

  it('rejette les listings sans show_on_website à true', () => {
    expect(isListingShownOnWebsite({ customFields: undefined })).toBe(false)
    expect(
      isListingShownOnWebsite({
        customFields: [{ fieldName: 'show_on_website', value: false }],
      }),
    ).toBe(false)
  })

  it('filtre une collection de listings', () => {
    const visible = { customFields: [{ name: 'show_on_website', value: true }] }
    const hidden = { customFields: [{ name: 'show_on_website', value: false }] }

    expect(filterListingsShownOnWebsite([visible, hidden])).toEqual([visible])
  })

  it('ajoute customFields aux projections Guesty sans doublon', () => {
    expect(appendListingVisibilityField(['_id', 'title'])).toEqual([
      '_id',
      'title',
      'customFields',
    ])
    expect(appendListingVisibilityField(['_id', 'customFields'])).toEqual([
      '_id',
      'customFields',
    ])
  })
})
