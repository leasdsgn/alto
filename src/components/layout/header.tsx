'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/locale-provider'
import { LocaleToggle } from '@/components/ui/locale-toggle'
import { BookingNavPill } from '@/components/ui/booking-nav-pill'
import { Button } from '@/components/ui/button'

type Tone = 'light' | 'dark'
type Mode = 'default' | 'apartment'

interface HeaderProps {
  variant?: Tone
  mode?: Mode
}

export function Header({ variant = 'light', mode = 'default' }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const isApartment = mode === 'apartment'
  const tone: Tone = isApartment ? 'dark' : variant
  const isLight = tone === 'light'
  const textClass = isLight ? 'text-cream' : 'text-coffee'
  const logoSrc = isLight ? '/images/logo-alto-light.png' : '/images/logo-alto-dark.png'

  const positionClass = isApartment
    ? 'sticky top-0 z-30 border-b border-divider bg-cream'
    : 'absolute inset-x-0 top-0 z-30 bg-transparent'

  return (
    <>
      <header className={`${positionClass} py-5 lg:py-6`}>
        <div className="mx-auto flex max-w-content items-center justify-between gap-6 px-gutter md:px-gutter-md">
          <Link href="/" className="shrink-0">
            <Image
              src={logoSrc}
              alt="Alto"
              width={140}
              height={36}
              priority
              style={{ width: 140, height: 36, objectFit: 'contain' }}
            />
          </Link>

          {isApartment && (
            <div className="hidden flex-1 justify-center lg:flex">
              <BookingNavPill />
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2">
            {!isApartment && (
              <Button variant="primary" size="small" href="/appartements">
                Réserver
              </Button>
            )}
            {isApartment && <MapButton />}
            <BurgerButton open={open} onClick={() => setOpen((o) => !o)} />
          </div>
        </div>
      </header>

      {open && <BurgerOverlay onClose={() => setOpen(false)} />}

      <span className={textClass} aria-hidden="true" hidden />
    </>
  )
}

function MapButton() {
  return (
    <Link
      href="/appartements"
      aria-label="Voir la carte"
      className="bg-coffee text-cream flex size-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
        <path d="M9 4v14M15 6v14" />
      </svg>
    </Link>
  )
}

function BurgerButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={open}
      onClick={onClick}
      className="bg-coffee text-cream flex size-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 7h14M5 12h14M5 17h14" />
      </svg>
    </button>
  )
}

function BurgerOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations('nav')
  return (
    <div className="bg-coffee/95 fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 backdrop-blur-sm">
      <button
        type="button"
        className="text-cream absolute top-6 right-6 flex size-8 items-center justify-center"
        aria-label="Fermer le menu"
        onClick={onClose}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <nav className="flex flex-col items-center gap-6">
        <Link href="/appartements" className="text-cream text-h3 font-bold tracking-[-0.02em]" onClick={onClose}>
          {t('book')}
        </Link>
        <Link href="/blog" className="text-cream text-h5 font-bold" onClick={onClose}>
          {t('blog')}
        </Link>
        <Link href="/notre-histoire" className="text-cream text-h5 font-bold" onClick={onClose}>
          {t('story')}
        </Link>
      </nav>

      <LocaleToggle className="text-cream/70 text-overline font-bold uppercase tracking-[0.24px] transition-opacity hover:opacity-100" />
    </div>
  )
}
