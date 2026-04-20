import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'
import { getStripeServer } from '@/lib/stripe-server'

const schema = z.object({
  listingId: z.string().min(1),
  email: z.email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const { listingId, email } = parsed.data
    const stripe = getStripeServer()
    const provider = await guestyClient.getPaymentProvider(listingId)

    // En mode mock, aucun Connect account valide : on crée customer + SetupIntent
    // sur le compte Stripe principal (pas Connect), ce qui permet de tester le
    // flow de paiement bout-en-bout avec la test mode.
    const stripeAccountOption = provider.providerAccountId
      ? { stripeAccount: provider.providerAccountId }
      : undefined

    const customer = await stripe.customers.create({ email }, stripeAccountOption)

    const setupIntent = await stripe.setupIntents.create(
      {
        customer: customer.id,
        payment_method_types: ['card'],
        usage: 'off_session',
      },
      stripeAccountOption,
    )

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId: customer.id,
      connectedAccountId: provider.providerAccountId || null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
