'use client'

import { useEffect, useState } from 'react'
import { ApartmentBooking } from '@/components/apartment/booking'
import { MobileBookingBar } from '@/components/apartment/mobile-booking-bar'

interface ResponsiveBookingProps {
  price: number | null
  slug: string
  listingId?: string
  capacity?: number
  minNights?: number
  maxNights?: number
  initialShouldVerifyQuote?: boolean
}

export function ResponsiveBooking(props: ResponsiveBookingProps) {
  const isDesktop = useIsDesktop()

  if (isDesktop === null) return null

  return isDesktop ? <ApartmentBooking {...props} /> : <MobileBookingBar {...props} />
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(query.matches)

    sync()
    query.addEventListener('change', sync)

    return () => query.removeEventListener('change', sync)
  }, [])

  return isDesktop
}
