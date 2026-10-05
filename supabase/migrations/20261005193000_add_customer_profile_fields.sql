alter table public.customers
  add column if not exists photo text
    check (photo is null or char_length(photo) <= 400000),
  add column if not exists activity jsonb not null default '[]'::jsonb
    check (jsonb_typeof(activity) = 'array');
