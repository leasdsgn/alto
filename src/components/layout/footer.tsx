'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useFooterGlobals } from '@/components/providers/storyblok-globals-provider'

interface FooterProps {
  reserveStickyCtaSpace?: boolean | 'mobile'
}

const WHATSAPP_MESSAGE = "Bonjour, je souhaite contacter Alto au sujet d'un séjour."
const WHATSAPP_PHONE_NUMBER = '33617222098'
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
const WHATSAPP_BUTTON_IMAGE = '/images/icons/whatsapp-button-white-medium.png'

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

        <Link
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ouvrir une conversation WhatsApp avec Alto"
          className="inline-flex w-fit transition-opacity hover:opacity-85"
        >
          <Image
            src={WHATSAPP_BUTTON_IMAGE}
            alt="Chat on WhatsApp"
            width={378}
            height={80}
            className="h-12 w-auto md:h-14"
          />
        </Link>
      </div>
    </section>
  )
}
