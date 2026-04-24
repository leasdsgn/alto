import { notFound, redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getApartments } from '@/components/sections/apartments-section'
import { BookingFlow } from '@/components/booking/booking-flow'
import { guestyClient } from '@/lib/guesty-client'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { parseGuestyError } from '@/lib/guesty-errors'
import { t } from '@/lib/i18n/booking-dictionary'
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n/locale'
import type { InquiryLocale } from '@/types/inquiry'
import type { GuestyQuote } from '@/types/guesty'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ check_in?: string; check_out?: string; guests?: string }>
}

const BOOKING_MODE = 'inquiry' as const

const getCachedQuote = unstable_cache(
  (listingId: string, checkIn: string, checkOut: string, guestsCount: number) =>
    guestyClient.createQuote(listingId, checkIn, checkOut, guestsCount),
  ['guesty-quote'],
  { revalidate: 60 },
)

export default async function ReserverPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const search = await searchParams

  if (!search.check_in || !search.check_out) {
    redirect(`/appartements/${slug}`)
  }

  const apartments = await getApartments()
  const apartment = apartments.find((a) => a.slug === slug)
  if (!apartment) notFound()

  const cookieStore = await cookies()
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  const guestsCount = Number(search.guests ?? 1)
  let availabilityError: Error | null = null

  try {
    const calendar = await guestyClient.getListingCalendar(
      apartment.id,
      search.check_in,
      search.check_out,
    )
    const checkOutDate = new Date(search.check_out)
    const nightUnavailable = calendar.days.some((day) => {
      const dayDate = new Date(day.date.slice(0, 10))
      if (dayDate >= checkOutDate) return false
      return day.status !== 'available'
    })
    if (nightUnavailable) {
      availabilityError = new Error('{"error":{"code":"LISTING_IS_NOT_AVAILABLE"}}')
    }
  } catch (error) {
    console.warn('[book page] availability precheck failed', error)
  }

  if (availabilityError) {
    return (
      <QuoteErrorView
        slug={slug}
        apartmentName={apartment.name}
        error={availabilityError}
        locale={locale}
      />
    )
  }

  let quote: GuestyQuote
  try {
    quote = await getCachedQuote(apartment.id, search.check_in, search.check_out, guestsCount)
  } catch (error) {
    return <QuoteErrorView slug={slug} apartmentName={apartment.name} error={error} locale={locale} />
  }

  const firstRatePlan = quote.rates.ratePlans[0]
  if (!firstRatePlan) {
    return <QuoteErrorView slug={slug} apartmentName={apartment.name} error={new Error('no_rate_plan')} locale={locale} />
  }

  const ratePlanId = firstRatePlan.ratePlan._id
  const totalCents = Math.round(firstRatePlan.ratePlan.money.subTotalPrice * 100)
  const currency = firstRatePlan.ratePlan.money.currency?.toLowerCase() ?? 'eur'

  return (
    <>
      <Header variant="dark" />

      <main className="mx-auto max-w-[1132px] px-6 py-16 md:px-12 lg:px-0">
        <h1 className="text-coffee mb-10 text-3xl font-semibold md:text-4xl">
          {locale === 'en' ? `Request to book ${apartment.name}` : `Demander à réserver ${apartment.name}`}
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
          mode={BOOKING_MODE}
        />
      </main>

      <Footer />
    </>
  )
}

function normalizeLocale(raw: string | undefined): InquiryLocale {
  return resolveLocale(raw ?? '')
}

function QuoteErrorView({
  slug,
  apartmentName,
  error,
  locale,
}: {
  slug: string
  apartmentName: string
  error: unknown
  locale: InquiryLocale
}) {
  const parsed = parseGuestyError(error)
  const title = t(locale, parsed.titleKey)
  const description = t(locale, parsed.descriptionKey)
  const backLabel = locale === 'en' ? 'Pick different dates' : 'Choisir d\'autres dates'

  console.warn('[reserver page] quote failed', { code: parsed.code, rawMessage: parsed.rawMessage })

  return (
    <>
      <Header variant="dark" />
      <main className="mx-auto max-w-[1132px] px-6 py-16 md:px-12 lg:px-0">
        <h1 className="text-coffee mb-4 text-3xl font-semibold md:text-4xl">{apartmentName}</h1>
        <div className="border-divider bg-cream rounded-lg border p-8">
          <p className="text-coffee text-lg font-semibold">{title}</p>
          <p className="text-taupe mt-3 text-sm">{description}</p>
          <Link
            href={`/appartements/${slug}`}
            className="bg-coffee text-cream hover:bg-coffee/90 mt-6 inline-block rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
          >
            {backLabel}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
