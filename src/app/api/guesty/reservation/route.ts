import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { sendEmail } from '@/lib/resend-client'
import { translate } from '@/lib/i18n/email-dictionary'
import { formatCurrency, formatDate, nightsBetween } from '@/lib/formatters'
import BookingConfirmationEmail from '@/emails/booking-confirmation'
import InquiryReceivedEmail from '@/emails/inquiry-received'

const guestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
})

const policySchema = z.object({
  privacy: z.literal(true),
  terms: z.literal(true),
})

const baseSchema = z.object({
  quoteId: z.string().min(1),
  ratePlanId: z.string().min(1),
  listingId: z.string().min(1),
  listingTitle: z.string().min(1),
  guest: guestSchema,
  policy: policySchema,
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  guestsCount: z.number().int().positive(),
  amountCents: z.number().int().positive(),
  currency: z.string().min(1),
  preferredLanguage: z.enum(['fr', 'en']).default('fr'),
})

const instantSchema = baseSchema.extend({
  mode: z.literal('instant'),
  ccToken: z.string().min(1),
})

const inquirySchema = baseSchema.extend({
  mode: z.literal('inquiry'),
  stripePaymentMethodId: z.string().min(1),
  stripeCustomerId: z.string().optional(),
})

const schema = z.discriminatedUnion('mode', [instantSchema, inquirySchema])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const data = parsed.data
    const locale = data.preferredLanguage
    const nights = nightsBetween(data.checkIn, data.checkOut)
    const formattedTotal = formatCurrency(data.amountCents, data.currency, locale)
    const formattedCheckIn = formatDate(data.checkIn, locale)
    const formattedCheckOut = formatDate(data.checkOut, locale)

    const supabase = getSupabaseAdmin()

    if (data.mode === 'instant') {
      const reservation = await guestyClient.createInstantReservation({
        quoteId: data.quoteId,
        ratePlanId: data.ratePlanId,
        guest: data.guest,
        policy: data.policy,
        ccToken: data.ccToken,
      })

      const { error: insertError } = await supabase.from('inquiries').insert({
        guesty_reservation_id: reservation._id,
        guesty_listing_id: data.listingId,
        guest: data.guest,
        stripe_payment_method_id: null,
        stripe_customer_id: null,
        check_in: data.checkIn,
        check_out: data.checkOut,
        amount_cents: data.amountCents,
        currency: data.currency,
        locale,
        status: 'confirmed',
        mode: 'instant',
      })

      if (insertError) {
        console.error('[reservation route] instant insert failed', insertError)
      }

      await trySendEmail(() =>
        sendEmail({
          to: data.guest.email,
          subject: translate(locale, 'confirmation.subject'),
          react: BookingConfirmationEmail({
            locale,
            guest: { firstName: data.guest.firstName },
            listing: { title: data.listingTitle },
            reservation: {
              checkIn: formattedCheckIn,
              checkOut: formattedCheckOut,
              guests: data.guestsCount,
              nights,
              total: formattedTotal,
            },
          }),
        }),
      )

      return NextResponse.json(reservation)
    }

    const inquiry = await guestyClient.createInquiry({
      quoteId: data.quoteId,
      ratePlanId: data.ratePlanId,
      guest: data.guest,
      policy: data.policy,
    })

    const { error: insertError } = await supabase.from('inquiries').insert({
      guesty_reservation_id: inquiry._id,
      guesty_listing_id: data.listingId,
      guest: data.guest,
      stripe_payment_method_id: data.stripePaymentMethodId,
      stripe_customer_id: data.stripeCustomerId ?? null,
      check_in: data.checkIn,
      check_out: data.checkOut,
      amount_cents: data.amountCents,
      currency: data.currency,
      locale,
      status: 'pending',
      mode: 'inquiry',
    })

    if (insertError) {
      throw new Error(`Supabase insert failed: ${insertError.message}`)
    }

    await trySendEmail(() =>
      sendEmail({
        to: data.guest.email,
        subject: translate(locale, 'inquiryReceived.subject'),
        react: InquiryReceivedEmail({
          locale,
          guest: { firstName: data.guest.firstName },
          listing: { title: data.listingTitle },
          reservation: {
            checkIn: formattedCheckIn,
            checkOut: formattedCheckOut,
            guests: data.guestsCount,
            estimatedTotal: formattedTotal,
          },
        }),
      }),
    )

    return NextResponse.json(inquiry)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function trySendEmail(send: () => Promise<unknown>) {
  try {
    await send()
  } catch (error) {
    console.error('[reservation route] email send failed', error)
  }
}
