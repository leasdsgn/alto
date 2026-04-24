import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Conditions et termes - Alto',
  description: 'Conditions de réservation Alto.',
}

export default function CgvPage() {
  return (
    <>
      <Header variant="dark" />
      <main className="mx-auto w-full max-w-content px-gutter py-section md:px-gutter-md md:py-section-md">
        <div className="max-w-[720px]">
          <p className="text-silver text-xs font-bold uppercase tracking-[0.24px]">Alto</p>
          <h1 className="text-coffee mt-3 text-2xl font-bold md:text-4xl">
            Conditions et termes
          </h1>
          <div className="text-coffee mt-10 space-y-6 text-sm leading-[1.8]">
            <p>
              Les réservations Alto sont soumises aux disponibilités, aux tarifs affichés au moment de la demande et aux conditions associées à chaque logement.
            </p>
            <p>
              Toute demande peut nécessiter une validation manuelle avant confirmation définitive. Les conditions d'annulation et de remboursement sont communiquées pendant le parcours de réservation.
            </p>
            <p>
              Pour toute question liée à une réservation, contactez Alto à l'adresse contact@alto-paris.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
