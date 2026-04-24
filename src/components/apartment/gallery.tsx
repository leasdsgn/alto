'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryProps {
  name: string
  images?: string[]
}

const PLACEHOLDER_IMAGES = Array(5).fill(null)

export function ApartmentGallery({ name, images }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const photos = (images ?? PLACEHOLDER_IMAGES).slice(0, 5)
  const canNavigate = photos.length > 1

  function showPrevious() {
    setActiveIndex((index) => (index === 0 ? photos.length - 1 : index - 1))
  }

  function showNext() {
    setActiveIndex((index) => (index === photos.length - 1 ? 0 : index + 1))
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_210px] md:grid-rows-4">
      <div className="relative row-span-4 h-[300px] overflow-hidden rounded-lg md:h-[429px]">
        {photos[activeIndex] ? (
          <Image
            src={photos[activeIndex]!}
            alt={`${name} - photo principale`}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            quality={85}
            className="object-cover transition-opacity duration-500"
            priority
          />
        ) : (
          <div className="bg-sand size-full" />
        )}
        {canNavigate && (
          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 items-center justify-between">
            <button
              type="button"
              onClick={showPrevious}
              className="bg-cream/90 text-coffee flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-opacity hover:opacity-80"
              aria-label="Photo précédente"
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="bg-cream/90 text-coffee flex size-9 items-center justify-center rounded-full backdrop-blur-sm transition-opacity hover:opacity-80"
              aria-label="Photo suivante"
            >
              <ArrowRight />
            </button>
          </div>
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
            <Image
              src={img}
              alt={`${name} - photo ${i + 2}`}
              fill
              sizes="210px"
              quality={75}
              className="object-cover"
            />
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

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}
