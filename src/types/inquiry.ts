export type InquiryLocale = 'fr' | 'en'

export type InquiryStatus =
  | 'pending'
  | 'confirmed'
  | 'refused'
  | 'expired'
  | 'failed'
  | 'canceled'
  | 'refunded'

export type InquiryMode = 'instant' | 'inquiry'

export interface InquiryGuest {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface InquiryRow {
  id: string
  guesty_reservation_id: string
  guesty_listing_id: string
  listing_title: string
  guest: InquiryGuest
  guests_count: number
  check_in: string
  check_out: string
  amount_cents: number
  currency: string
  locale: InquiryLocale
  status: InquiryStatus
  mode: InquiryMode
  pre_arrival_sent_at: string | null
  post_stay_sent_at: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface InquiryInsert {
  guesty_reservation_id: string
  guesty_listing_id: string
  listing_title: string
  guest: InquiryGuest
  guests_count: number
  check_in: string
  check_out: string
  amount_cents: number
  currency: string
  locale: InquiryLocale
  status?: InquiryStatus
  mode: InquiryMode
}

export interface InquiryUpdate {
  status?: InquiryStatus
  listing_title?: string
  guests_count?: number
  pre_arrival_sent_at?: string | null
  post_stay_sent_at?: string | null
  canceled_at?: string | null
}
