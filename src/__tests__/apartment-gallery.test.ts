import { describe, expect, it } from 'vitest'
import { getGalleryPhotos } from '@/lib/apartment-gallery'

describe('getGalleryPhotos', () => {
  it('conserve toutes les photos au-delà des cinq premières', () => {
    const photos = Array.from({ length: 8 }, (_, index) => `/photo-${index + 1}.jpg`)

    expect(getGalleryPhotos(photos)).toHaveLength(8)
    expect(getGalleryPhotos(photos).at(-1)).toBe('/photo-8.jpg')
  })

  it('conserve cinq emplacements de repli sans photo', () => {
    expect(getGalleryPhotos([])).toHaveLength(5)
  })
})
