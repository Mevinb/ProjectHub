# Contributing — keep this alive after evaluation

One maintainer per branch, rotate each semester. Handoff = 5 minutes:

1. `cp .env.example .env`, set `JWT_SECRET`, run `docker compose up --build`.
2. Seed has realistic data; add your batch's projects via `/new` before deleting demos.
3. Rules: never commit `.env`; tech tags lowercase slugs; screenshots must be own work (checkbox on form).

## Adding features safely

- DB change → edit `apps/api/prisma/schema.prisma` → `npx prisma migrate dev --name what_changed` → update `seed.ts` if needed.
- New endpoint → DTO in `dto/` with `class-validator` → service + controller → e2e in `test/`.
- New page → `apps/web/app/.../page.tsx` + `lib/api.ts` helper. Keep `NEXT_PUBLIC_API_URL` as single source.
- Uploads stay behind `UploadsService` so S3 switch needs only env + service change.

## Backlog (v2, do NOT cram into MVP)

Comments, report/moderation queue, "looking for teammates" board, yearly archive `/2025`, GitHub stars sync cron, pg_trgm fuzzy search (`CREATE EXTENSION pg_trgm` + GIN index — SQL in `apps/api/prisma/migrations/` when ready).
