# CampusAssist AI — Project Status

> Last updated: 2025-07-01
> Branch: `feat/test-scripts`

---

## ✅ Completed

### Step 0 — Foundation
| File | Status |
|---|---|
| Next.js 15 + TypeScript + Tailwind v3 + shadcn/ui scaffold | ✅ |
| `types/index.ts` — shared types incl. `EnrollmentSummary` | ✅ |
| `lib/supabase.ts` — server-only client (`SUPABASE_URL` / `SUPABASE_ANON_KEY`) | ✅ |
| `lib/utils.ts` — `generateEnrNumber()` + `cn()` | ✅ |
| `lib/schemas.ts` — all 4 Zod schemas | ✅ |
| `lib/kb.json` — 8 KB entries with tuned keywords | ✅ |
| Supabase tables created + seeded + RLS disabled | ✅ |

### Step 1 — AI Service
| File | Status |
|---|---|
| `lib/ai.ts` — `getAIResponse()` keyword matcher, best-score, exact-word matching | ✅ |
| `app/api/chat/route.ts` — `POST /api/chat` | ✅ |

### Step 2 — DB API Routes
| File | Status |
|---|---|
| `lib/rate-limit.ts` — in-memory per-IP rate limiter | ✅ |
| `app/api/subjects/route.ts` — `GET /api/subjects` | ✅ |
| `app/api/enrollments/route.ts` — `GET /api/enrollments` (staff) + `POST /api/enrollments` | ✅ |
| `app/api/enrollments/[enr]/route.ts` — `GET` detail + `PATCH` status | ✅ |

### Step 3 — Test Scripts
| File | Tests | Status |
|---|---|---|
| `tests/lib/utils.test.ts` | 4 | ✅ |
| `tests/lib/schemas.test.ts` | 14 | ✅ |
| `tests/lib/ai.test.ts` | 7 | ✅ |
| `tests/api/chat.test.ts` | 4 | ✅ |
| `tests/api/subjects.test.ts` | 2 | ✅ |
| `tests/api/enrollments.test.ts` | 7 | ✅ |
| `tests/api/enrollments-enr.test.ts` | 6 | ✅ |
| **Total** | **44 / 44 passing** | ✅ |

---

## 🔧 Bug Fixes Applied

| Issue | Fix |
|---|---|
| Tailwind v4 PostCSS error after teammate downgraded to v3 | Ran `pnpm install` to align `node_modules` with `package.json` |
| `lib/supabase.ts` changed to use `NEXT_PUBLIC_` vars | Reverted to `SUPABASE_URL` / `SUPABASE_ANON_KEY` (server-only, no browser exposure) |
| Test deps + scripts removed from `package.json` by teammate | Re-added `vitest`, `@testing-library/*` deps and `test` scripts |

---

## 🚧 Pending (Frontend — Person A)

| Task | Owner |
|---|---|
| `app/page.tsx` — landing page + hero + CTAs | Person A |
| `app/enroll/page.tsx` — enrollment form | Person A |
| `app/success/page.tsx` — ENR number reveal | Person A |
| `app/track/[enr]/page.tsx` — status timeline | Person A |
| `app/admin/page.tsx` — admin dashboard | Person A |
| `app/chat/page.tsx` — AI chat interface | Person A |
| `components/ChatWindow.tsx` | Person A |
| `components/SubjectPicker.tsx` | Person A |
| `components/StatusTimeline.tsx` | Person A |
| `components/AdminTable.tsx` | Person A |
| `components/RoleToggle.tsx` | Person A |
| `components/EnrollmentNumberReveal.tsx` | Person A |
| `components/ChecklistCard.tsx` | Person A |
| Component tests in `tests/components/` | Person A |

---

## ⚠️ Important Notes for the Team

### Environment Variables
Your `.env.local` must use these exact names — **no** `NEXT_PUBLIC_` prefix:
```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```
These are server-only. Supabase is only ever called from `app/api/**/route.ts`.

### Do Not Change
- `lib/supabase.ts` env var names — they are intentionally server-only
- API response shapes — frontend components depend on the contracts in `agents.md`
- `lib/schemas.ts` — add new schemas here, do not define schemas inline in routes or components

### Run Tests Before Merging
```bash
pnpm test        # must show 44 passed before any merge to main
```

---

## Git Branches
| Branch | Purpose | Status |
|---|---|---|
| `main` | Stable, deployable | — |
| `feat/backend-foundation` | All backend files, API routes | ✅ Pushed |
| `feat/test-scripts` | Vitest setup + 44 backend tests | ✅ Pushed |
| `feat/frontend-*` | Frontend pages + components | 🚧 In progress |
