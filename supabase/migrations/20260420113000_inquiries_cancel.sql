-- Ajoute les statuts 'canceled' et 'refunded' au check constraint pour supporter
-- le flow d'annulation initié par le guest depuis le site.

alter table public.inquiries
  drop constraint if exists inquiries_status_check;

alter table public.inquiries
  add constraint inquiries_status_check
  check (status in ('pending', 'confirmed', 'refused', 'expired', 'failed', 'canceled', 'refunded'));

alter table public.inquiries
  add column if not exists canceled_at timestamptz,
  add column if not exists stripe_refund_id text;
