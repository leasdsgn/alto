'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useFooterGlobals } from '@/components/providers/storyblok-globals-provider'

interface FooterProps {
  reserveStickyCtaSpace?: boolean | 'mobile'
}

export function Footer({ reserveStickyCtaSpace = false }: FooterProps) {
  const footer = useFooterGlobals()
  const bottomPadding =
    reserveStickyCtaSpace === true
      ? 'pb-28 md:pb-28'
      : reserveStickyCtaSpace === 'mobile'
        ? 'pb-28 md:pb-20'
        : 'pb-16 md:pb-20'

  return (
    <>
      <FooterContactCta />

      <footer
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #948174 0%, #625143 100%)' }}
      >
        <div className={`mx-auto max-w-content px-gutter pt-16 md:px-gutter-md ${bottomPadding}`}>
          <Link href="/" className="inline-flex" aria-label={footer.logoAriaLabel}>
            <Image
              src={footer.logo}
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
            aria-label={footer.navAriaLabel}
            className="flex flex-col gap-4 py-5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-6 md:gap-y-4"
          >
            {footer.navLinks.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                target={link.opensInNewTab ? '_blank' : undefined}
                rel={link.opensInNewTab ? 'noopener noreferrer' : undefined}
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
            {footer.copyright}
          </p>
        </div>
      </footer>
    </>
  )
}

function FooterContactCta() {
  const footer = useFooterGlobals()
  const cta = footer.ctaButton

  return (
    <section className="border-divider bg-sand border-t">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-gutter py-12 md:flex-row md:items-center md:justify-between md:px-gutter-md md:py-16">
        <div className="flex items-start gap-8 md:items-center">
          <span className="bg-signal mt-2 size-3 shrink-0 rounded-full shadow-[0_0_16px_rgba(120,255,71,0.85)] md:mt-0" />
          <div>
            <h2 className="text-coffee text-h4 font-medium tracking-[-0.24px]">{footer.ctaTitle}</h2>
            <p className="text-ash text-body-sm mt-2">{footer.ctaBody}</p>
          </div>
        </div>

        {cta && (
          <Link
            href={cta.href}
            target={cta.opensInNewTab ? '_blank' : undefined}
            rel={cta.opensInNewTab ? 'noopener noreferrer' : undefined}
            className="bg-coffee text-cream text-body inline-flex h-14 w-fit items-center justify-center rounded-full px-10 transition-opacity hover:opacity-85"
          >
            {cta.label}
          </Link>
        )}
      </div>
    </section>
  )
}
