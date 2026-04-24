alter table public.inquiries
  add column if not exists listing_title text not null default 'Alto',
  add column if not exists guests_count integer not null default 1,
  add column if not exists canceled_at timestamptz;

alter table public.inquiries
  drop constraint if exists inquiries_status_check;

alter table public.inquiries
  add constraint inquiries_status_check
  check (status in ('pending', 'confirmed', 'refused', 'expired', 'failed', 'canceled', 'refunded'));

alter table public.inquiries
  drop column if exists stripe_payment_method_id,
  drop column if exists stripe_customer_id,
  drop column if exists stripe_payment_intent_id,
  drop column if exists failure_reason,
  drop column if exists captured_at,
  drop column if exists stripe_refund_id;

create table if not exists public.guesty_webhook_events (
  svix_id text primary key,
  event_name text not null,
  reservation_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_guesty_webhook_events_reservation_id
  on public.guesty_webhook_events (reservation_id);

alter table public.guesty_webhook_events enable row level security;

drop policy if exists "no public access" on public.guesty_webhook_events;
create policy "no public access"
on public.guesty_webhook_events
for all
to anon, authenticated
using (false)
with check (false);
