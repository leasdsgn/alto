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
      <div
        className="bg-sand relative aspect-[4/5] touch-pan-y overflow-hidden rounded-lg select-none sm:aspect-[16/10] lg:aspect-[16/9]"
        onTouchStart={hasMultiplePhotos ? handleTouchStart : undefined}
        onTouchEnd={hasMultiplePhotos ? handleTouchEnd : undefined}
      >
        {activePhoto ? (
          <Image
            key={activePhoto}
            src={activePhoto}
            alt={`${name} - ${copy.photo} ${activeIndex + 1}`}
            fill
            sizes="(max-width: 768px) calc(100vw - 48px), (max-width: 1024px) calc(100vw - 96px), 1132px"
            quality={85}
            className="object-cover"
            priority={activeIndex === 0}
          />
        ) : (
          <div className="bg-sand size-full" />
        )}

        {hasMultiplePhotos && (
          <>
            <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between">
              <GalleryButton label={copy.previous} direction="previous" onClick={showPrevious} />
              <GalleryButton label={copy.next} direction="next" onClick={showNext} />
            </div>

            <p
              aria-live="polite"
              className="bg-coffee/80 text-cream text-overline absolute right-3 bottom-3 rounded-full px-3 py-1.5 font-bold tracking-[0.12em] backdrop-blur-sm"
            >
              <span className="sr-only">{copy.position}</span>
              {activeIndex + 1} / {photoCount}
            </p>
          </>
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
    position: 'Photo affichée : ',
  },
  en: {
    galleryLabel: 'Photo gallery for',
    photo: 'photo',
    previous: 'Previous photo',
    next: 'Next photo',
    position: 'Displayed photo: ',
  },
} as const
