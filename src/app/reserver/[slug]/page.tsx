import { notFound, redirect } from 'next/navigation'
import { getApartments } from '@/components/sections/apartments-section'
import { BookingFlow } from '@/components/booking/booking-flow'
import { guestyClient } from '@/lib/guesty-client'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ check_in?: string; check_out?: string; guests?: string; mode?: string }>
}

const DEFAULT_MODE: 'instant' | 'inquiry' = 'inquiry'

export default async function ReserverPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const search = await searchParams

  if (!search.check_in || !search.check_out) {
    redirect(`/appartements/${slug}`)
  }

  const apartments = await getApartments()
  const apartment = apartments.find((a) => a.slug === slug)
  if (!apartment) notFound()

  const guestsCount = Number(search.guests ?? 1)
  const mode: 'instant' | 'inquiry' =
    search.mode === 'instant' || search.mode === 'inquiry' ? search.mode : DEFAULT_MODE

  const quote = await guestyClient.createQuote(
    apartment.id,
    search.check_in,
    search.check_out,
    guestsCount,
  )

  const ratePlanId = quote.ratePlanId ?? ''
  const totalCents = Math.round(quote.rates.totalPrice * 100)
  const currency = quote.rates.currency?.toLowerCase() ?? 'eur'

  return (
    <>
      <Header variant="dark" />

      <main className="mx-auto max-w-[1132px] px-6 py-16 md:px-12 lg:px-0">
        <h1 className="text-coffee mb-10 text-3xl font-semibold md:text-4xl">
          Réserver {apartment.name}
        </h1>

        <BookingFlow
          listingId={apartment.id}
          listingTitle={apartment.name}
          checkIn={search.check_in}
          checkOut={search.check_out}
          guestsCount={guestsCount}
          quoteId={quote._id}
          ratePlanId={ratePlanId}
          amountCents={totalCents}
          currency={currency}
          mode={mode}
        />
      </main>

      <Footer />
    </>
  )
}
