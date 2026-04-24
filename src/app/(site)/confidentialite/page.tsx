import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Politique de confidentialité - Alto',
  description: 'Politique de confidentialité Alto.',
}

export default function ConfidentialitePage() {
  return (
    <>
      <Header variant="dark" />
      <main className="mx-auto w-full max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
        <div className="max-w-[720px]">
          <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Alto</p>
          <h1 className="text-coffee mt-3 text-2xl font-bold md:text-4xl">
            Politique de confidentialité
          </h1>
          <div className="text-coffee mt-10 space-y-6 text-sm leading-[1.8]">
            <p>
              Alto collecte uniquement les informations nécessaires au traitement des demandes de séjour, des réservations et des échanges avec les voyageurs.
            </p>
            <p>
              Les données peuvent inclure les informations de contact, les dates de séjour, les préférences liées à la réservation et les informations strictement utiles au suivi client.
            </p>
            <p>
              Pour toute demande d'accès, de correction ou de suppression des données, contactez Alto à l'adresse contact@alto-paris.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
