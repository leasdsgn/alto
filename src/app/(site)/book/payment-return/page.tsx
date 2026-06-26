import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { BookingAuthReturn } from '@/components/booking/booking-auth-return'

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
