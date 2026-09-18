# Deploy — Supabase + Render (API) + Vercel (Web)

Local docker-compose still works for dev. This is the cloud path.

## 0. What lives where

| Piece | Host | Notes |
|---|---|---|
| Postgres | Supabase | Free tier fine. App uses Session-pooler URI (IPv4, port 5432) |
| Screenshots | Supabase Storage, bucket `screenshots` (**public**) | `STORAGE_DRIVER=supabase` on Render |
| API (NestJS) | Render, `render.yaml` blueprint |igrates via `preDeployCommand`, health `/api/v1/health` |
| Web (Next.js) | Vercel, Root Directory `apps/web` | `NEXT_PUBLIC_API_URL` set **before** build |

## 1. Supabase setup (10 min)

1. Create project at supabase.com. Save the DB password.
2. **Database -> Connect -> Connection Pooler -> Mode: Session (port 5432)**:
   - **DO NOT** use the "Direct connection" (`db.<ref>.supabase.co`), because Supabase direct connections are IPv6-only and Render free instances only have IPv4 egress!
   - Copy the Session Pooler URI. For your project (`knawfhggxlfavyzjubqa` in `ap-south-1`), the format is:
     `postgresql://postgres.knawfhggxlfavyzjubqa:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?schema=public`
   - Make sure to replace `[YOUR-PASSWORD]` with your actual Supabase DB password.
3. **Storage -> New bucket** named `screenshots`, toggle **Public ON** (private buckets return 403 image URLs).
4. **Project Settings -> API**: copy `Project URL` (`SUPABASE_URL`) and `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`, server-only — never `NEXT_PUBLIC_`).
5. Point local at Supabase once and push schema + seed:
   ```bash
   cp .env.example .env   # then set DATABASE_URL to the Supabase URI
   npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
   npm run db:seed --workspace=apps/api
   ```
   Optional (later): enable fuzzy search via SQL editor: `create extension if not exists pg_trgm;`

## 2. Render — API (5 min)

1. Dashboard -> New -> Blueprint -> repo `Mevinb/ProjectHub` (uses root `render.yaml`).
2. Fill prompted secrets: `DATABASE_URL` (Supabase Session URI), `FRONTEND_URL` (your Vercel URL — add real one after step 3, redeploys are cheap), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Keep `STORAGE_DRIVER=supabase`.
3. Deploy. Verify `https://<api>.onrender.com/api/v1/health` → `{"ok":true}`.
4. Free-tier note: first request after idle takes ~30-60s (cold start); uploads use Supabase so nothing is lost on restart.

## 3. Vercel — Web (5 min)

1. Import repo, set **Root Directory = `apps/web`** (Framework preset: Next.js).
2. Environment variable **before first build**: `NEXT_PUBLIC_API_URL=https://<api>.onrender.com/api/v1`.
3. Deploy. Open the URL, login, publish a test project with a screenshot (lands in Supabase bucket).
4. Back in Render, set `FRONTEND_URL` to the exact Vercel URL and redeploy API (logout cookie clearing + CORS strictness depend on it; `*.vercel.app` previews already work).

## 4. Gotchas

- `NEXT_PUBLIC_` vars bake at **build** time: changing API URL in Vercel needs **redeploy**, not just save.
- Cookie: prod uses `SameSite=None; Secure` automatically; local stays `Lax`. If logins "don't stick" in prod, check `FRONTEND_URL` matches the Vercel URL exactly (no trailing slash).
- CORS: `FRONTEND_URL` (CSV ok) + `*.vercel.app` + localhost are allowed. Other custom domains go in `FRONTEND_URLS_EXTRA`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. Web only needs `NEXT_PUBLIC_API_URL`.
- Rollback: local dev is untouched — `docker compose up` or the user-space pg flow in README still works with `STORAGE_DRIVER=local`.
