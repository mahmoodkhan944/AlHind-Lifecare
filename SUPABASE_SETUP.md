# Supabase setup

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

## 4. Email auth (signup confirmation)

The app now uses Supabase's default link-based "Confirm signup" email — no
template changes needed, so this works out of the box even without custom
SMTP. After signup, the user gets an email with a confirmation link; clicking
it redirects back into the app already signed in.

1. Go to **Authentication → Providers → Email** and make sure "Confirm email"
   is turned on.

If you'd rather send a 6-digit OTP code instead of a link, that requires
custom SMTP (Supabase's default email service doesn't allow editing
templates) — set that up under **Project Settings → Authentication → SMTP
Settings**, then edit **Authentication → Email Templates → Confirm signup**
to use `{{ .Token }}`, and switch the Register page back to the OTP flow.

Password-reset emails (Forgot Password page) already use the default link-based
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