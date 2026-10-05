revoke all on table public.customers from anon, public;

grant insert (name, phone, email, birthday, anniversary, status, notes)
  on table public.customers to anon;

grant select, insert, update, delete on table public.customers to authenticated;
