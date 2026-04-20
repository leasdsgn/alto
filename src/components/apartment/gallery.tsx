'use client'

import { useState } from 'react'

interface GalleryProps {
  name: string
  images?: string[]
}

const PLACEHOLDER_IMAGES = Array(5).fill(null)

export function ApartmentGallery({ name, images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const photos = images ?? PLACEHOLDER_IMAGES

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_210px] md:grid-rows-4">
      <div className="relative row-span-4 h-[300px] overflow-hidden rounded-lg md:h-[429px]">
        {photos[activeIndex] ? (
          <img
            src={photos[activeIndex]!}
            alt={`${name} - photo principale`}
            className="size-full object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="bg-sand size-full" />
        )}
      </div>

      {photos.slice(1, 5).map((img, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setActiveIndex(i + 1)}
          className={`relative h-[96px] overflow-hidden rounded-lg transition-opacity ${
            activeIndex === i + 1 ? 'ring-coffee ring-2' : 'opacity-80 hover:opacity-100'
          }`}
        >
          {img ? (
            <img src={img} alt={`${name} - photo ${i + 2}`} className="size-full object-cover" />
          ) : (
            <div className="bg-sand size-full" />
          )}
        </button>
      ))}

      <div className="mt-2 flex items-center justify-center gap-1.5 md:col-span-2">
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
