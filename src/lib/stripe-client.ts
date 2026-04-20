import { loadStripe, type Stripe } from '@stripe/stripe-js'

const stripeCache = new Map<string, Promise<Stripe | null>>()

export function getStripeInstance(connectedAccountId: string): Promise<Stripe | null> {
  const cached = stripeCache.get(connectedAccountId)
  if (cached) return cached

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante')
  }

  const promise = loadStripe(publishableKey, {
    stripeAccount: connectedAccountId,
  })

  stripeCache.set(connectedAccountId, promise)
  return promise
}
