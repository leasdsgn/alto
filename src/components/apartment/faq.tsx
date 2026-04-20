'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqProps {
  items: FaqItem[]
}

export function ApartmentFaq({ items }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-8 border-t border-divider pt-8">
      <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">FAQ</p>
      <h2 className="text-coffee mt-2 text-base font-medium leading-[24px]">Questions fréquentes</h2>

      <div className="mt-6 flex flex-col">
        {items.map((item, i) => (
          <div key={i} className="border-t border-divider">
            <button
              type="button"
              className="flex w-full items-center gap-3 py-3 text-left"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <svg
                width="7"
                height="11"
                viewBox="0 0 7 11"
                fill="none"
                stroke="#aba39e"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-90' : ''}`}
              >
                <path d="M1 1l4.5 4.5L1 10" />
              </svg>
              <span className="text-silver text-base font-bold">{item.question}</span>
            </button>
            {openIndex === i && (
              <p className="text-coffee pb-4 pl-[19px] text-xs font-medium leading-[22px]">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
