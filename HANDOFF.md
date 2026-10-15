# CampusAssist AI — Session Handoff

**Date:** 2025-07-15
**Branch:** `main`
**Dev server:** `http://localhost:3000` (run `pnpm dev` from `campusassist-ai/`)

---

## Team

| Member | Role | Contributed to repo |
|--------|------|---------------------|
| Marcus | Backend | ✅ Yes — API routes, Supabase integration, rate limiter, schemas |
| You (Charlei) | Frontend | ✅ Yes — pages, components, layout |
| Marielle | Frontend | ✅ Yes — pages, components, layout |
| *(2 others)* | TBD | — |

---

## What Was Done Today

### 1. Dev environment unblocked

The `pnpm-lock.yaml` had been committed with `next@16.4.1` (published same day),
which tripped pnpm 12's built-in 24-hour supply-chain `minimumReleaseAge` policy.

**Fix applied:** deleted the stale lockfile and ran `pnpm install` from scratch.
pnpm now resolves `next@15.3.3` as declared in `package.json`, which clears
the policy check. A fresh `pnpm-lock.yaml` was generated.

> ⚠️ **Do not commit a lockfile that was generated with a newer `next` version.**
> If you run `pnpm add <anything>` and the lockfile suddenly pulls in `next@16.x`,
> delete the lock and reinstall before committing.

The `pnpm-workspace.yaml` was also modified externally (adds `allowBuilds` keys
for `sharp` and `unrs-resolver`). Those two packages have their build scripts
intentionally blocked — this is normal and does not affect the dev server.

---

### 2. Dev server confirmed working

`pnpm dev` starts cleanly. Pages that were verified loading during this session:

| URL | HTTP | Notes |
|-----|------|-------|
| `/` | 200 | Landing page, hero, feature cards, how-it-works |
| `/enroll` | 200 | Enrollment form with student type switcher |
| `/chat` | 200 | AI chat window |
| `/admin` | 200 | Admin dashboard (role-gated) |
| `POST /api/chat` | 200 | AI keyword matcher working |

The only 500s observed are on `GET /api/subjects` — **expected**, see below.

---

## Current Known Issue — Supabase env vars not set

All Supabase-backed routes (`/api/subjects`, `/api/enrollments`, `/api/enrollments/[enr]`)
throw at runtime:

```
Error: Supabase environment variables are not set.
Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
```

**Root cause:** `.env.local` does not exist in `campusassist-ai/`.
The file is gitignored (correct). You need to create it manually.

**Fix — create `campusassist-ai/.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Get both values from the Supabase dashboard → Project Settings → API.
After saving, restart the dev server (`Ctrl+C`, `pnpm dev`).

---

## Feature Status

### ✅ Complete and running

| Area | Files |
|------|-------|
| **Root layout + nav** | `app/layout.tsx` |
| **Landing page** | `app/page.tsx` |
| **Role toggle (student ↔ staff)** | `components/RoleToggle.tsx` |
| **Enrollment form** | `app/enroll/page.tsx` |
| **Subject picker (irregular)** | `components/SubjectPicker.tsx` |
| **Success / ENR reveal page** | `app/success/page.tsx`, `components/EnrollmentNumberReveal.tsx` (with copy-to-clipboard) |
| **Status tracking page** | `app/track/[enr]/page.tsx`, `components/StatusTimeline.tsx` |
| **AI chat UI** | `app/chat/page.tsx`, `components/ChatWindow.tsx`, `components/ChecklistCard.tsx` |
| **Admin dashboard** | `app/admin/page.tsx`, `components/AdminTable.tsx` |
| **AI matcher** | `lib/ai.ts`, `lib/kb.json` (8 KB entries: overview, regular, irregular, subject selection, approval, tracking, schedule, requirements) |
| **Zod schemas** | `lib/schemas.ts` |
| **Shared types** | `types/index.ts` |
| **Utils** | `lib/utils.ts` — `generateEnrNumber()`, `cn()` |
| **Supabase client** | `lib/supabase.ts` — lazy proxy, throws with a clear message if env vars are missing |
| **Rate limiter** | `lib/rate-limit.ts` — in-memory, 5 req/min/IP on POST /api/enrollments |
| **POST /api/chat** | `app/api/chat/route.ts` |
| **GET /api/subjects** | `app/api/subjects/route.ts` |
| **POST /api/enrollments** | `app/api/enrollments/route.ts` |
| **GET /api/enrollments** | `app/api/enrollments/route.ts` (staff-gated) |
| **GET /api/enrollments/[enr]** | `app/api/enrollments/[enr]/route.ts` |
| **PATCH /api/enrollments/[enr]** | `app/api/enrollments/[enr]/route.ts` (staff-gated) |

### ❌ Not yet started

| Area | Notes |
|------|-------|
| **Tests** | `tests/` directory does not exist. Vitest not installed. Zero test files written. This is the largest gap before code freeze. See `agents.md` → Testing section for full spec. |
| **React Bits animations** | 4 animation spots defined in `agents.md`. Not started. Add only after tests pass. |
| **`/track` standalone search form** | Nice-to-have from `agents.md` suggestions. No separate search UI exists — tracking only works via direct URL `/track/[enr]`. |

---

## Immediate Next Steps (priority order)

1. **Create `.env.local`** with real Supabase credentials — nothing database-related works without this.
2. **Seed the Supabase database** — run the SQL in `agents.md` → Database Schema → Seed data.
3. **Write tests** — install vitest and write files under `tests/`. See `agents.md` for exact file locations and what each test file must cover.
4. **Deploy to Vercel** — connect repo, set the two env vars in Vercel's dashboard.

---

## File Reference

```
campusassist-ai/
├── app/
│   ├── layout.tsx                  ← root layout, RoleProvider, sticky nav
│   ├── page.tsx                    ← landing page
│   ├── chat/page.tsx
│   ├── enroll/page.tsx
│   ├── success/page.tsx
│   ├── track/[enr]/page.tsx
│   ├── admin/page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── subjects/route.ts
│       └── enrollments/
│           ├── route.ts
│           └── [enr]/route.ts
├── components/
│   ├── AdminTable.tsx
│   ├── ChatWindow.tsx
│   ├── ChecklistCard.tsx
│   ├── EnrollmentNumberReveal.tsx  ← copy-to-clipboard included
│   ├── RoleToggle.tsx              ← RoleProvider + useRole + toggle button
│   ├── StatusTimeline.tsx
│   ├── SubjectPicker.tsx
│   └── ui/button.tsx
├── lib/
│   ├── ai.ts                       ← keyword scorer, no external API calls
│   ├── kb.json                     ← 8 KB entries
│   ├── rate-limit.ts               ← in-memory, per-IP
│   ├── schemas.ts                  ← all Zod schemas
│   ├── supabase.ts                 ← lazy proxy client
│   └── utils.ts
├── types/index.ts
├── pnpm-lock.yaml                  ← freshly regenerated today (next@15.3.3)
└── pnpm-workspace.yaml
```

---

## Git State

```
Branch: main (up to date with origin/main)
Uncommitted: pnpm-lock.yaml (regenerated), pnpm-workspace.yaml (external edit)
```

Commit these two files before starting new work:

```bash
git add pnpm-lock.yaml pnpm-workspace.yaml
git commit -m "chore(deps): regenerate lockfile with next@15.3.3"
git push origin main
```
