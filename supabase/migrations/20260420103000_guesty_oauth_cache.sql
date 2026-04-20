-- Cache partagé du token OAuth Guesty BEAPI pour éviter de dépasser le rate
-- limit /oauth2/token quand Vercel démarre plusieurs instances serverless en
-- parallèle. Le cache globalThis seul ne marche pas : chaque cold start = nouveau
-- processus = nouvelle demande de token.

create table if not exists public.guesty_oauth_cache (
  id text primary key,
  access_token text not null,
  expires_at timestamptz not null,
  rate_limited_until timestamptz,
  updated_at timestamptz not null default now()
);

drop trigger if exists guesty_oauth_cache_set_updated_at on public.guesty_oauth_cache;
create trigger guesty_oauth_cache_set_updated_at
before update on public.guesty_oauth_cache
for each row execute function public.set_updated_at();

alter table public.guesty_oauth_cache enable row level security;

drop policy if exists "no public access" on public.guesty_oauth_cache;
create policy "no public access"
on public.guesty_oauth_cache
for all
to anon, authenticated
using (false)
with check (false);
