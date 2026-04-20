import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { verifyGuestySignature } from '@/lib/guesty-webhook'
import { getStripeServer } from '@/lib/stripe-server'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { sendEmail } from '@/lib/resend-client'
import { translate } from '@/lib/i18n/email-dictionary'
import { formatCurrency, formatDate } from '@/lib/formatters'
import InquiryConfirmedEmail from '@/emails/inquiry-confirmed'
import InquiryRefusedEmail from '@/emails/inquiry-refused'
import { type InquiryRow } from '@/types/inquiry'

const payloadSchema = z.object({
  event: z.string(),
  data: z
    .object({
      _id: z.string(),
      status: z.string().optional(),
      listingId: z.string().optional(),
    })
    .passthrough(),
})

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    if (!verifyGuestySignature(request.headers, rawBody)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const parsed = payloadSchema.safeParse(JSON.parse(rawBody))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { event, data } = parsed.data

    if (event !== 'reservation.updated' && event !== 'reservation.new') {
      return NextResponse.json({ ok: true, skipped: event })
    }

    await handleReservationStatus(data._id, data.status ?? null)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[webhooks/guesty] error', error)
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function handleReservationStatus(reservationId: string, status: string | null) {
  const supabase = getSupabaseAdmin()

  const { data: inquiry, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('guesty_reservation_id', reservationId)
    .eq('status', 'pending')
    .maybeSingle()

  if (error) {
    throw new Error(`Supabase read failed: ${error.message}`)
  }

  if (!inquiry) return

  if (status === 'confirmed' || status === 'reserved') {
    await confirmInquiry(inquiry)
    return
  }

  if (status === 'canceled' || status === 'declined') {
    await refuseInquiry(inquiry)
  }
}

async function confirmInquiry(inquiry: InquiryRow) {
  const supabase = getSupabaseAdmin()
  const stripe = getStripeServer()

  const provider = await guestyClient.getPaymentProvider(inquiry.guesty_listing_id)

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: inquiry.amount_cents,
        currency: inquiry.currency,
        payment_method: inquiry.stripe_payment_method_id,
        customer: inquiry.stripe_customer_id ?? undefined,
        off_session: true,
        confirm: true,
      },
      { stripeAccount: provider.providerAccountId },
    )

    await supabase
      .from('inquiries')
      .update({
        status: 'confirmed',
        stripe_payment_intent_id: paymentIntent.id,
        captured_at: new Date().toISOString(),
      })
      .eq('id', inquiry.id)

    await trySendInquiryConfirmed(inquiry)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Capture failed'
    await supabase
      .from('inquiries')
      .update({ status: 'failed', failure_reason: message })
      .eq('id', inquiry.id)
    throw error
  }
}

async function refuseInquiry(inquiry: InquiryRow) {
  const supabase = getSupabaseAdmin()

  await supabase.from('inquiries').update({ status: 'refused' }).eq('id', inquiry.id)

  try {
    await sendEmail({
      to: inquiry.guest.email,
      subject: translate(inquiry.locale, 'inquiryRefused.subject'),
      react: InquiryRefusedEmail({
        locale: inquiry.locale,
        guest: { firstName: inquiry.guest.firstName },
        listing: { title: await resolveListingTitle(inquiry.guesty_listing_id) },
      }),
    })
  } catch (error) {
    console.error('[webhooks/guesty] refused email failed', error)
  }
}

async function trySendInquiryConfirmed(inquiry: InquiryRow) {
  try {
    const listingTitle = await resolveListingTitle(inquiry.guesty_listing_id)
    const total = formatCurrency(inquiry.amount_cents, inquiry.currency, inquiry.locale)
    const checkIn = formatDate(inquiry.check_in, inquiry.locale)
    const checkOut = formatDate(inquiry.check_out, inquiry.locale)

    await sendEmail({
      to: inquiry.guest.email,
      subject: translate(inquiry.locale, 'inquiryConfirmed.subject'),
      react: InquiryConfirmedEmail({
        locale: inquiry.locale,
        guest: { firstName: inquiry.guest.firstName },
        listing: { title: listingTitle },
        reservation: {
          checkIn,
          checkOut,
          guests: 0,
          total,
        },
      }),
    })
  } catch (error) {
    console.error('[webhooks/guesty] confirmed email failed', error)
  }
}

async function resolveListingTitle(listingId: string): Promise<string> {
  try {
    const listing = await guestyClient.getListing(listingId)
    return listing.title ?? listing.nickname ?? 'Alto'
  } catch {
    return 'Alto'
  }
}
