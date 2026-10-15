# Day 1 Repository and Implementation Readiness Review

| Field | Value |
|---|---|
| **Date** | 2026-10-15 |
| **Reviewer** | Codex |
| **Review type** | Day 1 repository and implementation readiness review |
| **Branch reviewed** | `main` |
| **Base commit** | `20c076d` |
| **Status** | Open |
| **Scope** | Enrollment MVP, API contracts, testing, security, and deployment readiness |

---

## Executive Summary

Day 1 produced a strong application skeleton: all planned pages and six API operations exist, TypeScript compiles without errors, and ESLint passes. However, the project **has not crossed the MVP gate** defined in `enrollment-plan.md`.

The current state is best described as **feature-complete on paper, integration-incomplete**:

- `.env.local` is absent; no Supabase-backed route can execute successfully.
- The database schema and seed data could not be verified.
- No end-to-end enrollment flow has been proven at the database level.
- There are no automated tests and no test infrastructure.
- Several implementation defects will affect the live demo if left unresolved.

Six findings are documented below. One is a P0 security issue requiring immediate action. Three are P1 demo-critical defects. Two are P2 infrastructure gaps.

---

## Verification Performed

| Check | Result |
|---|---|
| TypeScript compilation (`tsc --noEmit`) | **Passed** |
| ESLint (`next lint`) | **Passed** |
| Production build (`next build`) | **Not run** |
| Automated tests | **Unavailable** — no `tests/` directory, no Vitest installation, no test scripts in `package.json` |
| Supabase integration | **Not verified** — `.env.local` absent; all Supabase-backed routes throw at runtime |
| End-to-end enrollment flow | **Not verified** — depends on Supabase integration above |

Source files read during this review: `app/api/enrollments/route.ts`, `app/api/enrollments/[enr]/route.ts`, `components/AdminTable.tsx`, `lib/ai.ts`, `app/success/page.tsx`, `package.json`, `README.md`, `HANDOFF.md`.

---

## Findings

---

### R-001 — Exposed GitHub credential in local Git configuration

- **Priority:** P0
- **Status:** Open

**Evidence**  
The repository's local `.git/config` contains a personal access token embedded in the remote URL. The token was not found in tracked files or Git history.

**Impact**  
Anyone with read access to this machine's filesystem can extract a valid GitHub credential. If the token has write or admin scope it could be used to push, delete branches, or access private repositories associated with the account.

**Recommendation**  
1. Revoke the token immediately in GitHub → Settings → Developer settings → Personal access tokens.
2. Change the remote URL to the credential-free form: `https://github.com/CedZzzzzzzzz/goats-hackathon.git`
3. Configure Git Credential Manager to handle authentication going forward.
4. Confirm the token value does not appear in any tracked file or commit object before treating the finding as resolved.

**Relevant files**  
`.git/config` (untracked — not part of the repository)

---

### R-002 — Admin subject-detail expansion always shows "No subjects loaded"

- **Priority:** P1
- **Status:** Open

**Evidence**  
`GET /api/enrollments` (`app/api/enrollments/route.ts` line 16) selects only `enr_number, full_name, student_id, student_type, year_level, program, status, created_at` — the `subjects` field is intentionally omitted from the list response. `AdminTable.tsx` (line 150) reads `e.subjects` directly from the row object it receives. Because the list response never contains `subjects`, the expansion panel always renders the "No subjects loaded." fallback.

**Impact**  
The admin subject-detail view is non-functional. A reviewer clicking to expand any enrollment during the demo will see an empty panel, which undermines the admin workflow demonstration.

**Recommendation**  
When a row is expanded, fetch `GET /api/enrollments/{enr_number}` to retrieve the full record including `subjects[]`, and render subjects from that response. This preserves the documented list-endpoint contract (which deliberately omits subjects for performance) while delivering the correct detail view.

**Relevant files**  
- `campusassist-ai/app/api/enrollments/route.ts` (line 16)
- `campusassist-ai/components/AdminTable.tsx` (lines 146–165)

---

### R-003 — AI matcher cannot match multi-word keywords; demo questions misroute

- **Priority:** P1
- **Status:** Open

**Evidence**  
`lib/ai.ts` (line 26) splits the user message on whitespace and strips non-alphanumeric characters, producing individual word tokens. Line 33 then checks `words.some(w => w === kw)` — that is, each keyword string is compared as a whole against single-word tokens. A multi-word keyword such as `"how many"`, `"pick subjects"`, or `"back subject"` can never equal a single token and will therefore never match, regardless of what the user types.

Consequence for the planned demo questions:
- "What subjects can I take as an irregular student?" returns the irregular-student entry rather than the documented subject-selection checklist, because `irregular` scores higher than `subjects` against that entry's keyword set.
- "How many subjects can I pick?" returns the general enrollment overview because `"how many"` never matches and only common single words score.

**Impact**  
Demo questions drawn from the product plan will produce wrong answers during the live demonstration, and the checklist response type will not be exercised.

**Recommendation**  
Make the matcher phrase-aware: normalize the full lowercased message and check whether each keyword string appears as a substring of that normalized message, rather than checking individual tokens. Add tests using the exact demo-script questions to prevent regression.

**Relevant files**  
- `campusassist-ai/lib/ai.ts` (lines 25–34)
- `campusassist-ai/lib/kb.json`

---

### R-004 — Concurrent enrollment submissions can fail due to `enr_number` uniqueness collision

- **Priority:** P1
- **Status:** Open

**Evidence**  
`app/api/enrollments/route.ts` (line 54) inserts every new enrollment row with the literal value `"pending"` as the `enr_number`. Because `enr_number` has a `UNIQUE` constraint in the database schema, a second concurrent submission will violate that constraint before the first submission has a chance to update its placeholder to the real ENR number.

**Impact**  
Under any concurrent load — or even rapid sequential submissions during a demo — one submission will return a 500 error. The real ENR is generated only after the insert succeeds (line 70), so the current two-step approach is inherently racy.

**Recommendation**  
Use a unique placeholder per insertion (e.g., a UUID or a database sequence value cast to text), or restructure the insertion as a database transaction/RPC that generates and sets the ENR number atomically. An in-memory UUID placeholder (`crypto.randomUUID()`) is the lowest-effort fix.

**Relevant files**  
- `campusassist-ai/app/api/enrollments/route.ts` (lines 51–66)

---

### R-005 — Failed API requests appear successful in the UI

- **Priority:** P1
- **Status:** Open

**Evidence**  
Three separate locations do not check the HTTP response status before proceeding:

1. `components/AdminTable.tsx` (lines 34–44): `updateStatus()` calls `fetch(...)` then unconditionally calls `onStatusChange()` without checking `response.ok`. A failed PATCH will silently trigger a list refresh that shows the old status.
2. `app/success/page.tsx` (lines 18–21): the `fetch` chain calls `.then(r => r.json())` without testing `r.ok`. A 404 or 500 from `GET /api/enrollments/[enr]` will be parsed as JSON (likely an `{ error: "..." }` object), silently assigned to `enrollment`, and then the subjects list will be empty with no explanation shown to the student.
3. Subject loading failures in `app/enroll/page.tsx` (not individually read, but cited in the source review) render as an empty subject picker with no user-visible error message.

**Impact**  
Errors during the demo will appear as silent no-ops or empty states. Students or staff will not know whether an action succeeded or failed.

**Recommendation**  
In each location: check `response.ok` after `fetch`, and surface a visible error message (toast, inline text, or a thrown error boundary) when the response is not successful. Do not proceed with state updates on failure.

**Relevant files**  
- `campusassist-ai/components/AdminTable.tsx` (lines 31–46)
- `campusassist-ai/app/success/page.tsx` (lines 16–22)
- `campusassist-ai/app/enroll/page.tsx`

---

### R-006 — Testing and shipping infrastructure are absent

- **Priority:** P2
- **Status:** Open

**Evidence**  
- `package.json` contains no `test` or `test:watch` scripts and no Vitest or Testing Library dependencies.
- No `tests/` directory exists anywhere in the repository.
- `campusassist-ai/README.md` is still the stock `create-next-app` template.
- Both `package-lock.json` (npm) and `pnpm-lock.yaml` (pnpm) are tracked, despite pnpm being the declared package manager.
- The regenerated `pnpm-lock.yaml` and modified `pnpm-workspace.yaml` are uncommitted. `HANDOFF.md` is untracked.
- React Bits animations and the standalone `/track` search form have not been started.

**Impact**  
There is no automated safety net. Any change to the matcher, schemas, or API routes can break the demo without detection. The repository is also not demo-ready (README, lockfile hygiene).

**Recommendation**  
See the Day 2 work order below. Prioritize Vitest setup and the AI-matcher, schema, and enrollment-API test suites before shipping. Address lockfile and README hygiene in the same stabilization commit.

**Relevant files**  
- `campusassist-ai/package.json`
- `campusassist-ai/README.md`
- `campusassist-ai/pnpm-lock.yaml`
- `campusassist-ai/pnpm-workspace.yaml`
- `HANDOFF.md`

---

## Recommended Day 2 Work Order

Complete items in the order listed. Do not begin a later block while an earlier block has open P0 or P1 findings.

### Block 1 — Security and Git hygiene

- [ ] Revoke the exposed GitHub personal access token (R-001).
- [ ] Clean the remote URL in `.git/config` to the credential-free form.
- [ ] Create a stabilization feature branch (do not commit directly to `main` per `agents.md` branch policy).
- [ ] Review `pnpm-workspace.yaml` changes, then commit the corrected `pnpm-lock.yaml` and `pnpm-workspace.yaml` together.
- [ ] Commit `HANDOFF.md` or add it to `.gitignore` if it should not be tracked.
- [ ] Remove `package-lock.json` from tracking when the team is ready to standardize on pnpm.

### Block 2 — Connect and seed Supabase

- [ ] Create `campusassist-ai/.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Run all four `CREATE TABLE` statements from `agents.md` (enrollments, enrollment_subjects, subjects, curricula).
- [ ] Apply the `update_updated_at` trigger.
- [ ] Run all seed `INSERT` statements (subjects, curricula, demo enrollments).
- [ ] Verify `GET /api/subjects` returns the expected subject list before attempting enrollment.
- [ ] Keep Vercel environment variable values synchronized with `.env.local`.

### Block 3 — Fix the four demo-critical defects

- [ ] Fix admin subject expansion: fetch full enrollment detail on row expand (R-002).
- [ ] Fix AI matcher: make keyword matching phrase-aware (R-003).
- [ ] Fix concurrent ENR placeholder collision: use a unique temporary value per insertion (R-004).
- [ ] Fix silent failure states: check `response.ok` in AdminTable, success page, and subject picker (R-005).

### Block 4 — Add focused automated tests

Install Vitest and Testing Library first (`pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom`), then write tests in priority order:

- [ ] `tests/lib/ai.test.ts` — AI matcher with exact demo-script prompts.
- [ ] `tests/lib/schemas.test.ts` — Zod schema validation.
- [ ] `tests/lib/utils.test.ts` — `generateEnrNumber()` output and padding.
- [ ] `tests/api/enrollments.test.ts` — regular and irregular enrollment API paths.
- [ ] `tests/api/enrollments-enr.test.ts` — staff authorization and status changes.
- [ ] `tests/api/chat.test.ts` — matched and unknown chat responses.
- [ ] `tests/api/subjects.test.ts` — subject list shape.
- [ ] `tests/components/SubjectPicker.test.tsx` — selection state and onChange callback.
- [ ] `tests/components/StatusTimeline.test.tsx` — all status branches render correctly.
- [ ] `tests/components/ChatWindow.test.tsx` — message rendering and source citation.
- [ ] `tests/components/ChecklistCard.test.tsx` — null items and list rendering.

### Block 5 — Run the full MVP gate

- [ ] Manually complete the regular student enrollment flow end-to-end.
- [ ] Manually complete the irregular student enrollment flow end-to-end.
- [ ] Confirm one irregular enrollment and reject a separate one from the admin dashboard.
- [ ] Refresh the tracking page after each status change.
- [ ] Test all error cases (missing fields, invalid subject codes, unauthorized admin access).
- [ ] Verify all six API operations against the checklist in `enrollment-plan.md`.

### Block 6 — Ship preparation

- [ ] Deploy to Vercel; configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel dashboard.
- [ ] Smoke-test the public deployment against all six API operations.
- [ ] Replace `campusassist-ai/README.md` with project-specific setup and usage instructions (R-006).
- [ ] Rehearse the five-minute demo twice using known test records.

---

## Scope Recommendations

**Do not start React Bits animations or the standalone `/track` search form yet.**

The success page already links directly to the tracking page via the ENR number, so the standalone search does not meaningfully improve the planned demo flow. Animations should be added only after all of the following are confirmed complete: MVP gate passed, all test suites green, Vercel deployment smoke-tested, and demo rehearsed.

---

## Open Questions

1. **Supabase project status:** Has the Supabase project been created and the credentials distributed to all team members? The entire database-backed portion of the app is blocked until `.env.local` exists.
2. **Token scope:** What permissions does the exposed GitHub token (R-001) have? Knowing the scope determines the blast radius and whether any dependent systems need to be audited.
3. **npm lockfile origin:** Who generated `package-lock.json`? It should be removed once the team confirms pnpm is the sole package manager.
4. **Demo laptop:** Has the Vercel deployment target and demo machine been decided? The deployment smoke-test (Block 6) needs to run on the same machine used for the presentation.
5. **KB entry coverage:** Have the planned demo questions been mapped against `lib/kb.json` keywords? This is required before the phrase-aware fix (R-003) can be validated.

---

## Resolution Log

Update this section when findings are resolved. Do not delete or rewrite the original finding; record the resolving commit and verification result.

| Finding | Resolved in commit | Verified by | Notes |
|---|---|---|---|
| R-001 | — | — | — |
| R-002 | — | — | — |
| R-003 | — | — | — |
| R-004 | — | — | — |
| R-005 | — | — | — |
| R-006 | — | — | — |
