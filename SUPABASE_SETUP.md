# Supabase setup

This project no longer talks to Base44. It now uses Supabase for the database,
auth, and file storage. Follow these steps once to get it running.

## 1. Create a Supabase project

1. Go to https://supabase.com/dashboard and sign in (or sign up — free tier is fine).
2. Click **New project**. Pick an org, name it (e.g. `alhind-medical-care`), set a
   database password (save it somewhere), pick a region close to your users.
3. Wait ~2 minutes for it to provision.

## 2. Get your API keys

1. In your project, go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. Open `.env` in this project and fill them in:

   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

   Never use the `service_role` key in this file — it's a full-access secret key
   and must never ship in frontend code.

## 3. Run the database schema

1. In Supabase, go to **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this project, paste the whole thing in, and click **Run**.
3. This creates all 11 tables (doctors, hospitals, treatments, blog_posts,
   testimonials, faqs, site_settings, leads, appointments, quotes,
   newsletter_subscribers), a `profiles` table for user roles, row-level
   security policies, and a public `uploads` storage bucket.

## 4. Configure email auth (signup OTP code)

The Register page shows a 6-digit code step after signup, so Supabase's signup
confirmation email needs to send a code instead of its default link.

1. Go to **Authentication → Email Templates → Confirm signup**.
2. Replace the template body so it includes `{{ .Token }}` (the 6-digit code)
   instead of `{{ .ConfirmationURL }}`. Supabase's docs have a ready-made OTP
   template you can paste in: https://supabase.com/docs/guides/auth/auth-email-templates
3. Go to **Authentication → Providers → Email** and make sure "Confirm email"
   is turned on.

Password-reset emails (Forgot Password page) use the default link-based
template — no change needed there.

## 5. Enable Google login (optional)

1. Go to **Authentication → Providers → Google** and toggle it on.
2. You'll need a Google OAuth Client ID/Secret from
   https://console.cloud.google.com/apis/credentials — set the authorized
   redirect URI to the value Supabase shows you on that same page.
3. Paste the Client ID/Secret into the Supabase provider settings and save.

## 6. Create your admin account

New signups default to the `user` role. To make yourself an admin:

1. Sign up normally through the app (`/register`), or through
   **Authentication → Users → Add user** in the Supabase dashboard.
2. In **SQL Editor**, run:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

3. Log out and back in — you should now be able to reach `/admin`.

## 7. Install and run

```bash
npm install
npm run dev
```

## Notes / things worth knowing

- **Logo** is loaded from `alhindlifecare.com` via the shared `LOGO_URL` constant
  in `src/lib/brand-assets.js` (used by Navbar, Footer, and AdminLayout). If you'd
  rather self-host it, re-upload the file through the admin panel (it'll land in
  your Supabase `uploads` bucket) and swap the URL in that one file.
- **Row-level security** is doing the real access control: anyone can read
  public content (doctors, hospitals, etc.), anyone can submit a lead/appointment/quote/
  newsletter signup, but only logged-in admins can read or edit that PII or
  change site content. The `/admin` routes are also now gated client-side, but
  RLS is what actually protects the data even if someone bypasses the UI.
