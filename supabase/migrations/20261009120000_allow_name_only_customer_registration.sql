alter table public.customers
  alter column phone drop not null,
  alter column email drop not null;

drop policy if exists customers_public_registration on public.customers;

create policy customers_public_registration
  on public.customers
  for insert
  to anon
  with check (
    status = 'New'
    and char_length(btrim(name)) between 1 and 120
    and (
      phone is null
      or btrim(phone) = ''
      or (
        char_length(btrim(phone)) <= 32
        and btrim(phone) ~ '^(\+91[\s-]?)?[6-9][0-9]{4}[\s-]?[0-9]{5}$'
      )
    )
    and (
      email is null
      or btrim(email) = ''
      or (
        char_length(btrim(email)) <= 254
        and btrim(email) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    )
    and (birthday is null or birthday <= current_date)
    and (anniversary is null or anniversary <= current_date)
  );
