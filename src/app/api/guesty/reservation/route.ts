import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { insertInquiry } from '@/lib/inquiries-repository'
import { sendEmail } from '@/lib/resend-client'
import { translate } from '@/lib/i18n/email-dictionary'
import { formatCurrency, formatDate, nightsBetween } from '@/lib/formatters'
import BookingConfirmationEmail from '@/emails/booking-confirmation'
import InquiryReceivedEmail from '@/emails/inquiry-received'
import { generateCancellationToken } from '@/lib/cancel-token'
import { toErrorResponse, parseGuestyError } from '@/lib/guesty-errors'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://alto-virid.vercel.app'

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
  ccToken: z.string().min(1),
})

const schema = z.discriminatedUnion('mode', [instantSchema, inquirySchema])

export async function POST(request: NextRequest) {
  let locale: 'fr' | 'en' = 'fr'

  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      locale = (body as { preferredLanguage?: 'fr' | 'en' })?.preferredLanguage ?? 'fr'
      const { body: errorBody, status } = toErrorResponse(
        new Error('{"error":{"code":"VALIDATION_FAILED"}}'),
        locale,
      )
      return NextResponse.json(
        { ...errorBody, issues: parsed.error.issues },
        { status },
      )
    }

    const data = parsed.data
    locale = data.preferredLanguage
    const nights = nightsBetween(data.checkIn, data.checkOut)
    const formattedTotal = formatCurrency(data.amountCents, data.currency, locale)
    const formattedCheckIn = formatDate(data.checkIn, locale)
    const formattedCheckOut = formatDate(data.checkOut, locale)

    const nowIso = new Date().toISOString()
    const guestyPolicy = {
      privacy: { accepted: data.policy.privacy, acceptedAt: nowIso },
      terms: { accepted: data.policy.terms, acceptedAt: nowIso },
    }

    if (data.mode === 'instant') {
      const reservation = await guestyClient.createInstantReservation({
        quoteId: data.quoteId,
        ratePlanId: data.ratePlanId,
        guest: data.guest,
        policy: guestyPolicy as unknown as typeof data.policy,
        ccToken: data.ccToken,
      })

      try {
        await insertInquiry({
          guesty_reservation_id: reservation._id,
          guesty_listing_id: data.listingId,
          listing_title: data.listingTitle,
          guest: data.guest,
          guests_count: data.guestsCount,
          check_in: data.checkIn,
          check_out: data.checkOut,
          amount_cents: data.amountCents,
          currency: data.currency,
          locale,
          status: 'confirmed',
          mode: 'instant',
        })
      } catch (insertError) {
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
            cancelUrl: buildCancellationUrl(reservation._id, data.guest.email),
          }),
        }),
      )

      return NextResponse.json(reservation)
    }

    const inquiry = await guestyClient.createInquiry({
      quoteId: data.quoteId,
      ratePlanId: data.ratePlanId,
      guest: data.guest,
      policy: guestyPolicy as unknown as typeof data.policy,
      ccToken: data.ccToken,
    })

    await insertInquiry({
      guesty_reservation_id: inquiry._id,
      guesty_listing_id: data.listingId,
      listing_title: data.listingTitle,
      guest: data.guest,
      guests_count: data.guestsCount,
      check_in: data.checkIn,
      check_out: data.checkOut,
      amount_cents: data.amountCents,
      currency: data.currency,
      locale,
      status: 'pending',
      mode: 'inquiry',
    })

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
    const { body, status } = toErrorResponse(error, locale)
    console.error('[reservation route] error', {
      code: parseGuestyError(error).code,
      rawMessage: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(body, { status })
  }
}

async function trySendEmail(send: () => Promise<unknown>) {
  try {
    await send()
  } catch (error) {
    console.error('[reservation route] email send failed', error)
  }
}

function buildCancellationUrl(reservationId: string, email: string): string {
  const token = generateCancellationToken({ reservationId, email })
  return `${SITE_URL}/annulation?token=${encodeURIComponent(token)}`
}
