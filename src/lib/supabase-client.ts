import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { type InquiryInsert, type InquiryRow, type InquiryUpdate } from '@/types/inquiry'

export interface Database {
  public: {
    Tables: {
      inquiries: {
        Row: InquiryRow
        Insert: InquiryInsert
        Update: InquiryUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

let adminClient: SupabaseClient<Database> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis')
  }

  adminClient = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return adminClient
}
