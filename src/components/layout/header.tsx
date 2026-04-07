'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  variant?: 'light' | 'dark'
}

export function Header({ variant = 'light' }: HeaderProps) {
  const [open, setOpen] = useState(false)

  const isLight = variant === 'light'
  const textClass = isLight ? 'text-cream' : 'text-coffee'
  const logo = isLight ? '/images/logo-alto-light.png' : '/images/logo-alto-dark.png'
  const dividerClass = isLight ? 'bg-cream/30' : 'bg-coffee/15'
  const positionClass = isLight ? 'absolute inset-x-0 top-0 z-30' : 'relative z-30'

  return (
    <header className={`${positionClass} flex items-center justify-between px-gutter py-6 md:px-gutter-md lg:px-gutter-lg lg:py-12`}>
      <Link href="/">
        <Image src={logo} alt="Alto" width={140} height={37} priority />
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
        <NavActions textClass={textClass} dividerClass={dividerClass} />
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
          <NavActions textClass="text-cream" dividerClass="bg-cream/30" />
        </div>
      )}
    </header>
  )
}

function NavLinks({ textClass, mobile, onClick }: { textClass: string; mobile?: boolean; onClick?: () => void }) {
  const className = mobile
    ? 'text-cream text-lg font-bold tracking-[0.24px]'
    : `${textClass} text-xs font-bold leading-[155%] tracking-[0.24px]`

  return (
    <>
      <Link href="/blog" className={className} onClick={onClick}>
        Conseils voyage
      </Link>
      <Link href="/notre-histoire" className={className} onClick={onClick}>
        Notre histoire
      </Link>
    </>
  )
}

function NavActions({ textClass, dividerClass }: { textClass: string; dividerClass: string }) {
  return (
    <div className="flex items-center gap-6">
      <Button href="/reserver" className="uppercase">
        Réserver
      </Button>
      <div className={`${dividerClass} h-[23px] w-px`} />
      <button
        type="button"
        className={`${textClass} flex size-[35px] items-center justify-center rounded-lg`}
        aria-label="Mon compte"
      >
        <svg width="35" height="35" viewBox="0 0 35 35" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M25 17C25.7956 17 26.5587 16.6839 27.1213 16.1213C27.6839 15.5587 28 14.7956 28 14C28 13.2044 27.6839 12.4413 27.1213 11.8787C26.5587 11.3161 25.7956 11 25 11C24.2044 11 23.4413 11.3161 22.8787 11.8787C22.3161 12.4413 22 13.2044 22 14C22 14.7956 22.3161 15.5587 22.8787 16.1213C23.4413 16.6839 24.2044 17 25 17Z" />
          <path d="M19 24C19.6272 22.7785 20.5085 21.7689 21.5593 21.0684C22.61 20.3679 23.7949 20 25 20C26.2051 20 27.39 20.3679 28.4407 21.0684C29.4915 21.7689 30.3728 22.7785 31 24" />
          <path d="M25 26C26.1819 26 27.3522 25.7672 28.4442 25.3149C29.5361 24.8626 30.5282 24.1997 31.364 23.364C32.1997 22.5282 32.8626 21.5361 33.3149 20.4442C33.7672 19.3522 34 18.1819 34 17C34 15.8181 33.7672 14.6478 33.3149 13.5558C32.8626 12.4639 32.1997 11.4718 31.364 10.636C30.5282 9.80031 29.5361 9.13738 28.4442 8.68508C27.3522 8.23279 26.1819 8 25 8C22.6131 8 20.3239 8.94821 18.636 10.636C16.9482 12.3239 16 14.6131 16 17C16 19.3869 16.9482 21.6761 18.636 23.364C20.3239 25.0518 22.6131 26 25 26Z" />
        </svg>
      </button>
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
