import type { GuestyListing } from '@/types/guesty'

export const SHOW_ON_WEBSITE_CUSTOM_FIELD = 'show_on_website'

const FIELD_NAME_KEYS = [
  'key',
  'name',
  'title',
  'label',
  'fieldName',
  'internalName',
  'variable',
  'code',
  'slug',
  'id',
  '_id',
  'fieldId',
  'customFieldId',
] as const

const FIELD_VALUE_KEYS = [
  'value',
  'values',
  'checked',
  'selected',
  'booleanValue',
  'boolValue',
] as const

export function appendListingVisibilityField(fields: readonly string[]): readonly string[] {
  if (fields.includes('customFields')) return fields
  return [...fields, 'customFields']
}

export function filterListingsShownOnWebsite<T extends Pick<GuestyListing, 'customFields'>>(
  listings: T[],
): T[] {
  return listings.filter(isListingShownOnWebsite)
}

export function assertListingShownOnWebsite(listing: Pick<GuestyListing, 'customFields'>) {
  if (isListingShownOnWebsite(listing)) return
  throw new Error('{"error":{"code":"LISTING_IS_NOT_AVAILABLE"}}')
}

export function isListingShownOnWebsite(listing: Pick<GuestyListing, 'customFields'>): boolean {
  const customFields = listing.customFields

  if (Array.isArray(customFields)) {
    return customFields.some(isShowOnWebsiteField)
  }

  if (isRecord(customFields)) {
    const directValue = customFields[SHOW_ON_WEBSITE_CUSTOM_FIELD]
    if (directValue !== undefined) return isTruthyFieldValue(directValue)

    return Object.entries(customFields).some(([key, value]) => {
      if (isShowOnWebsiteKey(key)) return isTruthyFieldValue(value)
      return isShowOnWebsiteField(value)
    })
  }

  return false
}

function isShowOnWebsiteField(value: unknown): boolean {
  if (!isRecord(value)) return false

  const names = getFieldNameCandidates(value)
  if (!names.some(isShowOnWebsiteKey)) return false

  return isTruthyFieldValue(getFieldValue(value))
}

function getFieldNameCandidates(field: Record<string, unknown>): string[] {
  const candidates: string[] = []

  for (const key of FIELD_NAME_KEYS) {
    const value = field[key]
    if (typeof value === 'string') candidates.push(value)
  }

  for (const nestedKey of ['field', 'customField', 'definition', 'metadata']) {
    const nested = field[nestedKey]
    if (!isRecord(nested)) continue

    for (const key of FIELD_NAME_KEYS) {
      const value = nested[key]
      if (typeof value === 'string') candidates.push(value)
    }
  }

  return candidates
}

function getFieldValue(field: Record<string, unknown>) {
  for (const key of FIELD_VALUE_KEYS) {
    if (key in field) return field[key]
  }

  return undefined
}

function isShowOnWebsiteKey(value: string) {
  return normalizeFieldName(value) === SHOW_ON_WEBSITE_CUSTOM_FIELD
}

function normalizeFieldName(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function isTruthyFieldValue(value: unknown): boolean {
  if (value === true) return true
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'oui'].includes(value.trim().toLowerCase())
  }
  if (Array.isArray(value)) return value.some(isTruthyFieldValue)
  if (isRecord(value)) return isTruthyFieldValue(getFieldValue(value))

  return false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
