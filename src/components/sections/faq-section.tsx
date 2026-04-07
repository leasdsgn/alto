'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  { question: 'Comment fonctionne le check-in ?', answer: 'Accès autonome 24h/24 avec un code personnel envoyé par SMS la veille de votre arrivée.' },
  { question: 'Y a-t-il un ménage inclus ?', answer: 'Oui, le ménage complet est inclus à chaque séjour.' },
  { question: 'Puis-je réserver sans passer par Airbnb ?', answer: 'Oui, la réservation directe est possible et sans frais de plateforme.' },
  { question: 'Quelle est la différence avec un hôtel ?', answer: "Plus d'espace, plus d'intimité, un vrai quartier à vivre. Avec le même niveau de service." },
  { question: 'Que comprend le prix affiché ?', answer: 'Le prix inclut le logement, le ménage, le linge de lit et de bain, et le wifi.' },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="mx-auto max-w-content px-gutter pb-[60px] pt-[100px] md:px-gutter-md">
      <div>
        <p className="text-silver text-xs font-bold uppercase leading-[24px] tracking-[0.24px]">FAQ</p>
        <p className="text-coffee text-base font-medium leading-[24px]">Questions fréquentes</p>
      </div>

      <div className="mt-6">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border-t border-divider">
            <button
              type="button"
              className="flex w-full items-center gap-3 py-3"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <svg
                width="7"
                height="11"
                viewBox="0 0 7 11"
                fill="none"
                className={`shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-90' : ''}`}
              >
                <path d="M1 1l4.5 4.5L1 10" stroke="#aba39e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-silver text-base font-bold leading-[24px]">{item.question}</span>
            </button>
            {openIndex === i && (
              <p className="text-coffee pb-4 pl-[19px] text-xs font-medium leading-[22px]">
                {item.answer}
              </p>
            )}
          </div>
        ))}
        <div className="border-t border-divider" />
      </div>
    </section>
  )
}
