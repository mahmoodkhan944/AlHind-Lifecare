# AlHind Lifecare

Medical tourism marketing site + admin panel. React (Vite) frontend, Supabase
for the database, auth, and file storage.

## Requirements

- Node.js 18+
- A Supabase project (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))

## Run locally

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev
```

Open the local URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

Outputs static files to `dist/`.

## Deploying

See [DEPLOY.md](./DEPLOY.md) for VS Code local setup and shipping `dist/` to a
server (nginx example, plus static-host alternatives).

## Project structure

- `src/pages/` — routed pages (public site + `/admin/*`)
- `src/components/` — UI components, admin forms, layout
- `src/api/` — Supabase-backed data client (`dataClient.js`), auth
  (`authClient.js`), file uploads (`uploadFile.js`)
- `src/lib/supabaseClient.js` — Supabase client instance
- `supabase/schema.sql` — full database schema, RLS policies, storage bucket
