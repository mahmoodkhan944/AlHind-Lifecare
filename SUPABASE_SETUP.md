# Supabase setup

1. Create a project at https://supabase.com.
2. SQL Editor → New query → paste and run `supabase/schema.sql`.
3. Then run every file in `supabase/migrations/` in order
   (currently `001_security_fixes.sql`). Migrations are safe to re-run.
4. Project Settings → API → copy the Project URL and `anon` public key
   into `.env`:

       VITE_SUPABASE_URL=https://your-project-ref.supabase.co
       VITE_SUPABASE_ANON_KEY=your-anon-public-key

5. Authentication → URL Configuration → add your site domain to
   Site URL and Redirect URLs.
6. Register once through the app, then make yourself admin:

       update public.profiles set role = 'admin' where email = 'you@example.com';