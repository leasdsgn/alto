import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { guestyClient } from '@/lib/guesty-client'

const schema = z.object({
  listingId: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = schema.safeParse(params)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }

    const data = await guestyClient.getPaymentProvider(parsed.data.listingId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[payment-provider] error', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
