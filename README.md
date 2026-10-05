# Alchemist Café Customer Portal

A React and Vite customer registration and café administration app backed by
Supabase.

## Local development

1. Install Node.js and npm.
2. Install dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in the Supabase project URL and
   publishable key.
4. Start the development server:

   ```sh
   npm run dev
   ```

## Production build

```sh
npm run build
npm run preview
```

The production output is written to `dist/`.

## Supabase

Customer registrations and admin customer management use the `public.customers`
table. Apply database migrations from this directory with:

```sh
npx supabase db push
```

Create an administrator in Supabase Auth and assign the `admin` role to the
user's `app_metadata`. See [supabase/README.md](./supabase/README.md) for setup
instructions.

## Vercel

Import this project using the `alchemist-cafe` directory as the project root.
Vercel uses `npm run build` and `dist` by default. Add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as project environment
variables. The included `vercel.json` rewrites client-side routes to the React
app entry point.

Never commit `.env`, Supabase service-role keys, or other secrets.
