'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    title: 'Arrivée',
    description: 'Un quartier vivant, une adresse discrète. Votre séjour commence dès la sortie du métro.',
    bg: 'var(--color-sand)',
    textColor: 'text-coffee',
    subColor: 'text-ash',
    numColor: 'text-taupe',
  },
  {
    title: 'Check-in',
    description: 'Accès autonome, 24h/24. Pas de file d\'attente, pas de comptoir. Juste votre code et votre clé.',
    bg: 'var(--color-taupe)',
    textColor: 'text-cream',
    subColor: 'text-cream/80',
    numColor: 'text-cream/40',
  },
  {
    title: 'Séjour',
    description: 'Un intérieur pensé pour vivre, pas pour impressionner. Lumière naturelle, linge de qualité, silence.',
    bg: 'var(--color-coffee)',
    textColor: 'text-cream',
    subColor: 'text-cream/70',
    numColor: 'text-cream/30',
  },
  {
    title: 'Départ',
    description: 'Posez les clés, partez. Le ménage, le linge, l\'intendance : on s\'occupe de tout.',
    bg: 'var(--color-ash)',
    textColor: 'text-cream',
    subColor: 'text-cream/80',
    numColor: 'text-cream/40',
  },
]

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - window.innerWidth

      gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: `+=${totalScroll}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          refreshPriority: -1,
        },
      })
    }, section)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="overflow-hidden">
      <div ref={trackRef} className="flex h-screen items-center">
        <div className="flex w-[35vw] shrink-0 flex-col justify-center px-gutter md:px-gutter-md">
          <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">L'expérience</p>
          <h2 className="text-coffee mt-4 text-2xl leading-[1.3] font-bold tracking-[-0.48px] md:text-4xl md:tracking-[-0.72px]">
            Vivre Alto
          </h2>
          <p className="text-taupe mt-4 max-w-[300px] text-sm leading-[1.7]">
            Du premier pas dans le quartier au départ, chaque moment est pensé pour que vous n'ayez à penser à rien.
          </p>
        </div>

        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className={`flex h-[70vh] w-[30vw] shrink-0 flex-col justify-end rounded-lg p-8 md:p-10 ${i < STEPS.length - 1 ? 'mr-4' : ''}`}
            style={{ background: step.bg }}
          >
            <p className={`text-xs font-bold tracking-[0.24px] ${step.numColor}`}>
              0{i + 1}
            </p>
            <h3 className={`mt-2 text-xl font-bold md:text-2xl ${step.textColor}`}>
              {step.title}
            </h3>
            <p className={`mt-3 max-w-[280px] text-sm leading-[1.6] ${step.subColor}`}>
              {step.description}
            </p>
          </div>
        ))}

        <div className="w-[5vw] shrink-0" />
      </div>
    </section>
  )
}
