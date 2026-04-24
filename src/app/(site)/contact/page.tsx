import Image from 'next/image'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function ContactPage() {
  return (
    <>
      <div className="relative h-[442px] overflow-hidden">
        <Image
          src="/images/alto-salon.jpg"
          alt="Contactez-nous"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-coffee/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-coffee/75 to-transparent" />

        <Header />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-content px-gutter pb-10 md:px-gutter-md">
            <h1 className="text-cream text-base font-bold leading-[18px]">Contact</h1>
            <p className="text-cream/80 mt-3 max-w-[505px] text-xs font-medium leading-[20px]">
              Une question, un projet d'investissement, une réservation ? Écrivez-nous.
            </p>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-content px-gutter py-section md:px-gutter-md">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_304px]">
          <div>
            <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Formulaire</p>
            <h2 className="text-coffee mt-1 text-base font-medium leading-[24px]">Envoyez-nous un message</h2>

            <form className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="text-coffee text-xs font-bold tracking-[0.24px]">
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="border-divider text-coffee placeholder:text-taupe mt-2 block w-full rounded-sm border bg-transparent px-4 py-3 text-xs font-medium outline-none focus:border-coffee"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-coffee text-xs font-bold tracking-[0.24px]">
                    Nom
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="border-divider text-coffee placeholder:text-taupe mt-2 block w-full rounded-sm border bg-transparent px-4 py-3 text-xs font-medium outline-none focus:border-coffee"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="text-coffee text-xs font-bold tracking-[0.24px]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="border-divider text-coffee placeholder:text-taupe mt-2 block w-full rounded-sm border bg-transparent px-4 py-3 text-xs font-medium outline-none focus:border-coffee"
                />
              </div>

              <div>
                <label htmlFor="subject" className="text-coffee text-xs font-bold tracking-[0.24px]">
                  Sujet
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="border-divider text-coffee mt-2 block w-full rounded-sm border bg-transparent px-4 py-3 text-xs font-medium outline-none focus:border-coffee"
                >
                  <option value="reservation">Réservation</option>
                  <option value="investissement">Investissement</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="text-coffee text-xs font-bold tracking-[0.24px]">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="border-divider text-coffee placeholder:text-taupe mt-2 block w-full resize-none rounded-sm border bg-transparent px-4 py-3 text-xs font-medium leading-[22px] outline-none focus:border-coffee"
                />
              </div>

              <button
                type="submit"
                className="bg-coffee text-cream btn-fill rounded-sm px-8 py-3 text-xs font-bold tracking-[0.24px]"
              >
                Envoyer
              </button>
            </form>
          </div>

          <aside className="space-y-8">
            <div>
              <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Email</p>
              <a href="mailto:contact@alto-paris.com" className="text-coffee mt-2 block text-sm font-medium">
                contact@alto-paris.com
              </a>
            </div>

            <div>
              <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Telephone</p>
              <a href="tel:+33100000000" className="text-coffee mt-2 block text-sm font-medium">
                +33 1 00 00 00 00
              </a>
            </div>

            <div>
              <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Adresse</p>
              <p className="text-coffee mt-2 text-sm font-medium leading-[1.6]">
                Paris, France
              </p>
            </div>

            <div>
              <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Reseaux</p>
              <div className="mt-3 flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-coffee">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-coffee">
                  <svg width="12" height="20" viewBox="0 0 12 24" fill="currentColor">
                    <path d="M7.5 13.5H10.5L12 8.5H7.5V6C7.5 4.97 7.5 4 9.5 4H12V0.14C11.622 0.097 10.362 0 8.962 0C6.038 0 4 1.657 4 4.7V8.5H0V13.5H4V24H7.5V13.5Z" />
                  </svg>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  )
}
