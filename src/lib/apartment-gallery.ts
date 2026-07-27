const PLACEHOLDER_IMAGES = Array<string | null>(5).fill(null)

export function getGalleryPhotos(images: string[]): Array<string | null> {
  return images.length > 0 ? images : PLACEHOLDER_IMAGES
}
