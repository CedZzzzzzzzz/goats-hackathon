# CampusAssist AI — Agent & Technical Reference

> This file is the working reference for Bob (AI coding assistant) and both developers during the hackathon build.
> Read `plan.md` for the full product scope, timeline, and demo script.
> This file covers: project bootstrap, tech stack, folder layout, all endpoints with contracts, component map, and coding conventions.

---

## Project Overview

**CampusAssist AI** is a student services demo tool for a single campus workflow — requesting an **Enrollment Verification Letter**. A student chats with an AI assistant that explains the process (from a hand-written knowledge base), sees a requirements checklist, submits a form, receives a reference number, and tracks the status. A staff member (demo role, no real auth) updates statuses in an admin dashboard.

**Key design constraints:**
- AI answers only from approved content in `lib/kb.json` — no external LLM API, no vector DB
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
| Animations | React Bits | CDN copy-paste or `npm` package — 4 spots only |
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
pnpm test --watch                       # watch mode
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
git checkout -b feat/submit-form
git checkout -b feat/status-tracking
git checkout -b feat/admin-dashboard
git checkout -b feat/react-bits-animations
git checkout -b fix/ref-number-padding
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
| `docs` | `plan.md`, `agents.md`, `README.md` updates |

**Scope** is the part of the app being changed. Keep it short.

```bash
# features
git commit -m "feat(chat): add ChatWindow component with message list"
git commit -m "feat(api): add POST /api/chat route with KB matcher"
git commit -m "feat(submit): add submission form with Zod validation"
git commit -m "feat(tracking): add status timeline page"
git commit -m "feat(admin): add requests table with status dropdown"
git commit -m "feat(animations): add React Bits hero text and checklist stagger"

# fixes
git commit -m "fix(api): return 404 when ref number not found"
git commit -m "fix(form): require email field when delivery is email"
git commit -m "fix(ref): zero-pad reference number to 4 digits"

# tests
git commit -m "test(ai): add unit tests for getAIResponse matcher"
git commit -m "test(schemas): add Zod schema validation tests"

# config / chores
git commit -m "chore(deps): add vitest and testing-library"
git commit -m "chore(db): add Supabase schema and seed SQL"
git commit -m "docs(agents): add data access rules and test scripts"
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
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Never commit `.env.local`. It is already in `.gitignore` by default.

---

## Folder Structure

```
campusassist-ai/
│
├── app/                            # Next.js App Router — all pages and API routes
│   ├── layout.tsx                  # Root layout (font, global nav header)
│   ├── page.tsx                    # Landing page — hero + "Get Started" CTA
│   ├── chat/
│   │   └── page.tsx                # Chat interface — student asks questions
│   ├── submit/
│   │   └── page.tsx                # Submission form
│   ├── success/
│   │   └── page.tsx                # Reference number reveal after submission
│   ├── track/
│   │   └── [ref]/
│   │       └── page.tsx            # Status tracking by reference number
│   ├── admin/
│   │   └── page.tsx                # Admin dashboard — list + update requests
│   └── api/
│       ├── chat/
│       │   └── route.ts            # POST /api/chat
│       └── requests/
│           ├── route.ts            # POST /api/requests · GET /api/requests
│           └── [ref]/
│               └── route.ts        # GET /api/requests/[ref] · PATCH /api/requests/[ref]
│
├── components/
│   ├── ui/                         # shadcn/ui generated components (Button, Input, etc.)
│   ├── ChatWindow.tsx              # Chat message list + input bar
│   ├── ChecklistCard.tsx           # Renders AI checklist items (React Bits stagger)
│   ├── RefNumberReveal.tsx         # Animated reference number on success page
│   ├── StatusTimeline.tsx          # Status step timeline on tracking page
│   ├── AdminTable.tsx              # Requests table with inline status update
│   └── RoleToggle.tsx              # Header toggle: Student view ↔ Staff view
│
├── lib/
│   ├── kb.json                     # Hand-written knowledge base (see §AI below)
│   ├── ai.ts                       # Keyword matcher — getAIResponse(message)
│   ├── supabase.ts                 # Supabase client singleton
│   ├── schemas.ts                  # All Zod schemas (shared by API routes + forms)
│   └── utils.ts                    # generateRefNumber(), cn() helper, etc.
│
├── types/
│   └── index.ts                    # Shared TypeScript types (Request, AIResponse, Status)
│
├── tests/
│   ├── setup.ts                    # jest-dom global setup
│   ├── lib/
│   │   ├── ai.test.ts              # getAIResponse() unit tests
│   │   ├── schemas.test.ts         # Zod schema unit tests
│   │   └── utils.test.ts           # generateRefNumber() unit tests
│   ├── api/
│   │   ├── chat.test.ts            # POST /api/chat
│   │   ├── requests.test.ts        # POST + GET /api/requests
│   │   └── requests-ref.test.ts    # GET + PATCH /api/requests/[ref]
│   └── components/
│       ├── ChatWindow.test.tsx
│       ├── ChecklistCard.test.tsx
│       └── StatusTimeline.test.tsx
│
├── vitest.config.ts                # Vitest configuration
├── .env.local                      # Secret env vars — never commit
├── agents.md                       # ← this file
└── plan.md                         # Product plan, timeline, team split
```

---

## Shared Types (`types/index.ts`)

```ts
export type Status = "submitted" | "under_review" | "ready" | "complete" | "rejected"

export type DeliveryMethod = "pickup" | "email"

export interface Request {
  id: number
  ref_number: string
  full_name: string
  student_id: string
  purpose: string
  delivery: DeliveryMethod
  email: string | null
  status: Status
  created_at: string
  updated_at: string
}

export interface AIResponse {
  answer: string
  source: string | null        // shown as "Source: {source}"
  type: "info" | "checklist" | "unknown"
  items: string[] | null       // only populated when type === "checklist"
}
```

---

## Database Schema (Supabase)

### Create table

```sql
create table requests (
  id          bigserial primary key,
  ref_number  text not null unique,
  full_name   text not null,
  student_id  text not null,
  purpose     text not null,
  delivery    text not null check (delivery in ('pickup', 'email')),
  email       text,
  status      text not null default 'submitted'
              check (status in ('submitted','under_review','ready','complete','rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
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
before update on requests
for each row execute procedure update_updated_at();
```

### Seed data

```sql
insert into requests (ref_number, full_name, student_id, purpose, delivery, email, status)
values
  ('REF-2025-0001', 'Alex Rivera',   'S10001', 'Bank account opening',     'email',  'alex@demo.edu',   'complete'),
  ('REF-2025-0002', 'Jordan Lee',    'S10002', 'Scholarship application',  'pickup',  null,             'ready'),
  ('REF-2025-0003', 'Morgan Patel',  'S10003', 'Apartment rental',         'email',  'morgan@demo.edu', 'under_review'),
  ('REF-2025-0004', 'Casey Nguyen',  'S10004', 'Employment verification',  'pickup',  null,             'submitted');
```

### RLS (Row Level Security)

For the demo, disable RLS on the `requests` table:

```sql
alter table requests disable row level security;
```

---

## Supabase Client (`lib/supabase.ts`)

```ts
import { createClient } from "@supabase/supabase-js"

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

// ── Submit request ────────────────────────────────────────────────────
export const SubmitRequestSchema = z.object({
  full_name:  z.string().min(2).max(100),
  student_id: z.string().min(3).max(20),
  purpose:    z.string().min(5).max(200),
  delivery:   z.enum(["pickup", "email"]),
  email:      z.string().email().optional()
}).refine(
  (data) => data.delivery !== "email" || !!data.email,
  { message: "Email address is required for email delivery", path: ["email"] }
)

// ── Update status (admin) ─────────────────────────────────────────────
export const UpdateStatusSchema = z.object({
  status: z.enum(["submitted", "under_review", "ready", "complete", "rejected"])
})

// ── Inferred types ────────────────────────────────────────────────────
export type ChatRequest     = z.infer<typeof ChatRequestSchema>
export type SubmitRequest   = z.infer<typeof SubmitRequestSchema>
export type UpdateStatus    = z.infer<typeof UpdateStatusSchema>
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
{ "message": "What do I need to bring?" }
```

**Response `200`**
```json
{
  "answer": "You will need: (1) Your Student ID card ...",
  "source": "Requirements",
  "type": "checklist",
  "items": [
    "Valid Student ID card",
    "Completed request form",
    "Stated purpose of letter",
    "$5 processing fee (payable at cashier)"
  ]
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

### `POST /api/requests`

**Purpose:** Submit a new enrollment verification letter request. Generates and returns a reference number.

**Request body**
```json
{
  "full_name":  "Sam Torres",
  "student_id": "S10099",
  "purpose":    "Landlord rental application",
  "delivery":   "email",
  "email":      "sam@demo.edu"
}
```

**Response `201`**
```json
{
  "ref_number": "REF-2025-0005",
  "status": "submitted"
}
```

**Response `400`** — validation error
```json
{ "error": "Email address is required for email delivery" }
```

**Response `500`** — database error
```json
{ "error": "Failed to create request" }
```

**Auth:** None

**Ref number generation logic** (in `lib/utils.ts`):
```ts
export function generateRefNumber(id: number): string {
  const year = new Date().getFullYear()
  const seq  = String(id).padStart(4, "0")
  return `REF-${year}-${seq}`
}
```
The row is inserted first (Supabase returns the `id`), then `ref_number` is updated in the same transaction using the returned `id`.

---

### `GET /api/requests/[ref]`

**Purpose:** Fetch the status and details of a single request by reference number.

**URL param:** `ref` — e.g. `REF-2025-0005`

**Response `200`**
```json
{
  "ref_number":  "REF-2025-0005",
  "full_name":   "Sam Torres",
  "status":      "under_review",
  "delivery":    "email",
  "created_at":  "2025-07-01T10:23:00Z",
  "updated_at":  "2025-07-01T14:05:00Z"
}
```

**Response `404`**
```json
{ "error": "Request not found" }
```

**Auth:** None

---

### `GET /api/requests`

**Purpose:** List all requests for the admin dashboard.

**Response `200`**
```json
[
  {
    "ref_number":  "REF-2025-0001",
    "full_name":   "Alex Rivera",
    "student_id":  "S10001",
    "purpose":     "Bank account opening",
    "delivery":    "email",
    "status":      "complete",
    "created_at":  "2025-07-01T09:00:00Z",
    "updated_at":  "2025-07-01T12:00:00Z"
  }
]
```

**Response `403`** — missing or wrong demo header
```json
{ "error": "Staff access required" }
```

**Auth:** `x-demo-role: staff` header required

---

### `PATCH /api/requests/[ref]`

**Purpose:** Update the status of a request (admin only).

**URL param:** `ref` — e.g. `REF-2025-0003`

**Request body**
```json
{ "status": "ready" }
```

**Response `200`**
```json
{
  "ref_number": "REF-2025-0003",
  "status":     "ready",
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
{ "error": "Request not found" }
```

**Auth:** `x-demo-role: staff` header required

---

## Demo Auth Pattern

No real auth. A `RoleToggle` component in the header sets a context value `role: "student" | "staff"`. All admin API calls from the frontend attach:

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

**Suggested entries to write:**

| id | title | Covers |
|---|---|---|
| `process_overview` | Process Overview | how, steps, process, request, enrollment verification |
| `requirements` | Requirements | need, bring, require, document, checklist |
| `turnaround` | Turnaround Time | how long, when, days, wait, urgent |
| `pickup` | Pickup & Delivery | pickup, collect, email, deliver, send, receive |
| `status` | Tracking Your Request | track, status, check, reference, number |
| `fee` | Fees | fee, cost, pay, price, charge |
| `office_hours` | Office Hours & Location | hours, open, office, location, where, building |

> Add more entries any time during the build — the matcher picks them up automatically.

---

## Component Responsibilities

| Component | Page | Data source | Notes |
|---|---|---|---|
| `ChatWindow` | `/chat` | `POST /api/chat` | Manages local message array in state |
| `ChecklistCard` | `/chat` | AI response `items[]` | Renders only when `type === "checklist"` |
| `RefNumberReveal` | `/success` | URL search param `?ref=` | Animates on mount |
| `StatusTimeline` | `/track/[ref]` | `GET /api/requests/[ref]` | Shows all 4 statuses; highlights current |
| `AdminTable` | `/admin` | `GET /api/requests` | `PATCH /api/requests/[ref]` on dropdown change |
| `RoleToggle` | `layout.tsx` header | Context state | Switches between student and staff views |

---

## React Bits — Animation Integration Rules

Install (pick one):

```bash
# Option A — copy-paste from reactbits.dev (preferred for hackathon speed)
# Option B — pnpm package if available
pnpm add react-bits
```

**4 animation spots — add only after core flow works end-to-end:**

| Spot | Suggested component | Fallback if removed |
|---|---|---|
| Hero headline | `TextPressure` or `BlurText` | Plain `<h1>` |
| Checklist items | Staggered `FadeContent` | Static `<ul>` |
| Reference number reveal | `CountUp` or `GlitchText` | Static `<p>` |
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
// app/api/requests/route.ts
import { supabase } from "@/lib/supabase"
export async function GET() {
  const { data } = await supabase.from("requests").select("*")
  // ...
}

// ❌ WRONG — supabase imported in a page component
// app/track/[ref]/page.tsx
import { supabase } from "@/lib/supabase"  // never do this
```

**2. Pages fetch data by calling their own API routes, not Supabase directly.**

All data flows through the API layer. Pages call `fetch("/api/requests/[ref]")` — they do not reach into Supabase themselves.

```ts
// ✅ CORRECT — page calls the API route
const res  = await fetch(`/api/requests/${ref}`)
const data = await res.json()

// ❌ WRONG — page calls Supabase directly
const { data } = await supabase.from("requests").select("*").eq("ref_number", ref)
```

**3. Never import server-only modules in client components.**

Any file with `"use client"` at the top must not import `@supabase/supabase-js`, `lib/supabase.ts`, or any Node.js-only module.

**4. Keep `lib/ai.ts` pure — no I/O, no side effects.**

`getAIResponse()` in `lib/ai.ts` takes a string and returns an `AIResponse`. It reads from `lib/kb.json` at import time. It must never make network calls, database calls, or write to any external state.

---

### API routes

```ts
// app/api/requests/route.ts — pattern to follow for all routes
import { NextRequest } from "next/server"
import { SubmitRequestSchema } from "@/lib/schemas"
import { supabase } from "@/lib/supabase"
import { generateRefNumber } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = SubmitRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }
  // ... insert to supabase
}
```

### Client components

- Use `"use client"` only on components that need browser APIs or event handlers
- Keep data fetching in server components where possible (page.tsx)
- Pass data down as props to keep client components pure and testable

### Naming
- Files: `PascalCase` for components, `camelCase` for lib files
- Database columns: `snake_case` (match Supabase defaults)
- TypeScript types: `PascalCase`
- Zod schemas: `PascalCaseSchema`

### Error states every page needs
- Loading state (Skeleton or spinner)
- Error state (short message + retry or contact info)
- Empty state (for admin table when no requests exist)

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
├── setup.ts                    # global test setup (jest-dom matchers)
├── lib/
│   ├── ai.test.ts              # unit tests for getAIResponse()
│   ├── schemas.test.ts         # unit tests for all Zod schemas
│   └── utils.test.ts           # unit tests for generateRefNumber()
├── api/
│   ├── chat.test.ts            # API route: POST /api/chat
│   ├── requests.test.ts        # API route: POST /api/requests · GET /api/requests
│   └── requests-ref.test.ts    # API route: GET /api/requests/[ref] · PATCH /api/requests/[ref]
└── components/
    ├── ChatWindow.test.tsx      # renders messages, calls /api/chat on submit
    ├── ChecklistCard.test.tsx   # renders items, only when type === "checklist"
    └── StatusTimeline.test.tsx  # highlights correct status step
```

### Run commands

```bash
pnpm test                               # run all tests once
pnpm test:watch                         # watch mode during development
pnpm --filter @bobhackathon/web test    # run only the web package tests (monorepo)
pnpm test -- tests/lib/ai.test.ts       # run a single test file
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
- `SubmitRequestSchema` passes with valid pickup data (no email required)
- `SubmitRequestSchema` passes with valid email delivery + email address
- `SubmitRequestSchema` fails when `delivery: "email"` but no email given
- `SubmitRequestSchema` fails on missing required fields
- `UpdateStatusSchema` accepts all valid status values
- `UpdateStatusSchema` rejects an invalid status string
- `ChatRequestSchema` rejects an empty message string

#### `tests/lib/utils.test.ts` — utilities
Bob will write tests that cover:
- `generateRefNumber(1)` returns `"REF-{currentYear}-0001"`
- `generateRefNumber(42)` returns `"REF-{currentYear}-0042"`
- `generateRefNumber(9999)` returns `"REF-{currentYear}-9999"`
- IDs above 9999 are not zero-padded (they render as-is)

#### `tests/api/chat.test.ts` — chat route
Bob will write tests that cover:
- `POST /api/chat` with a known keyword returns `200` and a valid `AIResponse`
- `POST /api/chat` with an unknown message returns `200` and `type: "unknown"`
- `POST /api/chat` with an empty body returns `400`

#### `tests/api/requests.test.ts` — requests list + submit
Bob will write tests that cover:
- `POST /api/requests` with valid data returns `201` and a `ref_number`
- `POST /api/requests` with missing fields returns `400`
- `POST /api/requests` with `delivery: "email"` and no email returns `400`
- `GET /api/requests` with `x-demo-role: staff` header returns `200` array
- `GET /api/requests` without the header returns `403`

#### `tests/api/requests-ref.test.ts` — single request
Bob will write tests that cover:
- `GET /api/requests/REF-2025-0001` returns `200` with the correct shape
- `GET /api/requests/REF-9999-9999` returns `404`
- `PATCH /api/requests/REF-2025-0001` with valid status + staff header returns `200`
- `PATCH /api/requests/REF-2025-0001` without staff header returns `403`
- `PATCH /api/requests/REF-2025-0001` with invalid status returns `400`

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

#### `tests/components/StatusTimeline.test.tsx` — status display
Bob will write tests that cover:
- All 4 status steps are rendered
- The current status step is visually marked (has active class or aria attribute)
- Completed steps are marked as complete
- "rejected" status is handled without crashing

### Bob's test-writing rules
1. Bob writes tests in the same task as the feature, not after — "write `lib/ai.ts` and its tests together"
2. Tests use the same Zod schemas from `lib/schemas.ts` — no inline shape redefinitions
3. API tests mock Supabase calls — they do not hit the real database
4. Component tests use `@testing-library/react` — no Enzyme, no snapshot-only tests
5. Every test file must be runnable with `pnpm test -- tests/<path>`

---

## AI Context — How Bob Understands This Project

> This section is written for Bob (and any AI coding assistant). Read this before touching any file.

### What this project is

CampusAssist AI is a **Next.js + TypeScript + Supabase** web app. A student chats with an AI assistant about a campus process (enrollment verification letter request), submits a form, gets a reference number, and tracks the status. A staff member updates request statuses in an admin view. There is no real authentication.

### What the AI assistant inside the app does

The in-app AI (`lib/ai.ts`) is **not a language model**. It is a keyword matcher over `lib/kb.json`. It returns a typed `AIResponse` object. It never calls an external API. It never guesses. It always cites a source field from the KB entry. If no KB entry matches, it returns `type: "unknown"` with a safe fallback message.

### Files to read before writing any code

| File | Why |
|---|---|
| `plan.md` | Full product scope, user flows, status machine, team split, timeline |
| `agents.md` | This file — stack, commands, DB schema, endpoint contracts, conventions |
| `lib/schemas.ts` | All Zod schemas — use these, don't invent new ones |
| `types/index.ts` | All shared TypeScript types — use these, don't redefine |
| `lib/kb.json` | Knowledge base entries — the AI's only source of truth |

### Constraints Bob must never break

1. **Do not add real authentication.** The demo role header (`x-demo-role: staff`) is sufficient.
2. **Do not call external AI APIs** (OpenAI, Anthropic, etc.) — the matcher in `lib/ai.ts` is the only AI.
3. **Do not add new Zod schemas** without adding them to `lib/schemas.ts`.
4. **Do not add new TypeScript types** without adding them to `types/index.ts`.
5. **Do not change the `ref_number` format** (`REF-YYYY-NNNN`) — it is shown to users and used in URLs.
6. **Do not change existing API response shapes** — frontend and backend are coupled to the contracts in this file.
7. **One thing at a time.** Write one component or one route per task. Do not refactor unrelated code.
8. **Never import `lib/supabase.ts` outside of `app/api/**/route.ts` files.** Pages and components call the API layer — they never touch Supabase directly. See Data Access Rules in Coding Conventions.
9. **Bob owns all test scripts.** Every feature Bob writes must be accompanied by the corresponding test file in `tests/`. See the Testing section for file locations and coverage requirements.

### How to answer questions about this project

- The knowledge base (`lib/kb.json`) is the source of truth for campus process questions.
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

## Suggested Additions (Beyond the Original Brief)

The following are low-cost improvements that could strengthen the demo without blowing the scope:

| Addition | Effort | Value |
|---|---|---|
| **Copy-to-clipboard** on reference number | 5 min | High — improves demo UX |
| **Status badge colours** on admin table (colour-coded chips) | 10 min | High — makes statuses scannable |
| **"What can I ask?" prompt chips** below the chat input (3 preset questions) | 15 min | High — guides judges through the AI demo |
| **Optimistic status update** in admin — update UI before API confirms | 20 min | Medium — feels polished |
| **`/track` search form** — enter ref number on a standalone page | 20 min | Medium — more realistic student flow |
| **Toast notifications** (shadcn/ui Toast) on form submit and status update | 15 min | Medium — standard UX feedback |
| **README.md** with setup instructions and a screenshot | 20 min | High — judges read the repo |
| **Admin request count** summary bar (X submitted, X ready) | 15 min | Low — nice-to-have dashboard polish |

> Add these only after all must-haves are working. They are ordered by value-to-effort ratio.

---

## Pre-Build Verification Checklist

Before starting the clock:

- [ ] `node -v` → 20+ on both machines
- [ ] `pnpm -v` → available on both machines
- [ ] Supabase project created, URL and anon key copied
- [ ] Git repo initialised, both developers have push access
- [ ] `.env.local` template shared (not committed)
- [ ] Both developers have read `plan.md` and `agents.md`
- [ ] Demo laptop decided — deploy to Vercel, demo from URL not localhost
- [ ] shadcn/ui component list agreed: Button, Input, Textarea, Select, Badge, Table, Card, Skeleton, Toast

---

*Keep this file open during the build. Update the endpoint contracts if anything changes so both developers stay in sync.*
