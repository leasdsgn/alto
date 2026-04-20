-- Extension de la table inquiries pour tracker aussi les résas instant
-- (confirmées direct) et les mails transactionnels envoyés à des moments
-- précis du cycle (J-3 avant check-in, J+1 après check-out).

alter table public.inquiries
  add column if not exists mode text not null default 'inquiry'
    check (mode in ('instant', 'inquiry')),
  add column if not exists pre_arrival_sent_at timestamptz,
  add column if not exists post_stay_sent_at timestamptz;

-- Le PaymentMethod n'est plus requis pour les résas instant (Guesty charge
-- directement via son Stripe Connect, pas besoin de le stocker). On relâche
-- la contrainte NOT NULL.
alter table public.inquiries
  alter column stripe_payment_method_id drop not null;

create index if not exists idx_inquiries_mode_status on public.inquiries (mode, status);
create index if not exists idx_inquiries_check_out on public.inquiries (check_out);
