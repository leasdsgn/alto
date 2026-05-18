import { loadStripe, type Stripe } from '@stripe/stripe-js'

const stripeCache = new Map<string, Promise<Stripe | null>>()

export function getStripeInstance(
  connectedAccountId: string | null,
): Promise<Stripe | null> {
  const cacheKey = connectedAccountId ?? '__default__'
  const cached = stripeCache.get(cacheKey)
  if (cached) return cached

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante')
  }

  const promise = loadStripe(
    publishableKey,
    connectedAccountId ? { stripeAccount: connectedAccountId } : undefined,
  )
  stripeCache.set(cacheKey, promise)
  return promise
}
