'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getGalleryPhotos } from '@/lib/apartment-gallery'

interface GalleryProps {
  name: string
  images?: string[]
}

export function ApartmentGallery({ name, images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const providedPhotos = (images ?? []).filter(Boolean)
  const photos = getGalleryPhotos(providedPhotos)
  const orderedIndexes = [
    activeIndex,
    ...photos.map((_, index) => index).filter((index) => index !== activeIndex),
  ]
  const mainIndex = orderedIndexes[0] ?? 0
  const thumbIndexes = orderedIndexes.slice(1, 5)

  if (providedPhotos.length === 1) {
    return (
      <div className="relative aspect-[16/9] min-h-[320px] w-full overflow-hidden rounded-lg sm:min-h-[440px] lg:min-h-[560px]">
        <Image
          src={providedPhotos[0]!}
          alt={name}
          fill
          sizes="(max-width: 1024px) 100vw, 1132px"
          quality={85}
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)]">
      <div className="relative h-[320px] overflow-hidden rounded-lg sm:h-[420px] lg:h-[396px]">
        {photos[mainIndex] ? (
          <Image
            src={photos[mainIndex]!}
            alt={`${name} - photo principale`}
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            quality={85}
            className="object-cover transition-opacity duration-500"
            priority
          />
        ) : (
          <div className="bg-sand size-full" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {thumbIndexes.map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-[154px] overflow-hidden rounded-lg transition-all sm:h-[180px] lg:h-[191px] ${
              activeIndex === index
                ? 'ring-coffee ring-offset-cream ring-2 ring-offset-2'
                : 'hover:opacity-90'
            }`}
          >
            {photos[index] ? (
              <Image
                src={photos[index]!}
                alt={`${name} - photo ${index + 1}`}
                fill
                sizes="(max-width: 1024px) 50vw, 294px"
                quality={75}
                className="object-cover"
              />
            ) : (
              <div className="bg-sand size-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-1.5 lg:col-span-2">
        {photos.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={`rounded-full transition-all ${
              i === activeIndex ? 'bg-coffee size-2' : 'bg-silver size-1.5'
            }`}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
