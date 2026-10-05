drop policy if exists customers_public_registration on public.customers;

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
