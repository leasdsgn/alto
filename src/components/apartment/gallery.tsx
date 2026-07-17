'use client'

import { useRef, useState, type TouchEvent } from 'react'
import Image from 'next/image'
import { useLocale } from '@/components/providers/locale-provider'
import { getGalleryPhotos } from '@/lib/apartment-gallery'

interface GalleryProps {
  name: string
  images?: string[]
}

const SWIPE_THRESHOLD = 40

export function ApartmentGallery({ name, images }: GalleryProps) {
  const locale = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const providedPhotos = (images ?? []).filter(Boolean)
  const photos = getGalleryPhotos(providedPhotos)
  const photoCount = providedPhotos.length
  const hasMultiplePhotos = photoCount > 1
  const activePhoto = photos[activeIndex]
  const previewIndexes = Array.from(
    { length: Math.min(4, Math.max(photoCount - 1, 0)) },
    (_, offset) => (activeIndex + offset + 1) % photoCount,
  )
  const copy = GALLERY_COPY[locale]

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? photoCount - 1 : current - 1))
  }

  function showNext() {
    setActiveIndex((current) => (current === photoCount - 1 ? 0 : current + 1))
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartX.current
    const endX = event.changedTouches[0]?.clientX
    touchStartX.current = null

    if (startX === null || endX === undefined) return

    const distance = endX - startX
    if (Math.abs(distance) < SWIPE_THRESHOLD) return

    if (distance > 0) showPrevious()
    else showNext()
  }

  return (
    <section
      aria-label={`${copy.galleryLabel} ${name}`}
      aria-roledescription="carousel"
      className="relative"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)]">
        <div
          className="bg-sand relative aspect-square touch-pan-y overflow-hidden rounded-lg select-none sm:aspect-[16/10] lg:aspect-auto lg:h-[396px]"
          onTouchStart={hasMultiplePhotos ? handleTouchStart : undefined}
          onTouchEnd={hasMultiplePhotos ? handleTouchEnd : undefined}
        >
          {activePhoto ? (
            <Image
              key={activePhoto}
              src={activePhoto}
              alt={`${name} - ${copy.photo} ${activeIndex + 1}`}
              fill
              sizes="(max-width: 1024px) calc(100vw - 48px), 750px"
              quality={85}
              className="object-cover"
              priority={activeIndex === 0}
            />
          ) : (
            <div className="bg-sand size-full" />
          )}

          {hasMultiplePhotos && (
            <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between">
              <GalleryButton label={copy.previous} direction="previous" onClick={showPrevious} />
              <GalleryButton label={copy.next} direction="next" onClick={showNext} />
            </div>
          )}
        </div>

        {previewIndexes.length > 0 && (
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-2 lg:gap-3">
            {previewIndexes.map((index) => (
              <button
                key={photos[index]}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${copy.showPhoto} ${index + 1}`}
                className="bg-sand relative aspect-square overflow-hidden rounded-lg transition-opacity hover:opacity-85 lg:aspect-auto lg:h-[192px]"
              >
                {photos[index] ? (
                  <Image
                    src={photos[index]!}
                    alt={`${name} - ${copy.photo} ${index + 1}`}
                    fill
                    sizes="(max-width: 1024px) 25vw, 185px"
                    quality={75}
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-sand size-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {hasMultiplePhotos && (
          <div
            aria-live="polite"
            className="flex items-center justify-center gap-1.5 lg:col-span-2"
          >
            {providedPhotos.map((photo, index) => (
              <button
                key={photo}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${copy.showPhoto} ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={`rounded-full transition-all ${
                  index === activeIndex ? 'bg-coffee size-2' : 'bg-silver hover:bg-taupe size-1.5'
                }`}
              >
                <span className="sr-only">
                  {index + 1} / {photoCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function GalleryButton({
  label,
  direction,
  onClick,
}: {
  label: string
  direction: 'previous' | 'next'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="bg-cream/90 text-coffee hover:bg-cream flex size-10 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-colors"
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {direction === 'previous' ? '←' : '→'}
      </span>
    </button>
  )
}

const GALLERY_COPY = {
  fr: {
    galleryLabel: 'Galerie photos de',
    photo: 'photo',
    previous: 'Photo précédente',
    next: 'Photo suivante',
    showPhoto: 'Afficher la photo',
  },
  en: {
    galleryLabel: 'Photo gallery for',
    photo: 'photo',
    previous: 'Previous photo',
    next: 'Next photo',
    showPhoto: 'Show photo',
  },
} as const
