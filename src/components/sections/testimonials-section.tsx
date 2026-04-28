'use client'

import { useEffect, useState } from 'react'

const TESTIMONIALS = [
  {
    quote: 'On s\'est sentis chez nous dès la première minute. L\'appartement est exactement comme sur les photos, en mieux.',
    name: 'Marie & Thomas',
    apartment: 'Le Faubourg',
    stay: 'Avril 2026',
  },
  {
    quote: 'Le check-in autonome à minuit, sans stress. Et le quartier est parfait pour découvrir Paris à pied.',
    name: 'James W.',
    apartment: 'L\'Opera',
    stay: 'Mars 2026',
  },
  {
    quote: 'Trois nuits, et on a déjà réservé pour l\'été. Le Saint-Germain est devenu notre adresse parisienne.',
    name: 'Sofia & Leo',
    apartment: 'Le Saint-Germain',
    stay: 'Février 2026',
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const testimonial = TESTIMONIALS[current]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % TESTIMONIALS.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <section>
      <div className="mx-auto max-w-content px-gutter md:px-gutter-md">
        <div className="border-divider border-b py-section md:py-section-md">
          <p className="text-silver text-overline font-bold uppercase tracking-[0.24px]">Témoignages</p>

          <div className="mt-10 flex flex-col gap-6">
            <blockquote className="text-coffee text-xl leading-[1.5] font-semibold md:min-h-[140px] md:text-2xl md:leading-[1.4]">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-coffee text-body-sm font-bold">{testimonial.name}</p>
                <p className="text-taupe text-overline tracking-[0.24px]">
                  {testimonial.apartment} · {testimonial.stay}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rounded-full transition-all duration-300 ${
                      i === current ? 'bg-coffee size-2.5' : 'bg-silver size-2'
                    }`}
                    onClick={() => setCurrent(i)}
                    aria-label={`Témoignage ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
