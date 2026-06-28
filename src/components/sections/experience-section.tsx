'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/components/providers/locale-provider'

gsap.registerPlugin(ScrollTrigger)

interface ExperienceSectionProps {
  panelImages: {
    arrival: string
    checkin: string
    checkout: string
  }
  copy?: ExperienceSectionCopy
}

type ExperiencePanelCopy = {
  label: string
  title: string
  editableAttributes?: EditableAttributes
}

type EditableAttributes = Record<string, string | undefined>

type ExperienceSectionCopy = {
  about: string
  button: string
  panels: [ExperiencePanelCopy, ExperiencePanelCopy, ExperiencePanelCopy]
}

export function ExperienceSection({ panelImages, copy: copyOverride }: ExperienceSectionProps) {
  const locale = useLocale()
  const copy = (copyOverride ?? EXPERIENCE_COPY[locale]) as ExperienceSectionCopy
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const panels = [
    {
      label: copy.panels[0].label,
      title: copy.panels[0].title,
      image: panelImages.arrival,
      editableAttributes: copy.panels[0].editableAttributes,
    },
    {
      label: copy.panels[1].label,
      title: copy.panels[1].title,
      image: panelImages.checkin,
      editableAttributes: copy.panels[1].editableAttributes,
    },
    {
      label: copy.panels[2].label,
      title: copy.panels[2].title,
      image: panelImages.checkout,
      editableAttributes: copy.panels[2].editableAttributes,
    },
  ]

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.innerWidth < 768) return

    const section = sectionRef.current
    const track = trackRef.current
    const wrapper = track?.parentElement
    if (!section || !track || !wrapper) return

    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - wrapper.clientWidth)

      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'center center',
          end: () => `+=${distance()}`,
          pin: true,
          pinType: 'transform',
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })

      ScrollTrigger.refresh()
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-section relative md:h-screen md:overflow-hidden md:py-0"
    >
      <div className="max-w-content md:px-gutter-md mx-auto flex items-stretch px-4 md:h-full md:items-center">
        <div
          ref={trackRef}
          className="flex w-full flex-col gap-3 md:flex-row md:items-stretch md:will-change-transform"
        >
          <div className="bg-taupe relative flex h-[420px] w-full shrink-0 flex-col justify-between overflow-hidden rounded-lg px-5 py-4 md:h-[598px] md:w-[396px] md:px-6 md:py-5">
            <ArchBackdrop />
            <p className="text-silver text-overline relative z-10 font-bold tracking-[0.24px] uppercase">
              {copy.about}
            </p>
            <div className="relative z-10 flex flex-col gap-6 md:gap-8">
              <Button
                variant="primary"
                size="regular"
                href="/notre-histoire"
                iconRight={<ArrowOutward />}
                className="self-start"
              >
                {copy.button}
              </Button>
            </div>
          </div>

          {panels.map((panel) => (
            <div
              key={panel.title}
              {...panel.editableAttributes}
              className="relative h-[420px] w-full shrink-0 overflow-hidden rounded-lg md:h-[598px] md:w-[396px]"
            >
              <Image
                src={panel.image}
                alt={panel.title}
                fill
                sizes="(max-width: 768px) 100vw, 396px"
                quality={85}
                className="object-cover"
              />
              <div className="bg-taupe/80 absolute inset-0 rounded-lg mix-blend-multiply" />
              <div className="absolute inset-0 px-5 py-6 md:px-8 md:py-8">
                <h3 className="text-cream text-h4 absolute inset-0 flex items-center justify-start px-5 text-left font-medium tracking-[-0.24px] md:px-8">
                  {panel.label}
                </h3>
                <p className="text-cream text-body-xl absolute inset-x-5 bottom-6 font-semibold md:inset-x-8 md:bottom-8">
                  {panel.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const EXPERIENCE_COPY = {
  fr: {
    about: 'À PROPOS',
    button: 'En savoir plus',
    panels: [
      { label: 'Espaces', title: 'Espaces de charme, singuliers, atypiques, et bien pensés.' },
      {
        label: 'Localisation',
        title: 'Bonnes adresses. Au cœur de l’action ou loin des sentiers battus.',
      },
      { label: 'Confort', title: 'Standards hôteliers. Soin des détails, équipements modernes.' },
    ],
  },
  en: {
    about: 'ABOUT',
    button: 'Learn more',
    panels: [
      { label: 'Spaces', title: 'Charming, distinctive, atypical, and carefully designed spaces.' },
      {
        label: 'Location',
        title: 'Good addresses. At the heart of the action or away from the expected path.',
      },
      { label: 'Comfort', title: 'Hotel standards. Attention to detail and modern amenities.' },
    ],
  },
} as const

function ArchBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
      <Image
        src="/images/alto-arch.png"
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 396px"
        className="object-cover"
      />
    </div>
  )
}

function ArrowOutward() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 11 11 3M11 3H5M11 3v6" />
    </svg>
  )
}
