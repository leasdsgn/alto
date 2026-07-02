import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BookingAuthReturn } from '@/components/booking/booking-auth-return'
import { defineSeoMetadata } from '@/lib/seo'

export function generateMetadata(): Metadata {
  return defineSeoMetadata({
    title: 'Retour paiement | Alto',
    description: 'Finalisation du paiement Alto.',
    path: '/book/payment-return',
    noIndex: true,
  })
}

export default function PaymentReturnPage() {
  return (
    <>
      <Header variant="dark" />

      <main className="mx-auto max-w-3xl px-6 pt-32 pb-16 md:px-12">
        <BookingAuthReturn />
      </main>

      <Footer />
    </>
  )
}
