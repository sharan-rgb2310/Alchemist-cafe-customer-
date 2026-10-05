revoke insert on public.customers from anon;

grant insert (name, phone, email, birthday, anniversary, status, notes)
  on public.customers to anon;
