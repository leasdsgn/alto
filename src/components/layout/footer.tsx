'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from '@/components/providers/locale-provider'
import { type InquiryLocale } from '@/types/inquiry'

const FOOTER_COPY = {
  fr: {
    home: 'Accueil',
    apartments: 'Appartements',
    resources: 'Nos ressources',
    about: 'À propos',
    invest: 'Investir',
    legal: 'Légal',
    ariaHome: 'Accueil Alto',
    navLabel: 'Navigation du pied de page',
    rights: 'Tous droits réservés | Alto© 2026',
    ctaTitle: 'Une question ? Notre équipe vous répond.',
    ctaBody: 'Disponible du lundi au vendredi, de 9h à 17h.',
    ctaButton: 'Nous contacter',
  },
  en: {
    home: 'Home',
    apartments: 'Apartments',
    resources: 'Resources',
    about: 'About',
    invest: 'Invest',
    legal: 'Legal',
    ariaHome: 'Alto home',
    navLabel: 'Footer navigation',
    rights: 'All rights reserved | Alto© 2026',
    ctaTitle: 'Any questions? Reach out to our team.',
    ctaBody: 'Available Monday through Friday, 9am to 5pm CET.',
    ctaButton: 'Contact',
  },
} as const

interface FooterProps {
  reserveStickyCtaSpace?: boolean | 'mobile'
}

export function Footer({ reserveStickyCtaSpace = false }: FooterProps) {
  const locale = useLocale()
  const copy = FOOTER_COPY[locale]
  const bottomPadding =
    reserveStickyCtaSpace === true
      ? 'pb-28 md:pb-28'
      : reserveStickyCtaSpace === 'mobile'
        ? 'pb-28 md:pb-20'
        : 'pb-16 md:pb-20'

  return (
    <>
      <FooterContactCta locale={locale} />

      <footer
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #948174 0%, #625143 100%)' }}
      >
        <div className={`mx-auto max-w-content px-gutter pt-16 md:px-gutter-md ${bottomPadding}`}>
          <Link href="/" className="inline-flex" aria-label={copy.ariaHome}>
            <Image
              src="/images/logo-alto-light.png"
              alt="Alto"
              width={313}
              height={82}
              priority={false}
              className="h-auto w-56 md:w-72 lg:w-80"
              sizes="(max-width: 768px) 224px, (max-width: 1024px) 288px, 320px"
            />
          </Link>

          <div className="border-silver mt-12 border-t" />

          <nav
            aria-label={copy.navLabel}
            className="flex flex-col gap-4 py-5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:gap-y-4"
          >
            {getFooterLinks(locale).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-cream text-body transition-opacity hover:opacity-75"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-silver border-t" />

          <p
            className="text-cream pt-5 text-left text-xs font-light"
            style={{ lineHeight: '155%', letterSpacing: '0.24px' }}
          >
            {copy.rights}
          </p>
        </div>
      </footer>
    </>
  )
}

function getFooterLinks(locale: InquiryLocale) {
  const copy = FOOTER_COPY[locale]

  return [
    { label: copy.home, href: '/' },
    { label: 'Paris', href: '/appartements?city=paris' },
    { label: 'Lyon', href: '/appartements?city=lyon' },
    { label: copy.apartments, href: '/appartements' },
    { label: copy.resources, href: '/blog' },
    { label: copy.about, href: '/notre-histoire' },
    { label: copy.invest, href: '/investir' },
    { label: copy.legal, href: '/cgv' },
  ] as const
}

function FooterContactCta({ locale }: { locale: InquiryLocale }) {
  const copy = FOOTER_COPY[locale]

  return (
    <section className="border-divider bg-sand border-t">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-gutter py-12 md:flex-row md:items-center md:justify-between md:px-gutter-md md:py-16">
        <div className="flex items-start gap-8 md:items-center">
          <span className="bg-signal mt-2 size-3 shrink-0 rounded-full shadow-[0_0_16px_rgba(120,255,71,0.85)] md:mt-0" />
          <div>
            <h2 className="text-coffee text-h4 font-medium tracking-[-0.24px]">
              {copy.ctaTitle}
            </h2>
            <p className="text-ash text-body-sm mt-2">
              {copy.ctaBody}
            </p>
          </div>
        </div>

        <Link
          href="/contact"
          className="bg-coffee text-cream text-body inline-flex h-14 w-fit items-center justify-center rounded-full px-10 transition-opacity hover:opacity-85"
        >
          {copy.ctaButton}
        </Link>
      </div>
    </section>
  )
}
