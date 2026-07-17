'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHeaderGlobals } from '@/components/providers/storyblok-globals-provider'
import { LocaleToggle } from '@/components/ui/locale-toggle'
import { BookingNavPill } from '@/components/ui/booking-nav-pill'
import { Button } from '@/components/ui/button'
import {
  type StoryblokHeader,
  type HeaderNavItem,
  type HeaderQuickLink,
} from '@/lib/storyblok-globals'

type Tone = 'light' | 'dark'
type Mode = 'default' | 'apartment'

interface HeaderProps {
  variant?: Tone
  mode?: Mode
}

export function Header({ variant = 'light', mode = 'default' }: HeaderProps) {
  const [openPath, setOpenPath] = useState<string | null>(null)
  const pathname = usePathname()
  const header = useHeaderGlobals()
  const open = openPath === pathname
  const isApartment = mode === 'apartment'
  const tone: Tone = isApartment ? 'dark' : variant
  const isLight = tone === 'light'
  const textClass = isLight ? 'text-cream' : 'text-coffee'
  const logoSrc = isLight ? header.logoLight : header.logoDark

  const positionClass = isApartment
    ? 'sticky top-0 z-30 border-b border-divider bg-cream'
    : 'absolute inset-x-0 top-0 z-30 bg-transparent'
  const apartmentBackgroundStyle = isApartment
    ? { background: 'var(--Floral-white, #FFFFF8)' }
    : undefined

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenPath(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <>
      <header className={`${positionClass} py-5 lg:py-6`} style={apartmentBackgroundStyle}>
        <div className="max-w-content px-gutter md:px-gutter-md mx-auto flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/" prefetch={false} className="shrink-0">
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

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {!isApartment && (
              <Button variant="primary" size="small" href="/appartements" prefetch={false}>
                {header.bookLabel}
              </Button>
            )}
            {isApartment && <MapButton label={header.mapLabel} />}
            <LocaleToggle
              className={`${textClass} text-overline flex size-8 items-center justify-center rounded-md border font-bold tracking-[0.12em] uppercase transition-colors disabled:opacity-50 ${
                isLight
                  ? 'border-cream/30 hover:bg-cream/10'
                  : 'border-divider bg-cream hover:bg-sand'
              }`}
            />
            <BurgerButton
              open={open}
              header={header}
              onClick={() => setOpenPath(open ? null : pathname)}
            />
          </div>
        </div>
      </header>

      <BurgerOverlay
        open={open}
        onClose={() => setOpenPath(null)}
        pathname={pathname}
        header={header}
      />
    </>
  )
}

function MapButton({ label }: { label: string }) {
  return (
    <Link
      href="/appartements"
      prefetch={false}
      aria-label={label}
      className="bg-coffee text-cream flex size-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
        <path d="M9 4v14M15 6v14" />
      </svg>
    </Link>
  )
}

function BurgerButton({
  open,
  header,
  onClick,
}: {
  open: boolean
  header: StoryblokHeader
  onClick: () => void
}) {
  const label = open ? header.mobileCloseLabel : header.mobileOpenLabel

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
      className="bg-coffee text-cream relative flex size-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
    >
      <span className="sr-only">{label}</span>
      <span
        className={`absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${open ? 'translate-y-0 rotate-45' : '-translate-y-[5px]'}`}
      />
      <span
        className={`absolute h-0.5 w-4 rounded-full bg-current transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`}
      />
      <span
        className={`absolute h-0.5 w-4 rounded-full bg-current transition-transform duration-300 ${open ? 'translate-y-0 -rotate-45' : 'translate-y-[5px]'}`}
      />
    </button>
  )
}

function BurgerOverlay({
  open,
  onClose,
  pathname,
  header,
}: {
  open: boolean
  onClose: () => void
  pathname: string
  header: StoryblokHeader
}) {
  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <button
        type="button"
        aria-label={header.mobileCloseLabel}
        onClick={onClose}
        className={`bg-coffee/40 absolute inset-0 backdrop-blur-md transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="absolute inset-x-4 top-4 bottom-4 md:right-6 md:left-auto md:w-[420px]">
        <div
          className={`border-divider bg-cream text-coffee flex h-full flex-col overflow-hidden rounded-[28px] border shadow-[0_24px_80px_rgba(48,26,10,0.18)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            open ? 'translate-x-0' : 'translate-x-[calc(100%+2rem)]'
          }`}
        >
          <div className="border-divider flex items-center justify-between border-b px-5 py-5">
            <Link href="/" prefetch={false} className="shrink-0" onClick={onClose}>
              <Image
                src={header.logoDark}
                alt="Alto"
                width={110}
                height={28}
                style={{ width: 110, height: 'auto' }}
              />
            </Link>

            <button
              type="button"
              className="bg-coffee text-cream flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-80"
              aria-label={header.mobileCloseLabel}
              onClick={onClose}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-between overflow-y-auto px-5 py-5">
            <div className="space-y-8">
              <div>
                <p className="text-silver text-overline mb-4 font-bold tracking-[0.24px] uppercase">
                  {header.mobileNavigationLabel}
                </p>
                <nav className="space-y-3">
                  {header.navPrimary.map((link) => (
                    <PrimaryLink
                      key={link.href}
                      link={link}
                      active={isPathnameActive(pathname, link.href)}
                      onClose={onClose}
                    />
                  ))}
                </nav>
              </div>

              <div>
                <p className="text-silver text-overline mb-4 font-bold tracking-[0.24px] uppercase">
                  {header.mobileQuickAccessLabel}
                </p>
                <div className="flex flex-wrap gap-3">
                  {header.navSecondary.map((link) => (
                    <SecondaryLink
                      key={`${link.href}-${link.label}`}
                      link={link}
                      active={pathname === link.href}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="border-divider mt-8 border-t pt-5">
              <p className="text-taupe text-body-sm mb-4 max-w-[26ch]">{header.mobileFooterText}</p>
              <Button
                href={header.mobileFooterButtonHref}
                prefetch={false}
                className="w-full justify-center"
              >
                {header.mobileFooterButtonLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrimaryLink({
  link,
  active,
  onClose,
}: {
  link: HeaderNavItem
  active: boolean
  onClose: () => void
}) {
  return (
    <Link
      href={link.href}
      prefetch={false}
      target={link.opensInNewTab ? '_blank' : undefined}
      rel={link.opensInNewTab ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      className={`group block rounded-[20px] border px-4 py-4 transition-colors ${
        active
          ? 'border-coffee bg-coffee text-cream'
          : 'border-divider text-coffee hover:bg-sand bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[22px] leading-[1.5] font-semibold tracking-[-1.98px]">{link.label}</p>
          {link.description && (
            <p className={`text-body mt-1 font-medium ${active ? 'text-cream/82' : 'text-taupe'}`}>
              {link.description}
            </p>
          )}
        </div>
        <span
          className={`flex size-9 items-center justify-center rounded-full border transition-transform group-hover:translate-x-0.5 ${
            active
              ? 'border-cream/20 bg-cream/10 text-cream'
              : 'border-divider bg-cream text-coffee'
          }`}
        >
          <ArrowOutward />
        </span>
      </div>
    </Link>
  )
}

function SecondaryLink({
  link,
  active,
  onClose,
}: {
  link: HeaderQuickLink
  active: boolean
  onClose: () => void
}) {
  return (
    <Link
      href={link.href}
      prefetch={false}
      target={link.opensInNewTab ? '_blank' : undefined}
      rel={link.opensInNewTab ? 'noopener noreferrer' : undefined}
      onClick={onClose}
      className={`text-overline rounded-full border px-4 py-2 font-bold uppercase transition-colors ${
        active ? 'border-coffee bg-coffee text-cream' : 'border-divider text-coffee hover:bg-sand'
      }`}
    >
      {link.label}
    </Link>
  )
}

function isPathnameActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
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
      aria-hidden="true"
    >
      <path d="M3 11 11 3M11 3H5M11 3v6" />
    </svg>
  )
}
