import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CancelReservationCard } from '@/components/booking/cancel-reservation-card'
import { findInquiryByReservation } from '@/lib/inquiries-repository'
import { verifyCancellationToken } from '@/lib/cancel-token'
import { formatDate } from '@/lib/formatters'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function AnnulationPage({ searchParams }: PageProps) {
  const search = await searchParams

  let state:
    | { type: 'valid'; token: string; listingTitle: string; checkIn: string; checkOut: string; status: string }
    | { type: 'error'; title: string; body: string }

  if (!search.token) {
    state = {
      type: 'error',
      title: 'Lien invalide',
      body: 'Le lien d’annulation est incomplet. Utilisez le lien présent dans votre email de confirmation.',
    }
  } else {
    try {
      const payload = verifyCancellationToken(search.token)
      const inquiry = await findInquiryByReservation(payload.reservationId)

      if (!inquiry || inquiry.guest.email.toLowerCase() !== payload.email.toLowerCase()) {
        state = {
          type: 'error',
          title: 'Réservation introuvable',
          body: 'Nous n’avons pas retrouvé de réservation correspondant à ce lien.',
        }
      } else {
        state = {
          type: 'valid',
          token: search.token,
          listingTitle: inquiry.listing_title,
          checkIn: formatDate(inquiry.check_in, inquiry.locale),
          checkOut: formatDate(inquiry.check_out, inquiry.locale),
          status: inquiry.status,
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'invalid_token'
      state =
        message === 'expired_token'
          ? {
              type: 'error',
              title: 'Lien expiré',
              body: 'Le lien d’annulation a expiré. Contactez Alto si vous devez encore annuler votre séjour.',
            }
          : {
              type: 'error',
              title: 'Lien invalide',
              body: 'Ce lien d’annulation n’est plus valide.',
            }
    }
  }

  return (
    <>
      <Header variant="dark" />

      <main className="mx-auto max-w-[860px] px-6 py-16 md:px-12 lg:px-0">
        {state.type === 'valid' ? (
          <CancelReservationCard
            token={state.token}
            listingTitle={state.listingTitle}
            checkIn={state.checkIn}
            checkOut={state.checkOut}
            status={state.status}
          />
        ) : (
          <div className="border-divider bg-cream rounded-2xl border p-8">
            <h1 className="text-coffee text-3xl font-semibold">{state.title}</h1>
            <p className="text-taupe mt-4 text-sm leading-relaxed">{state.body}</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
