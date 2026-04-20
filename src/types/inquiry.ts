export type InquiryLocale = 'fr' | 'en'

export type InquiryStatus = 'pending' | 'confirmed' | 'refused' | 'expired' | 'failed'

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
  guest: InquiryGuest
  stripe_payment_method_id: string | null
  stripe_customer_id: string | null
  check_in: string
  check_out: string
  amount_cents: number
  currency: string
  locale: InquiryLocale
  status: InquiryStatus
  mode: InquiryMode
  stripe_payment_intent_id: string | null
  failure_reason: string | null
  captured_at: string | null
  pre_arrival_sent_at: string | null
  post_stay_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface InquiryInsert {
  guesty_reservation_id: string
  guesty_listing_id: string
  guest: InquiryGuest
  stripe_payment_method_id?: string | null
  stripe_customer_id?: string | null
  check_in: string
  check_out: string
  amount_cents: number
  currency?: string
  locale: InquiryLocale
  status?: InquiryStatus
  mode: InquiryMode
}

export interface InquiryUpdate {
  status?: InquiryStatus
  stripe_payment_intent_id?: string | null
  failure_reason?: string | null
  captured_at?: string | null
  pre_arrival_sent_at?: string | null
  post_stay_sent_at?: string | null
}
