create extension if not exists pgcrypto;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null default '' check (char_length(name) <= 120),
  phone text not null default '' check (char_length(phone) <= 32),
  email text not null default ''
    check (
      char_length(email) <= 254
      and (email = '' or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
    ),
  birthday date,
  anniversary date,
  status text not null default 'New'
    check (status in ('Active', 'New', 'Pending')),
  notes text not null default '' check (char_length(notes) <= 500),
  photo text check (photo is null or char_length(photo) <= 400000),
  activity jsonb not null default '[]'::jsonb
    check (jsonb_typeof(activity) = 'array'),
  joined_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_birthday_idx
  on public.customers (birthday)
  where birthday is not null;

create index customers_anniversary_idx
  on public.customers (anniversary)
  where anniversary is not null;

create index customers_status_name_idx
  on public.customers (status, name);

create or replace function public.set_customer_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger customers_set_updated_at
before update on public.customers
for each row
execute function public.set_customer_updated_at();

alter table public.customers enable row level security;

revoke all on table public.customers from anon, public;

grant insert (name, phone, email, birthday, anniversary, status, notes)
  on table public.customers to anon;
grant select, insert, update, delete on public.customers to authenticated;

create policy customers_public_registration
  on public.customers
  for insert
  to anon
  with check (
    status = 'New'
    and char_length(btrim(name)) between 2 and 120
    and char_length(btrim(phone)) between 1 and 32
    and char_length(btrim(email)) between 3 and 254
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and birthday is not null
    and birthday <= current_date
    and (anniversary is null or anniversary <= current_date)
  );

create policy customers_admin_access
  on public.customers
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
