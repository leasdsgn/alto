import { getSupabaseAdmin } from './supabase-client'
import {
  type InquiryInsert,
  type InquiryRow,
  type InquiryStatus,
  type InquiryUpdate,
} from '@/types/inquiry'

export async function insertInquiry(payload: InquiryInsert): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('inquiries').insert(payload as never)
  if (error) throw new Error(`insertInquiry failed: ${error.message}`)
}

export async function updateInquiry(id: string, patch: InquiryUpdate): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('inquiries')
    .update(patch as never)
    .eq('id', id)
  if (error) throw new Error(`updateInquiry failed: ${error.message}`)
}

export async function findPendingInquiryByReservation(
  reservationId: string,
): Promise<InquiryRow | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('guesty_reservation_id', reservationId)
    .eq('status', 'pending')
    .maybeSingle()

  if (error) throw new Error(`findPendingInquiryByReservation failed: ${error.message}`)
  return (data as InquiryRow | null) ?? null
}

interface FindByDateArgs {
  status: InquiryStatus
  column: 'check_in' | 'check_out'
  date: string
  missingEmailColumn: 'pre_arrival_sent_at' | 'post_stay_sent_at'
}

export async function findReservationsForEmail(args: FindByDateArgs): Promise<InquiryRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('status', args.status)
    .eq(args.column, args.date)
    .is(args.missingEmailColumn, null)

  if (error) throw new Error(`findReservationsForEmail failed: ${error.message}`)
  return (data as InquiryRow[] | null) ?? []
}
