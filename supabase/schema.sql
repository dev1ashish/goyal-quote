-- Computer Solution quotation app — run this once in the Supabase SQL Editor.
-- Each table stores the full record as JSONB; the app does the rest.

create table if not exists public.quotations (
  id bigint generated always as identity primary key,
  data jsonb not null,
  updated_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create table if not exists public.customers (
  id bigint generated always as identity primary key,
  data jsonb not null
);

create table if not exists public.products (
  id bigint generated always as identity primary key,
  data jsonb not null
);

create table if not exists public.settings (
  id text primary key,
  data jsonb not null
);

-- Lock everything down: RLS on, no policies. The anon key can do NOTHING;
-- the app talks to the database only through its own server with the
-- service-role key, behind the password page.
alter table public.quotations enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;
