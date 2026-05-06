import Link from 'next/link'
import Image from 'next/image'
import { getSiteImages } from '@/lib/storyblok-site-images'

const COL1 = [
  { label: 'Paris', href: '/appartements?city=paris' },
  { label: 'Lyon', href: '/appartements?city=lyon' },
]

const COL2 = [
  { label: 'Notre histoire', href: '/notre-histoire' },
  { label: 'Contact', href: '/contact' },
]

const COL3 = [
  { label: 'Politique de confidentialité', href: '/confidentialite' },
  { label: 'Conditions & Termes', href: '/cgv' },
  { label: 'Investir', href: '/investir' },
]

interface FooterProps {
  reserveStickyCtaSpace?: boolean | 'mobile'
}

export async function Footer({ reserveStickyCtaSpace = false }: FooterProps) {
  const siteImages = await getSiteImages()
  const bottomPadding = reserveStickyCtaSpace === true
    ? 'pb-56 md:pb-40'
    : reserveStickyCtaSpace === 'mobile'
      ? 'pb-56 md:pb-24'
      : 'pb-36 md:pb-24'

  return (
    <footer className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={siteImages.footerBackground}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className={`relative mx-auto max-w-content px-gutter pt-20 md:px-gutter-md ${bottomPadding}`}>
        <div className="flex items-start justify-between">
          <Image src="/images/logo-alto-light.png" alt="Alto" width={140} height={37} style={{ width: 140, height: 'auto' }} />

          <div className="flex items-center gap-5">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#fff8f0" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="5" stroke="#fff8f0" strokeWidth="1.5" />
                <circle cx="17.5" cy="6.5" r="1" fill="#fff8f0" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="12" height="24" viewBox="0 0 12 24" fill="#fff8f0">
                <path d="M7.5 13.5H10.5L12 8.5H7.5V6C7.5 4.97 7.5 4 9.5 4H12V0.14C11.622 0.097 10.362 0 8.962 0C6.038 0 4 1.657 4 4.7V8.5H0V13.5H4V24H7.5V13.5Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3">
          <nav className="flex flex-col gap-4">
            {COL1.map((link) => (
              <Link key={link.href} href={link.href} className="text-cream text-base font-normal leading-[18px]">
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-col gap-4">
            {COL2.map((link) => (
              <Link key={link.href} href={link.href} className="text-cream text-base font-normal leading-[18px]">
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-col gap-4">
            {COL3.map((link) => (
              <Link key={link.href} href={link.href} className="text-cream text-base font-normal leading-[18px]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="text-cream mt-16 text-base font-normal">©2026 - Alto</p>
      </div>
    </footer>
  )
}
