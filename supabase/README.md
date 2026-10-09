# Supabase setup

Customer registration and customer management use the `public.customers` table.
Supabase is the source of truth; `localStorage` only caches rows already saved
in the database.

## Create an administrator account

1. In the Supabase Dashboard, create an administrator user under **Authentication
   → Users** with the email `alchemistcafe@gmail.com` and a strong password.
   The account is not present yet; login will fail until you create it and
   confirm its email.
   The login page pre-fills this email; the password is managed by Supabase Auth
   and is not stored in frontend code.
2. In the Dashboard SQL Editor, assign the administrator role to that user's
   Auth metadata:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
     || '{"role":"admin"}'::jsonb
   where email = 'alchemistcafe@gmail.com'
   returning id, email, raw_app_meta_data ->> 'role' as role;
   ```

   Confirm that exactly one user was returned and its role is `admin`. If no
   row is returned, create the Auth user first. The role is stored in
   `app_metadata`, which the browser cannot edit. Sign in again after assigning
   the role so the new session token contains the admin claim.
3. Apply new database changes from the app folder with:

   ```powershell
   npx supabase db push
   ```

   This includes `20261009120000_allow_name_only_customer_registration.sql`,
   which updates the public registration policy and makes phone and email
   nullable, and `20261009124500_allow_future_registration_dates.sql`, which
   allows valid future dates of birth and anniversaries. Apply these migrations
   to the same Supabase project configured in `.env` for public registration to
   work as expected. The frontend will show a database-update message if a
   registration is rejected by row-level security; do not bypass RLS or use a
   service-role key in the browser.

Public registration only inserts new customers. Reading, editing, and deleting
customer records require signing in as a user whose `app_metadata.role` is
`admin`.
