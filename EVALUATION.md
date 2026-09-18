# Evaluation — 3 minute demo script

Seed first: `npm run db:seed --workspace=apps/api`

1. **Landing (30s):** open `/`. Show trending + top tech chips. Click a project.
2. **Publish (60s):** login `aarav@college.edu / password123` → `/new`. Title `Hostel Laundry Tracker`, GitHub URL `https://github.com/aarav/laundry`, tech `react, postgres`, upload 1 screenshot, add teammate `diya`. Publish → detail page renders gallery, stack, team.
3. **Interact (45s):** logout → try upvote (redirects to login). Login as `diya@cs.college.edu` → upvote (count +1), toggle off/on, bookmark → `/bookmarks` shows it.
4. **Search (30s):** `/explore?q=laundry`, filter `tech=react`, sort Top/Trending/New. Share URL (query params persist).
5. **Profiles (15s):** `/profile/aarav` shows owned + contributing. `/profile/diya` shows contributing.

Fail-closed checks evaluators love: signup `foo@gmail.com` → 403; non-owner edit → 403; upload 10MB → 413; duplicate upvote → count unchanged.
