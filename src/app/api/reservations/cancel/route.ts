import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { getStripeServer } from '@/lib/stripe-server'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { updateInquiry } from '@/lib/inquiries-repository'
import { sendEmail } from '@/lib/resend-client'
import { translate } from '@/lib/i18n/email-dictionary'
import { formatCurrency } from '@/lib/formatters'
import CancellationConfirmedEmail from '@/emails/cancellation-confirmed'
import { type InquiryRow } from '@/types/inquiry'

const schema = z.object({
  guestyReservationId: z.string().min(1),
  email: z.email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('guesty_reservation_id', parsed.data.guestyReservationId)
      .maybeSingle()

    if (error) throw new Error(`read failed: ${error.message}`)
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    const inquiry = data as InquiryRow

    if (inquiry.guest.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
    }

    if (!['confirmed', 'pending'].includes(inquiry.status)) {
      return NextResponse.json(
        { error: `cannot_cancel_${inquiry.status}` },
        { status: 409 },
      )
    }

    let refundId: string | null = null
    let refundedAmount: string | null = null

    if (inquiry.status === 'confirmed' && inquiry.stripe_payment_intent_id) {
      const stripe = getStripeServer()
      const provider = await guestyClient.getPaymentProvider(inquiry.guesty_listing_id)
      const stripeAccountOption = provider.providerAccountId
        ? { stripeAccount: provider.providerAccountId }
        : undefined

      const refund = await stripe.refunds.create(
        { payment_intent: inquiry.stripe_payment_intent_id },
        stripeAccountOption,
      )
      refundId = refund.id
      refundedAmount = formatCurrency(inquiry.amount_cents, inquiry.currency, inquiry.locale)
    }

    await updateInquiry(inquiry.id, {
      status: refundId ? 'refunded' : 'canceled',
      stripe_refund_id: refundId,
      canceled_at: new Date().toISOString(),
    })

    try {
      await sendEmail({
        to: inquiry.guest.email,
        subject: translate(inquiry.locale, 'cancellation.subject'),
        react: CancellationConfirmedEmail({
          locale: inquiry.locale,
          guest: { firstName: inquiry.guest.firstName },
          listing: {
            title: (await guestyClient.getListing(inquiry.guesty_listing_id)).title ?? 'Alto',
          },
          refund: refundedAmount ? { amount: refundedAmount } : null,
        }),
      })
    } catch (emailError) {
      console.error('[cancel] mail send failed', emailError)
    }

    return NextResponse.json({ ok: true, status: refundId ? 'refunded' : 'canceled' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
