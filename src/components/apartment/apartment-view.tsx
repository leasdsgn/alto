'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ApartmentBooking } from '@/components/apartment/booking'
import { FaqSection } from '@/components/sections/faq-section'
import { ApartmentRecommendations } from '@/components/apartment/recommendations'
import { Button } from '@/components/ui/button'
import { type Apartment } from '@/types/apartment'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  apartment: Apartment
  recommendations: Apartment[]
}

export function ApartmentView({ apartment, recommendations }: Props) {
  const a = apartment
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const reveals = document.querySelectorAll('[data-reveal]')
    reveals.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      })
    })
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <>
      <Header variant="dark" />

      <main className="mx-auto max-w-[1080px] px-gutter md:px-gutter-md">


        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_200px]">

          {/* Galerie */}
          <div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.3fr_1fr] md:grid-rows-2">
              <div className="relative row-span-2 h-[280px] overflow-hidden rounded-lg md:h-[430px]">
                {a.images[activeImage] ? (
                  <Image
                    src={a.images[activeImage]}
                    alt={a.name}
                    fill
                    sizes="560px"
                    quality={85}
                    className="object-cover transition-opacity duration-500"
                    priority
                  />
                ) : (
                  <div className="bg-sand size-full" />
                )}
              </div>
              {a.images.slice(1, 3).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i + 1)}
                  className={`relative hidden h-[211px] overflow-hidden rounded-lg transition-all duration-300 md:block ${
                    activeImage === i + 1 ? 'ring-coffee/30 ring-2' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${a.name} - ${i + 2}`} fill sizes="400px" quality={85} className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Booking sidebar desktop */}
          <div className="hidden lg:block">
            <ApartmentBooking price={a.price} />
          </div>
        </div>


        <div className="mt-8 grid grid-cols-1 gap-6 border-b border-divider pb-8 lg:grid-cols-[1fr_200px]">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-coffee text-xl font-bold md:text-2xl">{a.name}</h1>
                <p className="text-coffee mt-1 text-xs font-medium">{a.address ?? a.city ?? 'Paris'}</p>
              </div>
              <div className="text-right lg:hidden">
                <p className="text-coffee text-xl font-bold">{a.price}€</p>
                <p className="text-silver text-xs">/ nuit</p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-8">
              <Stat label="Voyageurs" value={`${a.guests}p.`} />
              {a.surface > 0 && <Stat label="Surface" value={`${a.surface}m²`} />}
              <Stat label="Chambres" value={`${a.bedrooms}`} />
              {a.bathrooms > 0 && <Stat label="Sdb" value={`${a.bathrooms}`} />}
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 gap-6 border-b border-divider py-10 lg:grid-cols-[1fr_200px]" data-reveal>
          <div>
            <p className="text-coffee text-base font-bold leading-[1.6] md:text-body">
              {a.description}
            </p>

            {a.space && (
              <p className="text-coffee mt-6 max-w-[500px] text-xs font-medium leading-[1.9]">
                {a.space}
              </p>
            )}
          </div>
        </div>


        {a.amenities.length > 0 && (
          <div className="grid grid-cols-1 gap-6 border-b border-divider py-10 lg:grid-cols-[1fr_200px]" data-reveal>
            <div>
              <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">
                Ce que propose le logement
              </p>
              <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-1 md:grid-cols-3">
                {a.amenities.slice(0, 9).map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5 py-1.5">
                    <div className="bg-sand flex size-6 items-center justify-center rounded-full">
                      <div className="bg-taupe size-1 rounded-full" />
                    </div>
                    <span className="text-ash text-xs">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {a.neighborhood && (
          <div className="grid grid-cols-1 gap-6 border-b border-divider py-10 lg:grid-cols-[1fr_200px]" data-reveal>
            <div>
              <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Le quartier</p>
              <p className="text-coffee mt-6 max-w-[500px] text-xs font-medium leading-[1.9]">
                {a.neighborhood}
              </p>
              {a.transit && (
                <p className="text-taupe mt-3 text-xs leading-[1.8]">{a.transit}</p>
              )}
            </div>
          </div>
        )}


        <FaqSection />


        <div className="py-10" data-reveal>
          <ApartmentRecommendations apartments={recommendations} />
        </div>
      </main>

      <Footer />


      <div className="bg-cream/90 fixed inset-x-0 bottom-0 z-40 border-t border-divider p-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-coffee text-lg font-bold">{a.price}€</span>
            <span className="text-taupe text-sm"> /nuit</span>
          </div>
          <Button href="/reserver">Réserver</Button>
        </div>
      </div>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-silver text-caption font-bold uppercase tracking-[0.5px]">{label}</span>
      <span className="text-coffee text-xs font-extrabold">{value}</span>
    </div>
  )
}
