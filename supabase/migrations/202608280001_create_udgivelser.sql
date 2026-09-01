-- Opretter Supabase-tabellen til udgivelser samt reglerne for offentlig read-only-adgang.
-- Filen bruges til at genskabe den samme databasestruktur og RLS-sikkerhed i et nyt projekt.

create extension if not exists pgcrypto;

create table if not exists public.udgivelser (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug) and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  titel text not null,
  forfatter text not null,
  forfatter_beskrivelse text,
  forfatter_kilde text,
  oversaetter text,
  oversaetter_beskrivelse text,
  kort_beskrivelse text not null,
  beskrivelse text not null,
  kontekst text,
  format_og_materialer text,
  isbn text check (isbn is null or isbn ~ '^[0-9]{13}$'),
  sidetal integer check (sidetal is null or sidetal > 0),
  format_bind text,
  sprog text,
  dansk_udgivelsesaar smallint check (dansk_udgivelsesaar is null or dansk_udgivelsesaar between 1900 and 2200),
  originaludgivelsesaar text,
  originaltitel text,
  forside_sti text not null,
  forside_alt text not null,
  detaljebilleder jsonb not null default '[]'::jsonb check (jsonb_typeof(detaljebilleder) = 'array'),
  anmeldelser jsonb not null default '[]'::jsonb check (jsonb_typeof(anmeldelser) = 'array'),
  udgivelsesdato date,
  status text not null default 'kommende' check (status in ('kommende', 'udkommet')),
  fremhaevet boolean not null default false,
  eksterne_links jsonb not null default '[]'::jsonb check (jsonb_typeof(eksterne_links) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.udgivelser is 'Kokons eneste dynamiske indholdstype før freeze.';

alter table public.udgivelser enable row level security;

revoke all on table public.udgivelser from anon, authenticated;
grant select on table public.udgivelser to anon;

drop policy if exists "Offentlig laeseadgang til udgivelser" on public.udgivelser;
create policy "Offentlig laeseadgang til udgivelser"
  on public.udgivelser
  for select
  to anon
  using (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_udgivelser_updated_at on public.udgivelser;
create trigger set_udgivelser_updated_at
before update on public.udgivelser
for each row execute function public.set_updated_at();
