'use client'

import { useState } from 'react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqProps {
  items: FaqItem[]
  title?: string
  heading?: string
}

export function ApartmentFaq({ items, title = 'FAQ', heading = 'Questions fréquentes' }: FaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      <p className="text-silver text-overline font-bold tracking-[0.24px] uppercase">{title}</p>
      <h2 className="text-coffee text-body-xl mt-2 leading-[1.5] font-semibold">
        {heading}
      </h2>

      <div className="mt-6 flex flex-col">
        {items.map((item, i) => (
          <div key={i} className="border-divider border-b">
            <button
              type="button"
              className="flex w-full items-center gap-4 py-5 text-left"
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
              <span className="text-coffee text-body">{item.question}</span>
            </button>
            {openIndex === i && (
              <p className="text-ash text-body-sm -mt-1 pb-5 pl-5 leading-[1.6]">{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
