import { NextResponse, type NextRequest } from 'next/server'
import { guestyClient } from '@/lib/guesty-client'
import { getSupabaseAdmin } from '@/lib/supabase-client'
import { sendEmail } from '@/lib/resend-client'
import { translate } from '@/lib/i18n/email-dictionary'
import PreArrivalEmail from '@/emails/pre-arrival'
import PostStayEmail from '@/emails/post-stay'
import { type InquiryRow } from '@/types/inquiry'

const PRE_ARRIVAL_DAYS_AHEAD = 3
const POST_STAY_DAYS_BEHIND = 1

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authorization !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await Promise.allSettled([sendPreArrivals(), sendPostStays()])

    const summary = {
      preArrival: formatResult(results[0]),
      postStay: formatResult(results[1]),
    }

    return NextResponse.json(summary)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function sendPreArrivals() {
  const supabase = getSupabaseAdmin()
  const target = todayPlusDays(PRE_ARRIVAL_DAYS_AHEAD)

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('status', 'confirmed')
    .is('pre_arrival_sent_at', null)
    .eq('check_in', target)

  if (error) throw new Error(`pre_arrival query failed: ${error.message}`)

  let sent = 0
  for (const row of data ?? []) {
    await sendPreArrival(row as InquiryRow)
    sent += 1
  }
  return sent
}

async function sendPostStays() {
  const supabase = getSupabaseAdmin()
  const target = todayPlusDays(-POST_STAY_DAYS_BEHIND)

  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .eq('status', 'confirmed')
    .is('post_stay_sent_at', null)
    .eq('check_out', target)

  if (error) throw new Error(`post_stay query failed: ${error.message}`)

  let sent = 0
  for (const row of data ?? []) {
    await sendPostStay(row as InquiryRow)
    sent += 1
  }
  return sent
}

async function sendPreArrival(row: InquiryRow) {
  const supabase = getSupabaseAdmin()

  try {
    const listing = await guestyClient.getListing(row.guesty_listing_id)

    await sendEmail({
      to: row.guest.email,
      subject: translate(row.locale, 'preArrival.subject'),
      react: PreArrivalEmail({
        locale: row.locale,
        guest: { firstName: row.guest.firstName },
        listing: {
          title: listing.title,
          address: listing.address?.full,
        },
      }),
    })

    await supabase
      .from('inquiries')
      .update({ pre_arrival_sent_at: new Date().toISOString() })
      .eq('id', row.id)
  } catch (error) {
    console.error('[cron pre_arrival] send failed', row.id, error)
  }
}

async function sendPostStay(row: InquiryRow) {
  const supabase = getSupabaseAdmin()

  try {
    const listing = await guestyClient.getListing(row.guesty_listing_id)

    await sendEmail({
      to: row.guest.email,
      subject: translate(row.locale, 'postStay.subject'),
      react: PostStayEmail({
        locale: row.locale,
        guest: { firstName: row.guest.firstName },
        listing: { title: listing.title },
      }),
    })

    await supabase
      .from('inquiries')
      .update({ post_stay_sent_at: new Date().toISOString() })
      .eq('id', row.id)
  } catch (error) {
    console.error('[cron post_stay] send failed', row.id, error)
  }
}

function todayPlusDays(days: number): string {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)
  now.setUTCDate(now.getUTCDate() + days)
  return now.toISOString().slice(0, 10)
}

function formatResult<T>(result: PromiseSettledResult<T>): { ok: boolean; value?: T; error?: string } {
  if (result.status === 'fulfilled') {
    return { ok: true, value: result.value }
  }
  return { ok: false, error: result.reason instanceof Error ? result.reason.message : String(result.reason) }
}

