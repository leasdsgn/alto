'use client'

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PILLARS = [
  {
    number: '01',
    title: 'Design',
    description: 'Des intérieurs pensés, pas décorés. Chaque meuble, chaque lumière a sa raison d\'être.',
  },
  {
    number: '02',
    title: 'Emplacement',
    description: 'Au cœur des quartiers les plus vivants de Paris. À pied, tout est accessible.',
  },
  {
    number: '03',
    title: 'Service',
    description: 'L\'attention d\'un hôtel, la liberté d\'un chez-soi. Discret, disponible, précis.',
  },
]

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const section = sectionRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!section || !left || !right) return

    const ctx = gsap.context(() => {
      gsap.set(right, { opacity: 0, xPercent: 20 })
      gsap.set(left, { width: '100%' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.6,
        },
      })

      tl.to(left, { width: '33%', duration: 1, ease: 'power2.inOut' })
      tl.to(right, { opacity: 1, xPercent: 0, duration: 1, ease: 'power2.out' }, 0.3)
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="flex min-h-screen flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-content px-gutter md:px-gutter-md">
        <p className="text-silver text-xs font-bold tracking-[0.24px] uppercase">
          Pourquoi Alto
        </p>
        <h2 className="text-coffee mt-3 text-2xl font-bold tracking-[-0.48px] md:text-4xl md:tracking-[-0.72px]">
          Une autre idée de l'hospitalité
        </h2>

        <div className="mt-10 flex gap-6">
          <div
            ref={leftRef}
            className="bg-coffee flex min-h-[441px] shrink-0 flex-col justify-between overflow-hidden rounded-lg p-8 md:p-10"
          >
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-cream/40 text-[10px] font-bold uppercase tracking-[2px]">Manifeste</p>
                <p className="text-cream mt-3 text-sm leading-[1.8]">
                  Un appartement ne devrait pas ressembler à un hôtel. Il devrait ressembler à quelque chose que vous n'avez pas encore trouvé.
                </p>
              </div>
              <div className="flex flex-col gap-6">
                {PILLARS.map((pillar) => (
                  <div key={pillar.title} className="flex gap-4">
                    <span className="text-cream/30 text-xs font-bold tabular-nums">{pillar.number}</span>
                    <div>
                      <h3 className="text-cream text-sm font-bold">{pillar.title}</h3>
                      <p className="text-cream/60 mt-1.5 text-xs leading-[1.7]">{pillar.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-cream/30 mt-10 text-caption font-bold uppercase tracking-[1px]">
              Paris · Lyon · Bientôt ailleurs
            </p>
          </div>

          <div
            ref={rightRef}
            className="relative flex-1 overflow-hidden rounded-lg md:min-h-[441px]"
          >
            <Image
              src="/images/alto-salon.jpg"
              alt="Le Faubourg, Le Marais"
              fill
              sizes="(max-width: 768px) 100vw, 67vw"
              quality={85}
              className="object-cover"
            />
            <div className="bg-coffee/20 absolute inset-0" />
            <div className="relative flex h-full flex-col justify-end p-8 md:p-10">
              <p className="text-cream text-caption font-bold uppercase tracking-[1px]">Le Faubourg</p>
              <p className="text-cream/70 mt-1 text-xs leading-[1.7]">
                Le Marais, Paris 3e
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
