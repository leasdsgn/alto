'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/locale-provider'
import { Button } from '@/components/ui/button'
import { LocaleToggle } from '@/components/ui/locale-toggle'

interface HeaderProps {
  variant?: 'light' | 'dark'
}

export function Header({ variant = 'light' }: HeaderProps) {
  const [open, setOpen] = useState(false)

  const isLight = variant === 'light'
  const textClass = isLight ? 'text-cream' : 'text-coffee'
  const logo = isLight ? '/images/logo-alto-light.png' : '/images/logo-alto-dark.png'
  const positionClass = isLight ? 'absolute inset-x-0 top-0 z-30' : 'relative z-30'

  return (
    <header className={`${positionClass} flex items-center justify-between px-gutter py-6 md:px-gutter-md lg:px-gutter-lg lg:py-12`}>
      <Link href="/">
        <Image src={logo} alt="Alto" width={140} height={36} priority style={{ width: 140, height: 36, objectFit: 'contain' }} />
      </Link>

      <button
        type="button"
        className={`${textClass} flex size-8 items-center justify-center lg:hidden`}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        onClick={() => setOpen(!open)}
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </button>

      <nav className="hidden items-center gap-6 lg:flex">
        <NavLinks textClass={textClass} />
        <NavActions textClass={textClass} />
      </nav>

      {open && (
        <div className="bg-coffee/95 fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            className="text-cream absolute top-6 right-6 flex size-8 items-center justify-center"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>

          <NavLinks textClass="text-cream" mobile onClick={() => setOpen(false)} />
          <NavActions textClass="text-cream" />
        </div>
      )}
    </header>
  )
}

function NavLinks({ textClass, mobile, onClick }: { textClass: string; mobile?: boolean; onClick?: () => void }) {
  const t = useTranslations('nav')
  const className = mobile
    ? 'text-cream text-lg font-bold tracking-[0.24px]'
    : `${textClass} text-xs font-bold leading-[155%] tracking-[0.24px]`

  return (
    <>
      <Link href="/blog" className={className} onClick={onClick}>
        {t('blog')}
      </Link>
      <Link href="/notre-histoire" className={className} onClick={onClick}>
        {t('story')}
      </Link>
    </>
  )
}

function NavActions({ textClass }: { textClass: string }) {
  const t = useTranslations('nav')
  return (
    <div className="flex items-center gap-6">
      <Button href="/appartements" className="uppercase">
        {t('book')}
      </Button>
      <LocaleToggle className={`${textClass} text-xs font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-70`} />
    </div>
  )
}

function BurgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
