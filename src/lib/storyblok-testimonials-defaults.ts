export interface SharedTestimonialDefault {
  quote: string
  name: string
  apartment: string
  stay: string
}

export const SHARED_TESTIMONIALS_DEFAULTS: readonly SharedTestimonialDefault[] = [
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
]
