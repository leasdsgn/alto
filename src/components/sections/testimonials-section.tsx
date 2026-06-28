'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/components/providers/locale-provider'

interface TestimonialsSectionProps {
  copy?: TestimonialsSectionCopy
}

type TestimonialsSectionCopy = {
  title: string
  items: readonly {
    quote: string
    name: string
    apartment: string
    stay: string
    editableAttributes?: EditableAttributes
  }[]
}

type EditableAttributes = Record<string, string | undefined>

export function TestimonialsSection({ copy: copyOverride }: TestimonialsSectionProps = {}) {
  const locale = useLocale()
  const copy = (copyOverride ?? TESTIMONIALS_COPY[locale]) as TestimonialsSectionCopy
  const [current, setCurrent] = useState(0)
  const testimonial = copy.items[current]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((index) => (index + 1) % copy.items.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [copy.items.length])

  return (
    <section>
      <div className="max-w-content px-gutter md:px-gutter-md mx-auto">
        <div className="border-divider py-section md:py-section-md border-b">
          <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">
            {copy.title}
          </p>

          <div {...testimonial.editableAttributes} className="mt-10 flex flex-col gap-6">
            <blockquote className="text-coffee min-h-[180px] text-xl leading-[1.5] font-semibold md:min-h-[140px] md:text-2xl md:leading-[1.4]">
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
                {copy.items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rounded-full transition-all duration-300 ${
                      i === current ? 'bg-coffee size-2.5' : 'bg-silver size-2'
                    }`}
                    onClick={() => setCurrent(i)}
                    aria-label={`${copy.title} ${i + 1}`}
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

const TESTIMONIALS_COPY = {
  fr: {
    title: 'Témoignages',
    items: [
      {
        quote:
          'On s’est sentis chez nous dès la première minute. L’appartement est exactement comme sur les photos, en mieux.',
        name: 'Marie & Thomas',
        apartment: 'Le Faubourg',
        stay: 'Avril 2026',
      },
      {
        quote:
          'Le check-in autonome à minuit, sans stress. Et le quartier est parfait pour découvrir Paris à pied.',
        name: 'James W.',
        apartment: 'L’Opera',
        stay: 'Mars 2026',
      },
      {
        quote:
          'Trois nuits, et on a déjà réservé pour l’été. Le Saint-Germain est devenu notre adresse parisienne.',
        name: 'Sofia & Leo',
        apartment: 'Le Saint-Germain',
        stay: 'Février 2026',
      },
    ],
  },
  en: {
    title: 'Guest reviews',
    items: [
      {
        quote:
          'We felt at home from the first minute. The apartment is exactly like the photos, only better.',
        name: 'Marie & Thomas',
        apartment: 'Le Faubourg',
        stay: 'April 2026',
      },
      {
        quote:
          'Self check-in at midnight, with no stress. The neighborhood is perfect for exploring Paris on foot.',
        name: 'James W.',
        apartment: 'L’Opera',
        stay: 'March 2026',
      },
      {
        quote:
          'Three nights, and we already booked again for summer. Le Saint-Germain became our Paris address.',
        name: 'Sofia & Leo',
        apartment: 'Le Saint-Germain',
        stay: 'February 2026',
      },
    ],
  },
} as const
