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

Public registration only inserts new customers. Reading, editing, and deleting
customer records require signing in as a user whose `app_metadata.role` is
`admin`.
