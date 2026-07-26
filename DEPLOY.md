# Running in VS Code and deploying to a server

## 1. Open the project in VS Code

1. Unzip the project, then in VS Code: **File → Open Folder…** and select the
   `AlHind` folder.
2. Install recommended extensions when prompted (or manually: **ESLint**,
   **Tailwind CSS IntelliSense**). Not required, just nice to have.
3. Open a terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``).

## 2. Install and configure

```bash
npm install
cp .env.example .env
```

Fill in `.env` with your Supabase project's URL and anon key (see
`SUPABASE_SETUP.md` if you haven't created the project yet):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run it

```bash
npm run dev
```

Vite prints a local URL (default `http://localhost:5173`). Use VS Code's
built-in debugger or just your browser — either works, this is a static SPA.

## 4. Build for production

```bash
npm run build
```

This produces a `dist/` folder: plain HTML/CSS/JS, no server-side code
required. That's the only thing that needs to reach your server.

You can sanity-check the build locally before deploying:

```bash
npx serve dist
```

## 5. Deploy `dist/` to a server

This is a client-side single-page app (React Router), so whatever serves it
needs one thing: **fall back to `index.html` for unknown paths**, so refreshing
`/admin/doctors` doesn't 404.

### Option A — nginx on a VPS

1. Copy the build up:
   ```bash
   scp -r dist/* user@your-server:/var/www/alhind
   ```
2. nginx site config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/alhind;
       index index.html;

       location / {
           try_files $uri /index.html;
       }

       location /assets/ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```
3. `sudo nginx -t && sudo systemctl reload nginx`
4. Add HTTPS with Certbot: `sudo certbot --nginx -d your-domain.com`

### Option B — Node `serve` behind a process manager

```bash
npm install -g serve
pm2 start "serve -s dist -l 3000" --name alhind
```
`-s` enables the SPA fallback. Put nginx or Caddy in front for TLS/domain
routing if needed.

### Option C — static hosting (Vercel / Netlify / Cloudflare Pages)

No server management at all — connect the git repo (or drag-and-drop `dist/`),
set the same two `VITE_SUPABASE_*` environment variables in the host's
dashboard, and it builds/deploys automatically. Simplest option if you don't
specifically need your own VPS.

## 6. After deploying

- Make sure your Supabase Auth **Site URL** and **Redirect URLs**
  (Authentication → URL Configuration) include your real domain — otherwise
  Google login and password-reset links will redirect to `localhost`.
- Environment variables (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) are
  baked in at **build time**, not read at runtime. If you change them, rebuild
  and redeploy `dist/`.
