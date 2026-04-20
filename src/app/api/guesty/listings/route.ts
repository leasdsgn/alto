import { NextResponse } from 'next/server'
import { guestyClient } from '@/lib/guesty-client'

function sanitizeListing(listing: Record<string, unknown>) {
  return {
    _id: listing._id,
    title: listing.title,
    nickname: listing.nickname,
    address: listing.address,
    pictures: listing.pictures,
    accommodates: listing.accommodates,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    amenities: listing.amenities,
    publicDescription: listing.publicDescription,
    prices: listing.prices,
    minNights: listing.minNights,
    maxNights: listing.maxNights,
  }
}

export async function GET() {
  try {
    const data = await guestyClient.getListings()
    return NextResponse.json({
      results: data.results.map((l) => sanitizeListing(l as unknown as Record<string, unknown>)),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
