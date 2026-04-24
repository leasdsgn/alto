'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    title: 'Arrivée',
    description: 'Un quartier vivant, une adresse discrète. Votre séjour commence dès la sortie du métro.',
    image: '/images/hero-home.jpg',
  },
  {
    title: 'Check-in',
    description: 'Accès autonome, 24h/24. Pas de file d\'attente, pas de comptoir. Juste votre code et votre clé.',
    image: '/images/blog-1.jpg',
  },
  {
    title: 'Séjour',
    description: 'Un intérieur pensé pour vivre, pas pour impressionner. Lumière naturelle, linge de qualité, silence.',
    image: '/images/alto-salon.jpg',
  },
  {
    title: 'Départ',
    description: 'Posez les clés, partez. Le ménage, le linge, l\'intendance : on s\'occupe de tout.',
    image: '/images/blog-2.jpg',
  },
]

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          refreshPriority: -1,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="overflow-hidden">
      <div ref={trackRef} className="flex h-screen items-center" style={{ minWidth: `${35 + STEPS.length * 30 + 5}vw` }}>
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
            className={`relative flex h-[70vh] w-[30vw] shrink-0 flex-col justify-end overflow-hidden rounded-lg p-8 md:p-10 ${i < STEPS.length - 1 ? 'mr-4' : ''}`}
          >
            <Image
              src={step.image}
              alt={step.title}
              fill
              className="object-cover"
              sizes="30vw"
            />
            <div className="absolute inset-0 bg-coffee/55" />
            <div className="relative z-10">
              <p className="text-cream/40 text-xs font-bold tracking-[0.24px]">0{i + 1}</p>
              <h3 className="text-cream mt-2 text-xl font-bold md:text-2xl">{step.title}</h3>
              <p className="text-cream/70 mt-3 max-w-[280px] text-sm leading-[1.6]">{step.description}</p>
            </div>
          </div>
        ))}

        <div className="w-[5vw] shrink-0" />
      </div>
    </section>
  )
}
