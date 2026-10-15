# CampusAssist AI — Enrollment Plan (Regular & Irregular Students)

> **2 people · 2 days · One workflow done well**
> Stack: Next.js (TypeScript) · Tailwind · shadcn/ui · Supabase · Zod · React Bits
> 📎 See [`agents.md`](agents.md) for bootstrap commands, full endpoint contracts, component map, and Bob task format.

> **Current admin rebuild checkpoint (`feat/admin-v2`):** Phases 0–3 are implemented. The admin shell is isolated, the dashboard and requests view use live enrollment data, and review actions enforce pending irregular transitions. Phase 4 reports/export and Phase 5 final visual polish remain. The original MVP tiers and timeline below describe product intent, not a verified completion report.

---

## 1. Overview

**Goal:** Build a working student enrollment portal for a single college department — BSIT — that handles two student types with different flows and an approval gate for irregular students.

**MVP definition:** The system is "done" when a student can enroll, receive an enrollment number, track their status, and a staff member can confirm or reject a pending irregular enrollment — all without errors. Everything else is polish.

> **Assumption:** All subject names, unit counts, curricula, and policies are invented for demo purposes. They do not reflect any real university's actual curriculum.

---

## 2. Problem & Scope

### Problem
Students don't know whether they are regular or irregular, what subjects they should enroll in, or how the approval process works. Staff spend time manually explaining policies and chasing incomplete enrollment submissions.

### What CampusAssist AI does
- Identifies the student as **regular** or **irregular** at the start of enrollment
- **Regular students** are auto-assigned the prescribed curriculum for their year level and program — enrollment is confirmed automatically
- **Irregular students** select from an available subject list and submit for staff approval
- An AI assistant answers enrollment process questions from a curated knowledge base
- A staff member (demo role) confirms or rejects pending irregular enrollments
- Students can track the status of their enrollment submission

### What we are NOT building
| Out of scope | Reason |
|---|---|
| Real authentication / OAuth | Adds hours; use a demo role-switch toggle instead |
| Pre-requisite checking | Too complex for 2 days; all subjects are available by default |
| Unit load enforcement (min/max units) | Not enforced in demo |
| File upload / document submission | Out of scope |
| Email or SMS notifications | No infra time |
| Multiple departments or programs | One program per demo |
| Payment / assessment fees | Fake display only |
| WCAG accessibility audit | Best-effort only |
| Mobile-first responsive polish | Desktop demo is fine |
| Production security hardening | This is a demo, not a live system |

---

## 3. Key Concepts & Rules

### Student Types
| Type | Definition | Enrollment Flow |
|---|---|---|
| **Regular** | Follows the prescribed curriculum for their year level | Auto-assigned subjects → auto-confirmed immediately |
| **Irregular** | Has back subjects, shifted programs, or a custom load | Picks subjects from available list → pending staff approval |

### Enrollment Status Machine
```
[regular]   submit  →  confirmed  (terminal)
[irregular] submit  →  pending  →  confirmed  (terminal)
                              └─→  rejected   (terminal)
```
Regular enrollments are inserted directly as `confirmed`. Irregular enrollments start as `pending`.

### Academic Context (fake demo data)
- **Program:** Bachelor of Science in Information Technology (BSIT)
- **Academic Year:** 2025–2026
- **Semester:** 1st Semester
- **Year levels:** 1st Year, 2nd Year, 3rd Year, 4th Year

---

## 4. User Flows

### 4.1 Regular Student Flow
```
Landing page  →  Enrollment form (name · ID · year level · program · type = Regular)
  │
  ▼  POST /api/enrollments
  System fetches prescribed curriculum for year level + program from curricula table
  Inserts enrollment (status = confirmed) + enrollment_subjects rows
  │
  ▼
Success screen  →  "You are enrolled!" + ENR number + auto-assigned subject list
  │
  ▼
/track/[enr]  →  Status: Confirmed
```

### 4.2 Irregular Student Flow
```
Landing page  →  Enrollment form (name · ID · year level · program · type = Irregular)
  │
  ▼  GET /api/subjects  (loads subject picker)
Subject picker  →  Student selects subjects from the available pool
  │
  ▼  POST /api/enrollments  (with subject_codes[])
  Inserts enrollment (status = pending) + enrollment_subjects rows
  │
  ▼
Success screen  →  "Pending approval" + ENR number + selected subject list
  │
  ▼
/track/[enr]  →  Status: Pending → (after staff action) Confirmed / Rejected
```

### 4.3 Staff (Admin) Flow
```
Role-switch toggle (header)  →  Staff View
  │
  ▼  GET /api/enrollments  (x-demo-role: staff)
/admin dashboard  →  Current enrollments table (Pending / All filter)
  │
  ▼  click row
Expanded table row  →  Subject list (not a separate detail panel)
  "Confirm" / "Reject" button  →  PATCH /api/enrollments/[enr]  (x-demo-role: staff)
  │
  ▼
Status updates in table + reflected on student's tracking page
```

### 4.4 AI Assistant Flow
```
Student clicks "Ask AI" / navigates to /chat
  │
  ▼  POST /api/chat
Keyword matcher  →  returns AIResponse from kb.json
  type = "checklist"  →  renders ChecklistCard
  type = "info"       →  renders plain answer + source citation
  type = "unknown"    →  renders "I don't know" fallback
```

### 4.5 Enrollment Number Format
```
ENR-{5-digit zero-padded sequence}-MN-{0|1}
Example: ENR-00042-MN-1  (0 = regular, 1 = irregular)
```
Generated server-side using the inserted row ID and student type via `generateEnrNumber(id, studentType)`.

---

## 5. MVP Build Priority

The build is split into three tiers. **Do not start Tier 2 until Tier 1 is end-to-end working. Do not start Tier 3 until Tier 2 is stable.**

### Tier 1 — MVP Core (must ship; blocks everything else)

**Infrastructure**
- [ ] Next.js project scaffolded, Tailwind + shadcn/ui initialised, Supabase connected
- [ ] All 4 Supabase tables created with seed data (`enrollments`, `enrollment_subjects`, `subjects`, `curricula`)
- [ ] `lib/supabase.ts`, `lib/schemas.ts`, `lib/utils.ts`, `types/index.ts` written

**API layer** *(build all 6 endpoints before building any page)*
- [ ] `POST /api/chat` — keyword matcher live, returns `AIResponse`
- [ ] `GET /api/subjects` — returns full subject pool
- [ ] `POST /api/enrollments` — handles both regular (auto-confirm) and irregular (pending)
- [ ] `GET /api/enrollments/[enr]` — returns enrollment detail + subjects by ENR number
- [ ] `GET /api/enrollments` — returns all enrollments list (staff only, demo header)
- [ ] `PATCH /api/enrollments/[enr]` — confirms or rejects (staff only, demo header)

**Pages + components**
- [ ] Landing page with "Start Enrollment" CTA and "Ask AI" link
- [ ] `/enroll` — enrollment form (student info + type selector; subject picker shown for irregular)
- [ ] `/success` — enrollment number + subject list reveal
- [ ] `/track/[enr]` — status timeline (Pending → Confirmed / Rejected)
- [ ] `/admin` — enrollments table + confirm/reject actions
- [ ] `/chat` — AI chat interface with source citation and checklist rendering
- [ ] `RoleToggle` in header (Student ↔ Staff context)

**MVP gate:** All 6 API endpoints return correct JSON. Regular and irregular enrollment flows complete end-to-end without errors. Staff can confirm and reject. Tracking page reflects changes.

---

### Tier 2 — UX Completeness (ship after MVP gate is passed)

- [ ] Loading states on all data-fetching pages (Skeleton or spinner)
- [ ] Error states on all pages (short message + what to do)
- [ ] Empty state on admin table when no enrollments exist
- [ ] Form validation error messages displayed inline
- [ ] Status badge colours on admin table (colour-coded by status)
- [ ] Admin filter: "Pending" / "All" tab to surface irregular enrollments needing action
- [ ] Copy-to-clipboard on enrollment number
- [ ] "Pending count" badge on admin nav (how many need review)

---

### Tier 3 — Animations (ship only after Tier 2 is stable)

- [ ] React Bits hero headline animation (`TextPressure` or `BlurText`)
- [ ] React Bits staggered subject list fade-in (irregular picker)
- [ ] React Bits enrollment number reveal (`CountUp` or `GlitchText`)
- [ ] React Bits status timeline step reveal

**Hard rules for animations:**
- Wrap every React Bits component in a try/catch or error boundary
- Always render content without animation first, layer animation on top
- Respect `prefers-reduced-motion` — skip animations if set
- No animation should block form interaction or delay data display

---

## 6. API Endpoints — Full Contract

All routes live in `app/api/`. All request/response bodies are JSON.
All error responses follow `{ error: string }`.

---

### `POST /api/chat`

**Purpose:** Accept a student message, return a matched AI response from `lib/kb.json`.

**Request**
```json
{ "message": "What subjects can I take as an irregular student?" }
```

**Response 200 — matched**
```json
{
  "answer": "Irregular students may select from the available subject pool...",
  "source": "Irregular Student Enrollment",
  "type": "checklist",
  "items": ["IT101 — Introduction to Computing", "IT201 — Data Structures", "..."]
}
```

**Response 200 — no match**
```json
{
  "answer": "I don't have information about that. Please contact the Registrar's Office directly.",
  "source": null,
  "type": "unknown",
  "items": null
}
```

**Response 400**
```json
{ "error": "Invalid request body" }
```

**Auth:** None

---

### `GET /api/subjects`

**Purpose:** Return all available subjects for the irregular student subject picker.

**Response 200**
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

**Request**
```json
{
  "full_name":     "Sam Torres",
  "student_id":   "2024-10099",
  "student_type": "irregular",
  "year_level":   "2nd Year",
  "program":      "BSIT",
  "subject_codes": ["IT101", "IT203", "IT301"]
}
```

**Response 201**
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

**Response 201 — regular student (no subject_codes in request)**
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

**Response 400 — validation error**
```json
{ "error": "Irregular students must select at least one subject" }
```

**Response 500 — database error**
```json
{ "error": "Failed to create enrollment" }
```

**Auth:** None

---

### `GET /api/enrollments/[enr]`

**Purpose:** Fetch enrollment status and full detail for a given ENR number. Used by the student tracking page.

**URL param:** `enr` — e.g. `ENR-00005-MN-1`

**Response 200**
```json
{
  "enr_number":   "ENR-00005-MN-1",
  "full_name":    "Sam Torres",
  "student_type": "irregular",
  "year_level":   "2nd Year",
  "program":      "BSIT",
  "semester":     "1st Semester",
  "academic_year":"2025-2026",
  "status":       "pending",
  "subjects": [
    { "code": "IT101", "name": "Introduction to Computing", "units": 3 },
    { "code": "IT203", "name": "Database Management Systems", "units": 3 }
  ],
  "created_at": "2025-07-01T10:23:00Z",
  "updated_at": "2025-07-01T10:23:00Z"
}
```

**Response 404**
```json
{ "error": "Enrollment not found" }
```

**Auth:** None

---

### `GET /api/enrollments`

**Purpose:** List all enrollments for the admin dashboard.

**Response 200**
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

**Response 403 — missing or wrong demo header**
```json
{ "error": "Staff access required" }
```

**Auth:** `x-demo-role: staff` header required

---

### `PATCH /api/enrollments/[enr]`

**Purpose:** Confirm or reject a pending enrollment (admin only). Only valid for irregular enrollments in `pending` status.

**URL param:** `enr` — e.g. `ENR-00002-MN-1`

**Request**
```json
{ "status": "confirmed" }
```

**Response 200**
```json
{
  "enr_number": "ENR-00002-MN-1",
  "status":     "confirmed",
  "updated_at": "2025-07-01T15:30:00Z"
}
```

**Response 400 — invalid status value**
```json
{ "error": "Invalid status value" }
```

**Response 403 — missing demo header**
```json
{ "error": "Staff access required" }
```

**Response 404**
```json
{ "error": "Enrollment not found" }
```

**Auth:** `x-demo-role: staff` header required

---

## 7. Zod Schemas (`lib/schemas.ts`)

```ts
import { z } from "zod"

// ── Chat ─────────────────────────────────────────────────────────────
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500)
})

export const AIResponseSchema = z.object({
  answer: z.string(),
  source: z.string().nullable(),
  type:   z.enum(["info", "checklist", "unknown"]),
  items:  z.array(z.string()).nullable()
})

// ── Enrollment submission ─────────────────────────────────────────────
export const EnrollmentSchema = z.object({
  full_name:     z.string().min(2).max(100),
  student_id:    z.string().min(3).max(20),
  student_type:  z.enum(["regular", "irregular"]),
  year_level:    z.enum(["1st Year", "2nd Year", "3rd Year", "4th Year"]),
  program:       z.string().min(2).max(50),
  subject_codes: z.array(z.string()).optional()
}).refine(
  data => data.student_type !== "irregular" || (data.subject_codes && data.subject_codes.length > 0),
  { message: "Irregular students must select at least one subject", path: ["subject_codes"] }
)

// ── Admin status update ───────────────────────────────────────────────
export const UpdateEnrollmentSchema = z.object({
  status: z.enum(["confirmed", "rejected"])
})

// ── Inferred types ────────────────────────────────────────────────────
export type ChatRequest        = z.infer<typeof ChatRequestSchema>
export type AIResponse         = z.infer<typeof AIResponseSchema>
export type EnrollmentRequest  = z.infer<typeof EnrollmentSchema>
export type UpdateEnrollment   = z.infer<typeof UpdateEnrollmentSchema>
```

---

## 8. Shared Types (`types/index.ts`)

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
  source: string | null
  type:   "info" | "checklist" | "unknown"
  items:  string[] | null
}
```

---

## 9. Database Schema (Supabase)

### Table: `enrollments`
```sql
create table enrollments (
  id              bigserial primary key,
  enr_number      text not null unique,
  full_name       text not null,
  student_id      text not null,
  student_type    text not null check (student_type in ('regular', 'irregular')),
  year_level      text not null,
  program         text not null,
  semester        text not null default '1st Semester',
  academic_year   text not null default '2025-2026',
  status          text not null default 'pending'
                  check (status in ('pending', 'confirmed', 'rejected')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
```

### Table: `enrollment_subjects`
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
```sql
create table subjects (
  id           bigserial primary key,
  code         text not null unique,
  name         text not null,
  units        int not null,
  year_level   text not null,
  program      text not null default 'BSIT'
);
```

### Table: `curricula`
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

### Supabase RLS
```sql
alter table enrollments         disable row level security;
alter table enrollment_subjects  disable row level security;
alter table subjects             disable row level security;
alter table curricula            disable row level security;
```

---

## 10. AI Behaviour

### Design principle
The AI is a **retrieval + template engine, not a generative model**. No vector DB. No embeddings. Match the student's question against a hand-written JSON knowledge base and return a structured response.

### Knowledge base entries (`lib/kb.json`)

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

### AI rules
1. **Never confirm or reject** an enrollment — the AI has no authority over status
2. **Never guess** deadlines, fees, or subject availability — if not in KB, say "I don't know"
3. **Always cite source** — display `Source: {entry.title}` below every answer
4. **Checklist type** automatically triggers the `ChecklistCard` component
5. **No hallucination** — `lib/kb.json` is the only source of truth

---

## 11. Project Structure

```
campusassist-ai/
├── app/
│   ├── layout.tsx                        # Root layout: RoleProvider; no visual shell
│   ├── (student)/                       # Route group; URL paths stay unchanged
│   │   ├── layout.tsx                    # Student header, nav, and content wrapper
│   │   ├── page.tsx                      # Landing page + hero + CTAs (/)
│   │   ├── chat/page.tsx                 # AI chat interface (/chat)
│   │   ├── enroll/page.tsx               # Enrollment form (/enroll)
│   │   ├── success/page.tsx              # ENR number reveal (/success)
│   │   └── track/[enr]/page.tsx          # Status tracking (/track/[enr])
│   ├── admin/
│   │   ├── layout.tsx                    # PUPILA admin-only shell
│   │   └── page.tsx                      # Existing enrollment list + confirm/reject
│   └── api/
│       ├── chat/route.ts                 # POST /api/chat
│       ├── subjects/route.ts             # GET /api/subjects
│       └── enrollments/
│           ├── route.ts                  # POST /api/enrollments · GET /api/enrollments
│           └── [enr]/route.ts            # GET /api/enrollments/[enr] · PATCH /api/enrollments/[enr]
├── components/
│   ├── ui/                               # shadcn/ui components
│   ├── ChatWindow.tsx                    # Message list + input bar
│   ├── ChecklistCard.tsx                 # Renders AI checklist responses
│   ├── SubjectPicker.tsx                 # Multi-select subject list (irregular only)
│   ├── EnrollmentNumberReveal.tsx        # ENR number on success page
│   ├── StatusTimeline.tsx                # Status steps on tracking page
│   ├── AdminTable.tsx                    # Enrollments table + confirm/reject
│   ├── PupilaAdminShell.tsx              # Admin header, sidebar, and AI panel
│   └── RoleToggle.tsx                    # Student ↔ Staff context toggle
├── lib/
│   ├── ai.ts                             # getAIResponse(message): AIResponse
│   ├── kb.json                           # Enrollment knowledge base
│   ├── supabase.ts                       # Supabase client singleton
│   ├── schemas.ts                        # All Zod schemas
│   └── utils.ts                          # generateEnrNumber(), cn()
├── types/
│   └── index.ts
└── enrollment-plan.md
```

---

## 12. Component Responsibilities

| Component | Page | Data source | Notes |
|---|---|---|---|
| `ChatWindow` | `/chat` | `POST /api/chat` | Local message array in state; no page reload |
| `ChecklistCard` | `/chat` | AI `items[]` | Renders only when `type === "checklist"` |
| `SubjectPicker` | `/enroll` | `GET /api/subjects` | Shown only when `student_type === "irregular"` |
| `EnrollmentNumberReveal` | `/success` | URL param `?enr=` | Animates on mount |
| `StatusTimeline` | `/track/[enr]` | `GET /api/enrollments/[enr]` | Highlights current step; handles confirmed/rejected branch |
| `AdminTable` | `/admin` | `GET /api/enrollments` | Confirm/Reject buttons; expandable row shows subjects |
| `PupilaAdminShell` | `/admin` layout | `ChatWindow` for AI panel | Admin-only chrome; Dashboard and Requests links work |
| `RoleToggle` | Student and admin headers | React context | Changes demo role and navigates between `/` and `/admin` |

### Admin rebuild phases (separate from MVP tiers above)

| Phase | Scope | Current checkpoint |
|---|---|---|
| 0 | Safe branch/base and prototype inventory | Safe base verified; no separate Phase 0 artifact verified |
| 1 | Isolated admin shell, truthful navigation, view switch, tests | Implemented |
| 2 | Data-backed PUPILA dashboard and separate Requests view | Implemented |
| 3 | Review-action UX and state-machine checks | Implemented |
| 4 | Reports or export only where supported by real data | Not started; no `/admin/reports` page or schedule backend exists |
| 5 | Integration, regression, and demo polish | Not started |

Do not copy mock records, metrics, export behavior, or AI verification from the prototype into claims about implemented functionality. Coordinate shared layout and `RoleToggle` changes with teammates working on student and login pages.

---

## 13. Team Split

### Person A — Frontend & UX
- Landing page + hero
- Enrollment form (`/enroll`) — student info fields, type selector, subject picker conditional rendering
- Success page (`/success`) — ENR number display + subject list
- Status tracking page (`/track/[enr]`)
- Chat interface (`/chat`) + `ChecklistCard`
- React Bits animations (Tier 3, after Person B's APIs are stable)

### Person B — Backend & Data
- Supabase setup: all 4 tables + seed data
- `lib/supabase.ts`, `lib/ai.ts`, `lib/kb.json`, `lib/schemas.ts`, `lib/utils.ts`
- All 6 API routes (in order: `/api/subjects` → `/api/enrollments` POST → `/api/enrollments` GET → `/api/enrollments/[enr]` GET → `/api/enrollments/[enr]` PATCH → `/api/chat`)
- Admin dashboard (`/admin`) + `AdminTable` component

### Shared
- Initial Next.js + Tailwind + shadcn/ui + Supabase bootstrap (first 30 min, together)
- `types/index.ts` — agree on shapes before splitting
- Integration testing (Day 2 morning)
- Demo rehearsal (Day 2 afternoon)

---

## 14. Hour-by-Hour Timeline

| Hours | Person A | Person B | Milestone |
|---|---|---|---|
| 0:00–0:30 | Project bootstrap together | Project bootstrap together | Repo pushed, app runs locally |
| 0:30–1:00 | `types/index.ts` + landing page shell | `types/index.ts` + Supabase tables + seed | Shapes agreed; DB live |
| 1:00–2:00 | Enrollment form (student info + type selector UI) | `lib/supabase.ts` + `lib/ai.ts` + `lib/kb.json` + `lib/schemas.ts` | Form renders; AI matcher testable |
| 2:00–4:00 | Subject picker (`SubjectPicker`) + form wiring | `POST /api/enrollments` + `GET /api/subjects` | Both enrollment paths insert correctly |
| 4:00–6:00 | Success page + `/track/[enr]` | `GET /api/enrollments/[enr]` + `PATCH /api/enrollments/[enr]` | Student can track status |
| 6:00–8:00 | Chat interface UI + `ChecklistCard` | `GET /api/enrollments` + `POST /api/chat` + admin dashboard | All 6 endpoints live |
| 8:00–10:00 | **Integration** — connect pages to APIs, fix mismatches | **Integration** — fix mismatches, verify response shapes | Full flow works end-to-end |
| 10:00–11:00 | **⛔ MVP gate** — verify all Tier 1 checklist items | **⛔ MVP gate** — verify all Tier 1 checklist items | MVP confirmed |
| 11:00–13:00 | Tier 2: loading / error / empty states | Tier 2: status badge colours, admin filter, pending badge | UX completeness |
| 13:00–14:00 | **Sleep / break** | **Sleep / break** | — |
| 14:00–16:00 | Tier 3: React Bits animations | Seed data review; demo data polish | Animations live, graceful fallback |
| 16:00–17:00 | **⛔ Feature freeze** — no new features after this point | | |
| 17:00–19:00 | End-to-end QA (testing checklist below) | End-to-end QA | All must-haves verified |
| 19:00–20:00 | Bug fixes from QA only | Bug fixes from QA only | Stable build |
| 20:00–21:00 | Demo rehearsal (both, full run-through) | Demo rehearsal | Under 5 minutes |
| 21:00–22:00 | Pitch prep + README | Deploy to Vercel | Submission ready |
| 22:00–24:00 | Buffer: last fixes, final commit, submission | Buffer | ✅ Submitted |

---

## 15. Testing Checklist

### Tier 1 — MVP gate (must all pass before moving to Tier 2)
- [ ] `POST /api/enrollments` (regular) → 201, `status: confirmed`, subjects from curricula
- [ ] `POST /api/enrollments` (irregular) → 201, `status: pending`, subjects = selected
- [ ] `POST /api/enrollments` (irregular, no subjects) → 400 with validation message
- [ ] `GET /api/subjects` → 200, array of subjects
- [ ] `GET /api/enrollments/[enr]` (valid) → 200 with subjects array
- [ ] `GET /api/enrollments/[enr]` (invalid) → 404
- [ ] `GET /api/enrollments` (with staff header) → 200, array
- [ ] `GET /api/enrollments` (no header) → 403
- [ ] `PATCH /api/enrollments/[enr]` (confirm, staff header) → 200
- [ ] `PATCH /api/enrollments/[enr]` (reject, staff header) → 200
- [ ] `PATCH /api/enrollments/[enr]` (no header) → 403
- [ ] `PATCH /api/enrollments/[enr]` (invalid status) → 400
- [ ] `POST /api/chat` (known keyword) → 200, correct `type` and `source`
- [ ] `POST /api/chat` (unknown) → 200, `type: "unknown"`
- [ ] `POST /api/chat` (empty body) → 400
- [ ] Regular student flow: form → success → track shows `confirmed`
- [ ] Irregular student flow: form → subject picker → success → track shows `pending`
- [ ] Staff confirm: status updates to `confirmed` on tracking page
- [ ] Staff reject: status updates to `rejected` on tracking page

### Tier 2 — UX completeness
- [ ] Loading states present on all data-fetching pages
- [ ] Error state shown when API returns error
- [ ] Empty state shown on admin table when no enrollments
- [ ] Form inline validation errors visible
- [ ] ENR number with leading zeros and student-type suffix renders correctly (e.g. `ENR-00001-MN-0`)
- [ ] Very long student name does not break admin table layout

### Tier 3 — Animations
- [ ] Animations do not block form interaction
- [ ] Page is usable before animations complete
- [ ] `prefers-reduced-motion` disables animations

---

## 16. Demo Script (≤5 minutes)

> Practice this. Muscle memory beats panic.

1. **(0:00–0:30)** Open landing page. "A student needs to enroll for the semester. Our system handles two types of students differently."
2. **(0:30–1:00)** Click "Ask AI" → type: "How do I enroll?" → show answer with source citation.
3. **(1:00–1:30)** Type: "What do I need to prepare?" → show checklist card response.
4. **(1:30–2:30)** Click "Start Enrollment" → fill as **Regular** student (2nd Year, BSIT) → submit → show auto-confirmed ENR number + 3 auto-assigned subjects.
5. **(2:30–3:30)** Go back → fill as **Irregular** student → select 3 subjects → submit → show "Pending Approval" ENR number.
6. **(3:30–4:30)** Switch to Staff View → find the pending enrollment → click "Confirm" → switch back → refresh tracking → show "Confirmed".
7. **(4:30–5:00)** Ask something not in the KB → show "I don't know." Close: "The AI only answers from approved content — it never guesses."

---

## 17. Pitch Outline (2–3 minutes)

1. **Problem** (20 sec): Students are confused about enrollment — irregular students especially. Staff waste time on repetitive guidance.
2. **Solution** (30 sec): CampusAssist AI — recognises student type, auto-assigns regular students, guides irregular students through subject selection, routes pending approvals to staff, and lets students track their status.
3. **Live demo** (see §16)
4. **AI design choice** (30 sec): The AI cites its source, never guesses, and never takes action on enrollments. That matters in an academic context.
5. **Stack** (15 sec): Next.js, Supabase, Zod, shadcn/ui, React Bits. Deployed on Vercel.
6. **What's next** (20 sec): Add/drop workflow, grade viewing, real auth, multi-program, staff KB editor.

---

## 18. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase provisioning delay | Low | High | Create project during prep, before clock starts |
| Multi-step form state complexity | Medium | High | Single page with conditional rendering — not a router-based multi-step |
| API shapes drift between teammates | High | High | Agree on `types/index.ts` before splitting; never change response shapes without updating both files |
| React Bits animation breaks layout | Medium | Medium | Add animations last (Tier 3 only); wrap in error boundary |
| Integration bugs at hour 8 | High | High | Mock API responses locally during development; don't block each other |
| Scope creep ("let's add pre-req checking") | High | High | Refer to this plan. Feature freeze at hour 16. |
| Demo machine crashes | Low | High | Deploy to Vercel by hour 21; demo from URL not localhost |

---

## 19. "Done" Checklist

**MVP (Tier 1)**
- [ ] Regular student can enroll and is auto-confirmed with auto-assigned subjects
- [ ] Irregular student can select subjects and submit for pending approval
- [ ] Staff (demo role) can confirm or reject irregular enrollments
- [ ] Status change reflected on student tracking page immediately
- [ ] All 6 API endpoints respond correctly (see §6)
- [ ] AI assistant answers enrollment questions with source citations
- [ ] AI says "I don't know" for out-of-scope questions
- [ ] ENR number format correct: `ENR-YYYY-XXXX`

**Ship-ready**
- [ ] No hardcoded secrets in the repo (`.env.local` only)
- [ ] App deployed and accessible via a public Vercel URL
- [ ] Demo script rehearsed at least once end-to-end
- [ ] README explains what the project is and how to run it locally
- [ ] `enrollment-plan.md` is in the repo root ✅

---

*This plan is a living document. Update it as decisions are made. Mark assumptions clearly. One workflow done well is the goal.*
