import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { getStripe } from '@/lib/stripe'
import { guestyClient } from '@/lib/guesty-client'

const schema = z.object({
  listingId: z.string().min(1),
  quoteId: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  guestsCount: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { listingId, quoteId, checkIn, checkOut, guestsCount } = parsed.data

    const quote = await guestyClient.createQuote(listingId, checkIn, checkOut, guestsCount)

    if (quote._id !== quoteId) {
      return NextResponse.json({ error: 'Quote invalide' }, { status: 400 })
    }

    const amount = Math.round(quote.rates.totalPrice * 100)
    const currency = quote.rates.currency.toLowerCase()

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency,
      metadata: { listingId, quoteId },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: quote.rates.totalPrice,
      currency: quote.rates.currency,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
