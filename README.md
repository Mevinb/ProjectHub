# Mini GitHub for College Projects

Students publish projects with screenshots, GitHub links, tech stack. Like/upvote/bookmark. Search by technology. Team member profiles.

**Stack:** NestJS API + Next.js Web + Postgres (Prisma). Dockerized. Works with `npm` (pnpm also supported).

## Quick start (no Docker)

```bash
cp .env.example .env
# 1. start postgres (or use docker db only)
npm install
npm run db:migrate --workspace=apps/api
npm run db:seed --workspace=apps/api
# terminal 1
npm run dev:api
# terminal 2
npm run dev:web
# web: http://localhost:3000  api: http://localhost:3001/api/v1/health
```

Demo accounts (seeded): `aarav@college.edu / password123`, `diya@cs.college.edu / password123`, `admin@college.edu / admin123`.

## Quick start (Docker)

```bash
cp .env.example .env
# set JWT_SECRET to 32+ random chars
docker compose up --build
# web http://localhost:3000, api http://localhost:3001/api/v1/health
```

## Repo layout

```
apps/api  NestJS REST /api/v1 (auth, users, projects, tech, votes, bookmarks, uploads)
apps/web  Next.js App Router (landing, explore, project detail, new/edit, profile, bookmarks)
prisma in apps/api/prisma/schema.prisma
```

## Core rules

- Open signup: all mail IDs allowed by default (`ALLOWED_EMAIL_DOMAINS=*`). Restrict with `college.edu,cs.college.edu` + `ALLOWED_EMAIL_OVERRIDES` if needed.
- GitHub OAuth only *links* an account; it never bypasses the email check.
- One upvote per user per project (toggle, idempotent). Bookmark is private.
- `upvoteCount` is denormalized on Project for fast cards.
- Uploads: 5MB/file, 5/project, jpg/png/webp, stored local `./data/uploads` (switchable to S3 via `STORAGE_DRIVER`).

See `EVALUATION.md` for 3-min demo script, `CONTRIBUTING.md` for handoff.
