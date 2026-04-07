'use client'

import { useState } from 'react'

const TESTIMONIALS = [
  {
    quote: 'On s\'est sentis chez nous des la premiere minute. L\'appartement est exactement comme sur les photos, en mieux.',
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
    quote: 'Trois nuits, et on a deja rebooke pour l\'ete. Le Saint-Germain est devenu notre adresse parisienne.',
    name: 'Sofia & Leo',
    apartment: 'Le Saint-Germain',
    stay: 'Février 2026',
  },
]

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)
  const testimonial = TESTIMONIALS[current]

  return (
    <section className="bg-sand">
      <div className="mx-auto max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
        <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">Témoignages</p>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-start md:gap-16">
          <div className="flex-1">
            <blockquote className="text-coffee text-xl leading-[1.5] font-semibold md:text-2xl md:leading-[1.4]">
              "{testimonial.quote}"
            </blockquote>

            <div className="mt-6">
              <p className="text-coffee text-sm font-bold">{testimonial.name}</p>
              <p className="text-taupe text-xs tracking-[0.24px]">
                {testimonial.apartment} · {testimonial.stay}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:flex-col">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'bg-coffee size-3'
                    : 'bg-silver size-2'
                }`}
                onClick={() => setCurrent(i)}
                aria-label={`Temoignage ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
