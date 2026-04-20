-- Flow inquiry hybride : on stocke la résa créée en mode inquiry dans Guesty
-- avec le PaymentMethod Stripe tokenisé côté site, pour pouvoir capturer le
-- paiement automatiquement quand Alto valide la demande via le webhook Guesty.

create extension if not exists "pgcrypto";

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  guesty_reservation_id text not null unique,
  guesty_listing_id text not null,
  guest jsonb not null,
  stripe_payment_method_id text not null,
  stripe_customer_id text,
  check_in date not null,
  check_out date not null,
  amount_cents integer not null,
  currency text not null default 'eur',
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'refused', 'expired', 'failed')),
  stripe_payment_intent_id text,
  failure_reason text,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_inquiries_status on public.inquiries (status);
create index idx_inquiries_guesty_reservation on public.inquiries (guesty_reservation_id);
create index idx_inquiries_check_in on public.inquiries (check_in);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger inquiries_set_updated_at
before update on public.inquiries
for each row execute function public.set_updated_at();

alter table public.inquiries enable row level security;

-- Les accès se font via le service_role key côté back uniquement.
-- Aucun accès public (anon / authenticated) à cette table.
-- La policy ci-dessous ne laisse rien passer par défaut, le service_role bypass RLS.
create policy "no public access"
on public.inquiries
for all
to anon, authenticated
using (false)
with check (false);
