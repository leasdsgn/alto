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
      guesty_webhook_events: {
        Row: {
          svix_id: string
          event_name: string
          reservation_id: string | null
          created_at: string
        }
        Insert: {
          svix_id: string
          event_name: string
          reservation_id?: string | null
        }
        Update: {
          event_name?: string
          reservation_id?: string | null
        }
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
