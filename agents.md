# CampusAssist AI — Agent & Technical Reference

> This file is the working reference for Bob (AI coding assistant) and both developers during the hackathon build.
> Read `enrollment-plan.md` for the full product scope, timeline, and demo script.
> This file covers: project bootstrap, tech stack, folder layout, all endpoints with contracts, component map, and coding conventions.

---

## Project Overview

**CampusAssist AI** is a student enrollment portal for a single college department — BSIT. Students identify as regular or irregular, enroll for the semester (regular students are auto-assigned their curriculum; irregular students pick from a subject pool), and track their enrollment status. Staff confirm or reject pending irregular enrollments via an admin dashboard. An AI assistant answers enrollment process questions from a curated knowledge base.

**Key design constraints:**
- AI chatbot answers only from approved content in `lib/kb.json` — no external LLM API, no vector DB
- Every AI answer cites its source; unknown questions get a safe "I don't know" response
- No real authentication — a demo role-switch toggle switches between student and staff views
- All data is fake; this is not a production system
- One workflow done well is the goal

---

## Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js (App Router) | `latest` — use `app/` directory only |
| Language | TypeScript | Strict mode on |
| Styling | Tailwind CSS | v3, configured via `tailwind.config.ts` |
| Components | shadcn/ui | Copy-paste components into `components/ui/` |
| Database | Supabase (Postgres) | Managed cloud, JS client `@supabase/supabase-js` |
| Validation | Zod | All schemas live in `lib/schemas.ts` |
| Animations | React Bits | CDN copy-paste or `pnpm` package — 4 spots only |
| Package manager | **pnpm** | `pnpm install`, `pnpm dev`, `pnpm build` |
| Deployment | Vercel | Connect repo, set env vars, deploy |

### Bootstrap (run once, together)

```bash
pnpm create next-app@latest campusassist-ai --typescript --tailwind --app --eslint --src-dir no --import-alias "@/*"
cd campusassist-ai
pnpm dlx shadcn@latest init
pnpm add @supabase/supabase-js zod
pnpm add -D @types/node
```

> After scaffolding, copy the environment variables below into `.env.local`.

---

## Commands

All commands run from the project root (`campusassist-ai/`).

### Daily development

```bash
pnpm dev          # start Next.js dev server on http://localhost:3000
pnpm build        # production build (run before deploying)
pnpm start        # serve the production build locally
pnpm lint         # run ESLint across the project
```

### Testing

```bash
pnpm test                               # run all tests
pnpm test:watch                         # watch mode
pnpm --filter @bobhackathon/web test    # run tests for the web package only (monorepo)
```

### Package management

```bash
pnpm install              # install all dependencies
pnpm add <pkg>            # add a runtime dependency
pnpm add -D <pkg>         # add a dev dependency
pnpm dlx shadcn@latest add <component>  # add a shadcn/ui component
```

### Git — Branch Strategy & Commit Conventions

#### Branch naming

Use feature branches off `main`. Never commit directly to `main`.

```
main                        # stable, always deployable
└── feat/<short-name>       # one branch per feature or route
```

```bash
# create and switch to a feature branch
git checkout -b feat/chat-interface
git checkout -b feat/enroll-form
git checkout -b feat/subject-picker
git checkout -b feat/status-tracking
git checkout -b feat/admin-dashboard
git checkout -b feat/react-bits-animations
git checkout -b fix/enr-number-padding
```

Merge back to `main` via a PR (or a direct merge if working fast during the hackathon). Keep branches short-lived — one branch per feature, merged when it works.

#### Semantic commit messages

Format: `type(scope): short description`

| Type | When to use |
|---|---|
| `feat` | New feature or page |
| `fix` | Bug fix |
| `chore` | Config, deps, tooling — no production code change |
| `test` | Adding or updating test files only |
| `refactor` | Code change that is not a feature or fix |
| `style` | Formatting, Tailwind class changes — no logic change |
| `docs` | `enrollment-plan.md`, `agents.md`, `README.md` updates |

**Scope** is the part of the app being changed. Keep it short.

```bash
# features
git commit -m "feat(chat): add ChatWindow component with message list"
git commit -m "feat(api): add POST /api/chat route with KB matcher"
git commit -m "feat(enroll): add enrollment form with student type selector"
git commit -m "feat(subjects): add GET /api/subjects and SubjectPicker component"
git commit -m "feat(tracking): add status timeline page /track/[enr]"
git commit -m "feat(admin): add enrollments table with confirm/reject actions"
git commit -m "feat(animations): add React Bits hero text and subject list stagger"

# fixes
git commit -m "fix(api): return 404 when enr number not found"
git commit -m "fix(form): require subject selection for irregular students"
git commit -m "fix(enr): zero-pad enrollment number to 4 digits"

# tests
git commit -m "test(ai): add unit tests for getAIResponse matcher"
git commit -m "test(schemas): add Zod schema validation tests"

# config / chores
git commit -m "chore(deps): add vitest and testing-library"
git commit -m "chore(db): add Supabase schema and seed SQL"
git commit -m "docs(agents): update endpoint contracts for enrollment domain"
```

#### Commit cadence

```bash
git add .
git commit -m "feat(scope): description"
git push origin feat/<branch-name>
```

Commit after every working unit — not at the end of the hackathon. If the app breaks, `git stash` or revert to the last clean commit.

---

### Environment variables (`.env.local`)

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

Never commit `.env.local`. It is already in `.gitignore` by default.

---

## Folder Structure

```
campusassist-ai/
│
├── app/                                    # Next.js App Router — all pages and API routes
│   ├── layout.tsx                          # Root layout: RoleProvider only — no visual chrome
│   ├── (student)/                          # Route group: student nav header + content wrapper
│   │   ├── layout.tsx                      # Student header (CampusAssist AI + Enroll/Ask AI/Admin + RoleToggle)
│   │   ├── page.tsx                        # Landing page — hero + "Start Enrollment" CTA
│   │   ├── chat/
│   │   │   └── page.tsx                    # AI chat interface
│   │   ├── enroll/
│   │   │   └── page.tsx                    # Enrollment form (student info + type + subject picker)
│   │   ├── success/
│   │   │   └── page.tsx                    # ENR number reveal + subject list
│   │   └── track/
│   │       └── [enr]/
│   │           └── page.tsx                # Status tracking by enrollment number
│   ├── admin/
│   │   ├── layout.tsx                      # Admin layout: renders PupilaAdminShell
│   │   └── page.tsx                        # PUPILA dashboard — enrollment list + confirm/reject
│   └── api/
│       ├── chat/
│       │   └── route.ts                    # POST /api/chat
│       ├── subjects/
│       │   └── route.ts                    # GET /api/subjects
│       └── enrollments/
│           ├── route.ts                    # POST /api/enrollments · GET /api/enrollments
│           └── [enr]/
│               └── route.ts               # GET /api/enrollments/[enr] · PATCH /api/enrollments/[enr]
│
├── components/
│   ├── ui/                                 # shadcn/ui generated components
│   ├── ChatWindow.tsx                      # Chat message list + input bar
│   ├── ChecklistCard.tsx                   # Renders AI checklist responses
│   ├── SubjectPicker.tsx                   # Multi-select subject list (irregular students only)
│   ├── EnrollmentNumberReveal.tsx          # Animated ENR number on success page
│   ├── StatusTimeline.tsx                  # Status step timeline on tracking page
│   ├── AdminTable.tsx                      # Enrollments table with confirm/reject actions
│   ├── PupilaAdminShell.tsx                # PUPILA admin shell: header, sidebar, AI panel
│   └── RoleToggle.tsx                      # Header toggle: Student view ↔ Staff view
│
├── lib/
│   ├── kb.json                             # Hand-written enrollment knowledge base
│   ├── ai.ts                               # Keyword matcher — getAIResponse(message)
│   ├── supabase.ts                         # Supabase client singleton
│   ├── schemas.ts                          # All Zod schemas (shared by API routes + forms)
│   └── utils.ts                            # generateEnrNumber(), cn() helper, etc.
│
├── types/
│   └── index.ts                            # Shared TypeScript types
│
├── tests/
│   ├── setup.ts                            # jest-dom global setup
│   ├── lib/
│   │   ├── ai.test.ts                      # getAIResponse() unit tests
│   │   ├── schemas.test.ts                 # Zod schema unit tests
│   │   └── utils.test.ts                   # generateEnrNumber() unit tests
│   ├── api/
│   │   ├── chat.test.ts                    # POST /api/chat
│   │   ├── subjects.test.ts                # GET /api/subjects
│   │   ├── enrollments.test.ts             # POST /api/enrollments · GET /api/enrollments
│   │   └── enrollments-enr.test.ts         # GET /api/enrollments/[enr] · PATCH /api/enrollments/[enr]
│   └── components/
│       ├── AdminPage.test.tsx              # Admin page not-staff view-switch tests
│       ├── ChatWindow.test.tsx
│       ├── ChecklistCard.test.tsx
│       ├── PupilaAdminShell.test.tsx       # Shell layout, nav, and AI panel tests
│       ├── SubjectPicker.test.tsx
│       └── StatusTimeline.test.tsx
│
├── vitest.config.mjs                       # Vitest configuration (actual filename)
├── .env.local                              # Secret env vars — never commit
└── README.md                               # App setup notes
```

`agents.md` and `enrollment-plan.md` live at the repository root, one level above `campusassist-ai/`.

---

## Shared Types (`types/index.ts`)

```ts
export type StudentType      = "regular" | "irregular"
export type EnrollmentStatus = "pending" | "confirmed" | "rejected"

export interface Subject {
  code:       string
  name:       string
  units:      number
  year_level: string
  program:    string
}

export interface Enrollment {
  id:            number
  enr_number:    string
  full_name:     string
  student_id:    string
  student_type:  StudentType
  year_level:    string
  program:       string
  semester:      string
  academic_year: string
  status:        EnrollmentStatus
  subjects:      Subject[]
  created_at:    string
  updated_at:    string
}

export interface AIResponse {
  answer: string
  source: string | null       // shown as "Source: {source}"
  type:   "info" | "checklist" | "unknown"
  items:  string[] | null     // only populated when type === "checklist"
}
```

---

## Database Schema (Supabase)

### Table: `enrollments`

```sql
create table enrollments (
  id              bigserial primary key,
  enr_number      text not null unique,              -- ENR-00042-MN-0 (regular) / ENR-00042-MN-1 (irregular)
  full_name       text not null,
  student_id      text not null,
  student_type    text not null check (student_type in ('regular', 'irregular')),
  year_level      text not null,                    -- '1st Year', '2nd Year', etc.
  program         text not null,                    -- e.g. 'BSIT'
  semester        text not null default '1st Semester',
  academic_year   text not null default '2025-2026',
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

> Regular enrollments are inserted with `status = 'confirmed'`. Irregular enrollments are inserted with `status = 'pending'`.

### Table: `enrollment_subjects`

Junction table linking an enrollment to the subjects it contains.

```sql
create table enrollment_subjects (
  id              bigserial primary key,
  enrollment_id   bigint not null references enrollments(id) on delete cascade,
  subject_code    text not null,
  subject_name    text not null,
  units           int not null
);
```

### Table: `subjects`

Available subject pool for irregular student selection.

```sql
create table subjects (
  id           bigserial primary key,
  code         text not null unique,       -- e.g. 'IT101'
  name         text not null,
  units        int not null,
  year_level   text not null,              -- advisory only, not enforced
  program      text not null default 'BSIT'
);
```

### Table: `curricula`

Prescribed subject load per year level for regular students.

```sql
create table curricula (
  id           bigserial primary key,
  year_level   text not null,
  program      text not null,
  subject_code text not null,
  subject_name text not null,
  units        int not null
);
```

### Auto-update `updated_at`

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on enrollments
for each row execute procedure update_updated_at();
```

### Seed data

**Subjects**
```sql
insert into subjects (code, name, units, year_level, program) values
  ('IT101', 'Introduction to Computing',         3, '1st Year', 'BSIT'),
  ('IT102', 'Computer Programming 1',            3, '1st Year', 'BSIT'),
  ('IT103', 'Mathematics in the Modern World',   3, '1st Year', 'BSIT'),
  ('IT201', 'Data Structures and Algorithms',    3, '2nd Year', 'BSIT'),
  ('IT202', 'Object-Oriented Programming',       3, '2nd Year', 'BSIT'),
  ('IT203', 'Database Management Systems',       3, '2nd Year', 'BSIT'),
  ('IT301', 'Web Systems and Technologies',      3, '3rd Year', 'BSIT'),
  ('IT302', 'Networks and Communications',       3, '3rd Year', 'BSIT'),
  ('IT401', 'Capstone Project 1',                3, '4th Year', 'BSIT'),
  ('IT402', 'Software Engineering',              3, '4th Year', 'BSIT');
```

**Curricula**
```sql
insert into curricula (year_level, program, subject_code, subject_name, units) values
  ('1st Year', 'BSIT', 'IT101', 'Introduction to Computing',       3),
  ('1st Year', 'BSIT', 'IT102', 'Computer Programming 1',          3),
  ('1st Year', 'BSIT', 'IT103', 'Mathematics in the Modern World', 3),
  ('2nd Year', 'BSIT', 'IT201', 'Data Structures and Algorithms',  3),
  ('2nd Year', 'BSIT', 'IT202', 'Object-Oriented Programming',     3),
  ('2nd Year', 'BSIT', 'IT203', 'Database Management Systems',     3),
  ('3rd Year', 'BSIT', 'IT301', 'Web Systems and Technologies',    3),
  ('3rd Year', 'BSIT', 'IT302', 'Networks and Communications',     3),
  ('4th Year', 'BSIT', 'IT401', 'Capstone Project 1',              3),
  ('4th Year', 'BSIT', 'IT402', 'Software Engineering',            3);
```

**Enrollments (demo rows)**
```sql
insert into enrollments (enr_number, full_name, student_id, student_type, year_level, program, status) values
  ('ENR-00001-MN-0', 'Alex Rivera',  '2024-10001', 'regular',   '2nd Year', 'BSIT', 'confirmed'),
  ('ENR-00002-MN-1', 'Jordan Lee',   '2024-10002', 'irregular', '3rd Year', 'BSIT', 'pending'),
  ('ENR-00003-MN-1', 'Morgan Patel', '2024-10003', 'irregular', '2nd Year', 'BSIT', 'confirmed'),
  ('ENR-00004-MN-0', 'Casey Nguyen', '2025-10004', 'regular',   '1st Year', 'BSIT', 'confirmed');
```

### RLS (Row Level Security)

For the demo, disable RLS on all tables:

```sql
alter table enrollments          disable row level security;
alter table enrollment_subjects  disable row level security;
alter table subjects             disable row level security;
alter table curricula            disable row level security;
```

---

## Supabase Client (`lib/supabase.ts`)

```ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl  = process.env.SUPABASE_URL!
const supabaseKey  = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

---

## Zod Schemas (`lib/schemas.ts`)

```ts
import { z } from "zod"

// ── Chat ──────────────────────────────────────────────────────────────
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500)
})

export const AIResponseSchema = z.object({
  answer: z.string(),
  source: z.string().nullable(),
  type:   z.enum(["info", "checklist", "unknown"]),
  items:  z.array(z.string()).nullable()
})

// ── Enrollment submission ──────────────────────────────────────────────
export const EnrollmentSchema = z.object({
  full_name:     z.string().min(2).max(100),
  student_id:    z.string().min(3).max(20),
  student_type:  z.enum(["regular", "irregular"]),
  year_level:    z.enum(["1st Year", "2nd Year", "3rd Year", "4th Year"]),
  program:       z.string().min(2).max(50),
  subject_codes: z.array(z.string()).optional()   // required only for irregular
}).refine(
  data => data.student_type !== "irregular" || (data.subject_codes && data.subject_codes.length > 0),
  { message: "Irregular students must select at least one subject", path: ["subject_codes"] }
)

// ── Admin status update ────────────────────────────────────────────────
export const UpdateEnrollmentSchema = z.object({
  status: z.enum(["confirmed", "rejected"])
})

// ── Inferred types ─────────────────────────────────────────────────────
export type ChatRequest        = z.infer<typeof ChatRequestSchema>
export type AIResponse         = z.infer<typeof AIResponseSchema>
export type EnrollmentRequest  = z.infer<typeof EnrollmentSchema>
export type UpdateEnrollment   = z.infer<typeof UpdateEnrollmentSchema>
```

---

## API Endpoints — Full Contract

All routes live in `app/api/`. All request and response bodies are JSON.
Error responses always follow `{ error: string }`.

---

### `POST /api/chat`

**Purpose:** Accept a student's message, return an AI response from the knowledge base.

**Request body**
```json
{ "message": "What subjects can I take as an irregular student?" }
```

**Response `200` — matched**
```json
{
  "answer": "Irregular students may select from the available subject pool...",
  "source": "Irregular Student Enrollment",
  "type": "checklist",
  "items": ["IT101 — Introduction to Computing", "IT201 — Data Structures", "..."]
}
```

**Response `200` — unknown question**
```json
{
  "answer": "I don't have information about that. Please contact the Registrar's Office directly.",
  "source": null,
  "type": "unknown",
  "items": null
}
```

**Response `400`** — invalid body
```json
{ "error": "Invalid request body" }
```

**Auth:** None

---

### `GET /api/subjects`

**Purpose:** Return the full available subject pool. Used to populate the `SubjectPicker` for irregular students.

**Response `200`**
```json
[
  { "code": "IT101", "name": "Introduction to Computing", "units": 3, "year_level": "1st Year", "program": "BSIT" },
  { "code": "IT201", "name": "Data Structures and Algorithms", "units": 3, "year_level": "2nd Year", "program": "BSIT" }
]
```

**Auth:** None

---

### `POST /api/enrollments`

**Purpose:** Submit a new enrollment. Regular students are auto-confirmed with the prescribed curriculum. Irregular students are set to pending with their chosen subjects.

**Request body**
```json
{
  "full_name":     "Sam Torres",
  "student_id":   "S10099",
  "student_type": "irregular",
  "year_level":   "2nd Year",
  "program":      "BSIT",
  "subject_codes": ["IT101", "IT203", "IT301"]
}
```

**Response `201` — irregular student**
```json
{
  "enr_number": "ENR-00005-MN-1",
  "status":     "pending",
  "subjects": [
    { "code": "IT101", "name": "Introduction to Computing", "units": 3 },
    { "code": "IT203", "name": "Database Management Systems", "units": 3 },
    { "code": "IT301", "name": "Web Systems and Technologies", "units": 3 }
  ]
}
```

**Response `201` — regular student** (no `subject_codes` in request)
```json
{
  "enr_number": "ENR-00006-MN-0",
  "status":     "confirmed",
  "subjects": [
    { "code": "IT201", "name": "Data Structures and Algorithms", "units": 3 },
    { "code": "IT202", "name": "Object-Oriented Programming", "units": 3 },
    { "code": "IT203", "name": "Database Management Systems", "units": 3 }
  ]
}
```

**Response `400`** — validation error
```json
{ "error": "Irregular students must select at least one subject" }
```

**Response `500`** — database error
```json
{ "error": "Failed to create enrollment" }
```

**Auth:** None

**ENR number generation logic** (in `lib/utils.ts`):
```ts
export function generateEnrNumber(id: number, studentType: "regular" | "irregular"): string {
  const seq  = String(id).padStart(5, "0")
  const flag = studentType === "regular" ? "0" : "1"
  return `ENR-${seq}-MN-${flag}`
}
```
Insert the row first (Supabase returns the `id`), then update `enr_number` using `generateEnrNumber(id, student_type)`.

---

### `GET /api/enrollments/[enr]`

**Purpose:** Fetch the status and full detail of a single enrollment by ENR number. Used by the student tracking page.

**URL param:** `enr` — e.g. `ENR-00005-MN-1`

**Response `200`**
```json
{
  "enr_number":    "ENR-00005-MN-1",
  "full_name":     "Sam Torres",
  "student_type":  "irregular",
  "year_level":    "2nd Year",
  "program":       "BSIT",
  "semester":      "1st Semester",
  "academic_year": "2025-2026",
  "status":        "pending",
  "subjects": [
    { "code": "IT101", "name": "Introduction to Computing", "units": 3 },
    { "code": "IT203", "name": "Database Management Systems", "units": 3 }
  ],
  "created_at": "2025-07-01T10:23:00Z",
  "updated_at": "2025-07-01T10:23:00Z"
}
```

**Response `404`**
```json
{ "error": "Enrollment not found" }
```

**Auth:** None

---

### `GET /api/enrollments`

**Purpose:** List all enrollments for the admin dashboard.

**Response `200`**
```json
[
  {
    "enr_number":   "ENR-00001-MN-0",
    "full_name":    "Alex Rivera",
    "student_id":  "2024-10001",
    "student_type": "regular",
    "year_level":   "2nd Year",
    "program":      "BSIT",
    "status":       "confirmed",
    "created_at":   "2025-07-01T09:00:00Z"
  }
]
```

**Response `403`** — missing or wrong demo header
```json
{ "error": "Staff access required" }
```

**Auth:** `x-demo-role: staff` header required

---

### `PATCH /api/enrollments/[enr]`

**Purpose:** Confirm or reject a pending enrollment (admin only).

**URL param:** `enr` — e.g. `ENR-00002-MN-1`

**Request body**
```json
{ "status": "confirmed" }
```

**Response `200`**
```json
{
  "enr_number": "ENR-00002-MN-1",
  "status":     "confirmed",
  "updated_at": "2025-07-01T15:30:00Z"
}
```

**Response `400`** — invalid status value
```json
{ "error": "Invalid status value" }
```

**Response `403`** — missing demo header
```json
{ "error": "Staff access required" }
```

**Response `404`**
```json
{ "error": "Enrollment not found" }
```

**Auth:** `x-demo-role: staff` header required

---

## Demo Auth Pattern

No real auth. `RoleProvider` in the root layout stores an `isStaff` boolean. `RoleToggle` appears in the student and admin headers and changes that demo role; it does not navigate between routes. The `/admin` page shows an access message and a link back to `/` when `isStaff` is false. Admin API calls from the frontend attach:

```ts
headers: { "x-demo-role": "staff" }
```

The API routes check:

```ts
if (request.headers.get("x-demo-role") !== "staff") {
  return Response.json({ error: "Staff access required" }, { status: 403 })
}
```

This is cosmetic protection only — suitable for a demo.

---

## AI Knowledge Base & Matcher

### `lib/kb.json` structure

Each entry has: `id`, `title`, `keywords[]`, `content`, `type`, and optionally `items[]` for checklists.

The matcher in `lib/ai.ts` iterates entries and returns the first whose `keywords` array contains a word found in the lowercased user message. If no match, returns the "unknown" fallback.

**Entries to write:**

| id | title | type | Keywords (sample) |
|---|---|---|---|
| `enrollment_overview` | Enrollment Overview | info | how, start, enroll, process, steps |
| `regular_student` | Regular Student Enrollment | info | regular, prescribed, curriculum, auto, assigned |
| `irregular_student` | Irregular Student Enrollment | info | irregular, back subject, custom, pick, choose |
| `subject_selection` | Choosing Subjects | checklist | subjects, available, pick, units, load, how many |
| `approval_process` | Approval Process | info | approve, pending, confirm, wait, review, staff |
| `enrollment_status` | Tracking Your Enrollment | info | track, status, check, number, ENR, where |
| `schedule` | Enrollment Schedule | info | when, open, deadline, period, dates, schedule |
| `requirements` | Requirements | checklist | need, bring, require, document, ID, what |

> Add more entries any time during the build — the matcher picks them up automatically.

---

## Component Responsibilities

| Component | Page | Data source | Notes |
|---|---|---|---|
| `ChatWindow` | `/chat` | `POST /api/chat` | Manages local message array in state |
| `ChecklistCard` | `/chat` | AI response `items[]` | Renders only when `type === "checklist"` |
| `SubjectPicker` | `/enroll` | `GET /api/subjects` | Shown only when `student_type === "irregular"` |
| `EnrollmentNumberReveal` | `/success` | URL search param `?enr=` | Animates on mount |
| `StatusTimeline` | `/track/[enr]` | `GET /api/enrollments/[enr]` | Highlights current step; handles confirmed/rejected branch |
| `AdminTable` | `/admin` | `GET /api/enrollments` | Confirm/Reject buttons; expandable row shows subject list |
| `RoleToggle` | Student and admin headers | React context | Changes demo `isStaff` state; `/admin` supplies the staff API header and gates its page content |

---

## React Bits — Animation Integration Rules

Install (pick one):

```bash
# Option A — copy-paste from reactbits.dev (preferred for hackathon speed)
# Option B — pnpm package if available
pnpm add react-bits
```

**4 animation spots — add only after core flow works end-to-end (Tier 3):**

| Spot | Suggested component | Fallback if removed |
|---|---|---|
| Hero headline | `TextPressure` or `BlurText` | Plain `<h1>` |
| Subject list (irregular picker) | Staggered `FadeContent` | Static `<ul>` |
| Enrollment number reveal | `CountUp` or `GlitchText` | Static `<p>` |
| Status timeline steps | Step-reveal with CSS transition | Static list |

**Hard rules:**
- Wrap every React Bits component in a `try/catch` or error boundary
- Always render the content without animation first, then layer animation on top
- Add `@media (prefers-reduced-motion: reduce)` skip logic to each animation component
- Never put animation state in a loading/data-fetch path

---

## Coding Conventions

### Next.js — Data Access Rules

These rules apply to every file in this project. Bob must follow them without exception.

**1. Never import `supabase` outside of API route handlers.**

`lib/supabase.ts` must only be imported inside `app/api/**/route.ts` files. Never import it in:
- Page components (`app/**/page.tsx`)
- Client components (`components/**/*.tsx`)
- `lib/ai.ts` or any other lib file
- `types/index.ts`

```ts
// ✅ CORRECT — supabase used inside an API route handler
// app/api/enrollments/route.ts
import { supabase } from "@/lib/supabase"
export async function GET() {
  const { data } = await supabase.from("enrollments").select("*")
  // ...
}

// ❌ WRONG — supabase imported in a page component
// app/track/[enr]/page.tsx
import { supabase } from "@/lib/supabase"  // never do this
```

**2. Pages fetch data by calling their own API routes, not Supabase directly.**

All data flows through the API layer. Pages call `fetch("/api/enrollments/[enr]")` — they do not reach into Supabase themselves.

```ts
// ✅ CORRECT — page calls the API route
const res  = await fetch(`/api/enrollments/${enr}`)
const data = await res.json()

// ❌ WRONG — page calls Supabase directly
const { data } = await supabase.from("enrollments").select("*").eq("enr_number", enr)
```

**3. Never import server-only modules in client components.**

Any file with `"use client"` at the top must not import `@supabase/supabase-js`, `lib/supabase.ts`, or any Node.js-only module.

**4. Keep `lib/ai.ts` pure — no I/O, no side effects.**

`getAIResponse()` in `lib/ai.ts` takes a string and returns an `AIResponse`. It reads from `lib/kb.json` at import time. It must never make network calls, database calls, or write to any external state.

---

### API routes

```ts
// app/api/enrollments/route.ts — pattern to follow for all routes
import { NextRequest } from "next/server"
import { EnrollmentSchema } from "@/lib/schemas"
import { supabase } from "@/lib/supabase"
import { generateEnrNumber } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = EnrollmentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  // ... insert to supabase
}
```

### Client components

- Use `"use client"` only on components that need browser APIs or event handlers
- Keep data fetching in server components where possible (`page.tsx`)
- Pass data down as props to keep client components pure and testable

### Naming
- Files: `PascalCase` for components, `camelCase` for lib files
- Database columns: `snake_case` (match Supabase defaults)
- TypeScript types: `PascalCase`
- Zod schemas: `PascalCaseSchema`

### Error states every page needs
- Loading state (Skeleton or spinner)
- Error state (short message + retry or contact info)
- Empty state (for admin table when no enrollments exist)

---

## Testing

> Bob owns all test scripts. When asked to write a test, Bob will create the file, wire it to the correct test runner command, and make it runnable with a single `pnpm` command.

### Test runner setup

```bash
pnpm add -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

Add to `package.json`:

```json
"scripts": {
  "test":        "vitest run",
  "test:watch":  "vitest",
  "test:ui":     "vitest --ui",
  "test:filter": "vitest run --reporter=verbose"
}
```

Add `vitest.config.ts` at project root:

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles:  ["./tests/setup.ts"],
    globals:     true
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") }
  }
})
```

Add `tests/setup.ts`:

```ts
import "@testing-library/jest-dom"
```

### Test file locations

```
tests/
├── setup.ts                        # global test setup (jest-dom matchers)
├── lib/
│   ├── ai.test.ts                  # unit tests for getAIResponse()
│   ├── schemas.test.ts             # unit tests for all Zod schemas
│   └── utils.test.ts               # unit tests for generateEnrNumber()
├── api/
│   ├── chat.test.ts                # POST /api/chat
│   ├── subjects.test.ts            # GET /api/subjects
│   ├── enrollments.test.ts         # POST /api/enrollments · GET /api/enrollments
│   └── enrollments-enr.test.ts     # GET /api/enrollments/[enr] · PATCH /api/enrollments/[enr]
└── components/
    ├── ChatWindow.test.tsx
    ├── ChecklistCard.test.tsx
    ├── SubjectPicker.test.tsx
    └── StatusTimeline.test.tsx
```

### Run commands

```bash
pnpm test                                       # run all tests once
pnpm test:watch                                 # watch mode during development
pnpm --filter @bobhackathon/web test            # run web package tests only (monorepo)
pnpm test -- tests/lib/ai.test.ts               # run a single test file
```

### What Bob tests for each area

#### `tests/lib/ai.test.ts` — AI matcher
Bob will write tests that cover:
- Known keyword match returns the correct KB entry (`answer`, `source`, `type`)
- Checklist keyword returns `type: "checklist"` and a non-null `items` array
- Unknown message returns `type: "unknown"`, `source: null`, `items: null`
- Message casing does not affect matching (uppercase, mixed case)
- Empty string returns `type: "unknown"`

#### `tests/lib/schemas.test.ts` — Zod validation
Bob will write tests that cover:
- `EnrollmentSchema` passes for a valid regular student (no `subject_codes`)
- `EnrollmentSchema` passes for a valid irregular student with `subject_codes`
- `EnrollmentSchema` fails when `student_type: "irregular"` but no `subject_codes`
- `EnrollmentSchema` fails on missing required fields (`full_name`, `student_id`, etc.)
- `UpdateEnrollmentSchema` accepts `"confirmed"` and `"rejected"`
- `UpdateEnrollmentSchema` rejects any other string
- `ChatRequestSchema` rejects an empty message string

#### `tests/lib/utils.test.ts` — utilities
Bob will write tests that cover:
- `generateEnrNumber(1, "regular")` returns `"ENR-00001-MN-0"`
- `generateEnrNumber(42, "irregular")` returns `"ENR-00042-MN-1"`
- IDs above 99999 are not truncated

#### `tests/api/chat.test.ts` — chat route
Bob will write tests that cover:
- `POST /api/chat` with a known keyword returns `200` and a valid `AIResponse`
- `POST /api/chat` with an unknown message returns `200` and `type: "unknown"`
- `POST /api/chat` with an empty body returns `400`

#### `tests/api/subjects.test.ts` — subjects route
Bob will write tests that cover:
- `GET /api/subjects` returns `200` with an array of subjects
- Each subject has `code`, `name`, `units`, `year_level`, `program`

#### `tests/api/enrollments.test.ts` — enrollment submit + list
Bob will write tests that cover:
- `POST /api/enrollments` (regular) returns `201`, `status: "confirmed"`, subjects from curricula
- `POST /api/enrollments` (irregular) returns `201`, `status: "pending"`, subjects = selected
- `POST /api/enrollments` (irregular, no subjects) returns `400` with validation message
- `POST /api/enrollments` (missing required fields) returns `400`
- `GET /api/enrollments` with `x-demo-role: staff` header returns `200` array
- `GET /api/enrollments` without the header returns `403`

#### `tests/api/enrollments-enr.test.ts` — single enrollment
Bob will write tests that cover:
- `GET /api/enrollments/ENR-00001-MN-0` returns `200` with correct shape including `subjects[]`
- `GET /api/enrollments/ENR-99999-MN-1` returns `404`
- `PATCH /api/enrollments/ENR-00002-MN-1` with `{ status: "confirmed" }` + staff header returns `200`
- `PATCH /api/enrollments/ENR-00002-MN-1` with `{ status: "rejected" }` + staff header returns `200`
- `PATCH /api/enrollments/ENR-00002-MN-1` without staff header returns `403`
- `PATCH /api/enrollments/ENR-00002-MN-1` with invalid status returns `400`

#### `tests/components/ChatWindow.test.tsx` — chat UI
Bob will write tests that cover:
- Renders empty message list on mount
- Input is disabled while a message is loading
- Submitting a message adds it to the message list
- Source citation is displayed when `source` is non-null
- "I don't know" message is rendered when `type: "unknown"`

#### `tests/components/ChecklistCard.test.tsx` — checklist
Bob will write tests that cover:
- Renders nothing when `items` is null
- Renders a list item for each entry in `items`
- Does not render when `type !== "checklist"`

#### `tests/components/SubjectPicker.test.tsx` — subject picker
Bob will write tests that cover:
- Renders a list of subjects passed as props
- Checking a subject adds it to the selected set
- Unchecking a subject removes it from the selected set
- Calls `onChange` with the updated `subject_codes` array

#### `tests/components/StatusTimeline.test.tsx` — status display
Bob will write tests that cover:
- All status steps are rendered (`pending`, `confirmed` / `rejected`)
- The current status step is visually marked (active class or aria attribute)
- `confirmed` and `rejected` branches are both handled without crashing

### Bob's test-writing rules
1. Bob writes tests in the same task as the feature, not after
2. Tests use the same Zod schemas from `lib/schemas.ts` — no inline shape redefinitions
3. API tests mock Supabase calls — they do not hit the real database
4. Component tests use `@testing-library/react` — no Enzyme, no snapshot-only tests
5. Every test file must be runnable with `pnpm test -- tests/<path>`

---

## AI Context — How Bob Understands This Project

> This section is written for Bob (and any AI coding assistant). Read this before touching any file.

### What this project is

CampusAssist AI is a **Next.js + TypeScript + Supabase** web app for student enrollment. A student fills in an enrollment form, identifies as regular or irregular, receives an ENR number, and tracks their status. Irregular students select subjects and wait for staff approval. Staff confirm or reject pending enrollments in an admin dashboard. There is no real authentication.

### What the AI inside the app does

The in-app AI chatbot (`lib/ai.ts`) is **not a language model**. It is a keyword matcher over `lib/kb.json`. It returns a typed `AIResponse` object. It never calls an external API. It never guesses. It always cites a source field from the KB entry. If no KB entry matches, it returns `type: "unknown"` with a safe fallback message.

### Files to read before writing any code

| File | Why |
|---|---|
| `enrollment-plan.md` | Full product scope, user flows, status machine, team split, timeline |
| `agents.md` | This file — stack, commands, DB schema, endpoint contracts, conventions |
| `lib/schemas.ts` | All Zod schemas — use these, don't invent new ones |
| `types/index.ts` | All shared TypeScript types — use these, don't redefine |
| `lib/kb.json` | Knowledge base entries — the AI chatbot's only source of truth |

### Constraints Bob must never break

1. **Do not add real authentication.** The demo role header (`x-demo-role: staff`) is sufficient.
2. **Do not call external AI APIs** (OpenAI, Anthropic, etc.) — the matcher in `lib/ai.ts` is the only AI.
3. **Do not add new Zod schemas** without adding them to `lib/schemas.ts`.
4. **Do not add new TypeScript types** without adding them to `types/index.ts`.
5. **Do not change the `enr_number` format** (`ENR-NNNNN-MN-0/1`) — it is shown to users and used in URLs. `0` = regular, `1` = irregular.
6. **Do not change existing API response shapes** — frontend and backend are coupled to the contracts in this file.
7. **One thing at a time.** Write one component or one route per task. Do not refactor unrelated code.
8. **Never import `lib/supabase.ts` outside of `app/api/**/route.ts` files.** Pages and components call the API layer — they never touch Supabase directly. See Data Access Rules in Coding Conventions.
9. **Bob owns all test scripts.** Every feature Bob writes must be accompanied by the corresponding test file in `tests/`. See the Testing section for file locations and coverage requirements.

### How to answer questions about this project

- The knowledge base (`lib/kb.json`) is the source of truth for enrollment process questions.
- The Zod schemas in `lib/schemas.ts` are the source of truth for data shapes.
- The endpoint contracts in the **API Endpoints** section of this file are the source of truth for request/response formats.
- If a question is about something not covered by these files, say so — do not guess.

---

## How to Work With Bob During the Build

### Task format for Bob

```
Bob, write [ComponentName] that does [specific behaviour].
Props: [list props and types].
It calls [endpoint or function].
Use the Zod schema [SchemaName] from lib/schemas.ts.
Do not add anything beyond what I described.
```

### Error format for Bob

```
Bob, this error appeared:
[paste full error message and stack]
Relevant file: [path]
Fix only this error.
```

### Review format for Bob

```
Bob, review [file path] for correctness.
Do not rewrite it. Tell me if anything is wrong with [specific concern].
```

### Rules
1. One component or one route per request — not "write the whole app"
2. Always read the diff before accepting
3. Commit after each working feature
4. Decide field names and shapes yourself first — don't ask Bob to guess
5. If Bob adds something you didn't ask for, say "remove the part that does X"

---

## Suggested Additions (Beyond the MVP)

The following are low-cost improvements ordered by value-to-effort ratio. Add only after all Tier 1 must-haves are working.

| Addition | Effort | Value |
|---|---|---|
| **Copy-to-clipboard** on enrollment number | 5 min | High — improves demo UX |
| **Status badge colours** on admin table (colour-coded chips) | 10 min | High — makes statuses scannable at a glance |
| **"What can I ask?" prompt chips** below chat input (3 preset questions) | 15 min | High — guides judges through the AI demo |
| **Optimistic status update** in admin — update UI before API confirms | 20 min | Medium — feels polished |
| **`/track` standalone search form** — enter ENR number without knowing the URL | 20 min | Medium — more realistic student flow |
| **Toast notifications** (shadcn/ui Toast) on form submit and status update | 15 min | Medium — standard UX feedback |
| **README.md** with setup instructions and a screenshot | 20 min | High — judges read the repo |
| **Admin enrollment count** summary bar (X pending, X confirmed) | 15 min | Low — nice-to-have dashboard polish |

---

## Pre-Build Verification Checklist

Before starting the clock:

- [ ] `node -v` → 20+ on both machines
- [ ] `pnpm -v` → available on both machines (`npm i -g pnpm` if not)
- [ ] Supabase project created, URL and anon key copied
- [ ] Git repo initialised, both developers have push access
- [ ] `.env.local` template shared (not committed)
- [ ] Both developers have read `enrollment-plan.md` and `agents.md`
- [ ] Demo laptop decided — deploy to Vercel, demo from URL not localhost
- [ ] shadcn/ui component list agreed: Button, Input, Select, Checkbox, Badge, Table, Card, Skeleton, Toast

---

## Admin Experience — PUPILA (feat/admin-v2)

> Status: **Phase 0 safe branch/base verified · Phase 1 route isolation and shell implemented, final verification pending · Phases 2–5 not started**. The branch contains one Phase 1 commit and uncommitted follow-up fixes; no separate Phase 0 artifact or completed visual check has been verified here.

### What is implemented (Phase 0–1)

The admin shell lives exclusively under `/admin`. It uses **PUPILA branding** — distinct from the student-side CampusAssist branding. Student page files were moved into the `(student)` route group without changing their public URLs or enrollment workflow; API contracts were not changed by this admin branch.

#### Route layout isolation

```
app/layout.tsx              → RoleProvider only (no header, no sidebar)
app/(student)/layout.tsx    → Student nav: CampusAssist AI header + Enroll/Ask AI links + RoleToggle
app/admin/layout.tsx        → Renders PupilaAdminShell (PUPILA header + sidebar + AI panel)
```

The `(student)` route group is a Next.js App Router convention: the group name is stripped from URLs. Student URLs remain `/`, `/enroll`, `/chat`, `/success`, and `/track/[enr]` — unchanged.

#### PupilaAdminShell (`components/PupilaAdminShell.tsx`)

- **Header (64px):** PUPILA brand mark (red square + cap icon) + "PUPILA" wordmark, `RoleToggle`, AI panel toggle (xl only), avatar icon
- **Sidebar (232px):** Semester context line, nav items (see below), "Enrollment Portal" footer
- **Content area:** `pupila-bg` background, responsive padding
- **Right AI panel (340px):** "PUPILA AI Assistant" header, `ChatWindow`, disclaimer. Visible on `/admin` only; hidden below `xl` breakpoint and on future `/admin/reports`

#### Sidebar nav items (Phase 1)

| Label | Element | Destination | Active when |
|---|---|---|---|
| Dashboard | `<Link>` | `/admin` | `pathname === "/admin"` |
| Requests | `<span aria-disabled>` | None (Phase 2) | Never (disabled label) |
| Reports | `<Link>` (conditional in shell) | `/admin/reports` | Would render only on that route; the page does not exist yet |

Requests is intentionally a disabled `<span>`, not a link, until Phase 2 adds the view. Schedule from the prototype has no backend and does not appear in nav.

#### Demo view-switch behaviour

The `RoleToggle` button (in the PUPILA header) switches `isStaff` in `RoleContext`. Behaviour:

| State | On `/admin` |
|---|---|
| `isStaff = true` | Full enrollment dashboard renders |
| `isStaff = false` | Lock screen with "← Back to student portal" link to `/` |

Selecting "Student View" from `/admin` currently changes the role but **does not navigate**. The admin page then displays the lock screen with a separate link to `/`. From a student page, the toggle changes the role but also does not navigate; the user must follow the Admin link to `/admin`. This is an open Phase 1 UX correction, not a completed direct view-switch journey.

#### PUPILA colour tokens (`tailwind.config.ts`)

```ts
"pupila-bg":        "#fbf8f5",
"pupila-card":      "#fffefd",
"pupila-ink":       "#2b1716",
"pupila-mute":      "#74635e",
"pupila-line":      "#eadfd8",
"pupila-brand":     "#971b1f",
"pupila-tint":      "#f9e9e5",
"pupila-soft":      "#f6eee8",
"pupila-gold":      "#f5b400",
"pupila-gold-soft": "#fff2c7",
"pupila-green":     "#1f8a5b",
```

These are named in the `pupila-*` namespace and currently used by the admin shell and access state. The existing admin dashboard/table and chat widget still use their original styling.

### What is NOT yet implemented

| Feature | Phase | Notes |
|---|---|---|
| Dashboard stat cards (real data, PUPILA visual) | Phase 2 | Current admin page uses the old base design |
| Requests view (two-column list + detail panel) | Phase 2 | AdminTable is functional; PUPILA reskin pending |
| Confirm/Reject with inline error + state-machine guard | Phase 3 | PATCH API works; alert() replacement and 409 guard pending |
| Reports page (`/admin/reports`) | Phase 4 | No page exists yet; nav link is conditional |
| CSV export | Phase 4 | Native Blob only; no CDN scripts |
| Schedule view | Deferred | No schedules table, no backend |
| Rejection reason field | Deferred | No DB column; not in schema |
| "Verify with AI" | Never | Requires external LLM API — violates project constraints |

### Phase 1 exit checks still required

- Verify the role-switch journey so "Student View" from `/admin` reaches the student side directly, or explicitly approve the current two-click lock-screen behavior.
- Run the focused admin tests, TypeScript check, lint, and desktop/mobile route checks after the uncommitted fixes are finalized.
- Keep student/login teammate changes separate; coordinate edits to shared layouts or `RoleToggle` before merging.

### Test files (admin)

| File | Coverage |
|---|---|
| `tests/components/PupilaAdminShell.test.tsx` | Shell branding, nav links, AI panel, hamburger, sidebar footer |
| `tests/components/AdminPage.test.tsx` | Not-staff lock screen, back-to-student link, table not shown |

### Source-of-truth reminder

For implementation details, check the current code before following historical examples in this document. In particular, `lib/utils.ts` defines the ENR format, `lib/schemas.ts` validates student IDs, and `lib/supabase.ts` defines the server-only environment variable names.

---

*Keep this file open during the build. Update the endpoint contracts if anything changes so both developers stay in sync.*
