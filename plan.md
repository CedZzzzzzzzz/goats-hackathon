# CampusAssist AI — Hackathon Plan

> **2 people · 24 hours · One workflow done well**
> Stack: Next.js (TypeScript) · Tailwind · shadcn/ui · Supabase · Zod · React Bits
> 📎 See [`agents.md`](agents.md) for bootstrap commands, full endpoint contracts, component map, and Bob task format.

---

## 1. Chosen Workflow: Enrollment Verification Letter Request

**Why this one?**
Every campus has it. Students need a letter proving they are enrolled (for banks, landlords, employers, scholarships). The process has a clear intake form, defined statuses, and a natural "reference number + tracking" arc. It has zero ambiguity about what "done" looks like, the data is 100% fakeable, and the AI knowledge base can be written in 30 minutes.

> **Assumption:** We are not targeting a real university. All policy text, fees, turnaround times, and names in the demo are invented.

---

## 2. Problem & Scope

### Problem
Students often don't know *how* to request official documents. They email the wrong office, miss required fields, or don't know the status of their request. Staff receive incomplete submissions and spend time chasing students for missing info.

### What CampusAssist AI does
- Explains the enrollment verification letter request process via an AI chat interface
- Shows the student a requirements checklist before they submit
- Accepts a demo submission form and issues a reference number
- Lets the student track their request status
- Lets a staff member (demo role) update that status

### What we are NOT building
| Out of scope | Reason |
|---|---|
| Real authentication / OAuth | Adds hours; use a demo role-switch toggle instead |
| File upload / OCR | Out of scope for 24 h |
| Email or SMS notifications | No infra time; not needed for demo |
| Multiple departments or workflows | One workflow done well > five half-done |
| Payment processing | Fake fee display only |
| Accessibility audit / WCAG compliance | Best-effort only |
| Mobile-first responsive polish | Desktop demo is fine |
| Production security hardening | This is a demo, not a live system |

---

## 3. User Flows

### 3.1 Student Flow

```
Landing page (hero + "Get Started")
  │
  ▼
Chat interface
  Student: "How do I get an enrollment verification letter?"
  AI: Explanation + source citation
  Student: "What do I need to bring?"
  AI: Requirement list (triggers animated checklist)
  │
  ▼
"Start my request" CTA  →  Submission form
  (Full name · Student ID · Purpose of letter · Preferred pickup / email)
  │
  ▼
Zod validation  →  POST /api/requests
  │
  ▼
Success screen
  Animated reference number reveal  (REF-YYYY-XXXX)
  "Track my request" link
  │
  ▼
Status tracking page  /track/[ref]
  Animated status timeline:
  Submitted → Under Review → Ready for Pickup / Sent → Complete
```

### 3.2 Admin Flow (demo role only — no real auth)

```
Role-switch toggle in header  →  "Staff View"
  │
  ▼
Admin dashboard  /admin
  Table of all requests (ref · name · status · submitted date)
  │
  ▼
Click a row  →  Detail panel
  Update status dropdown  →  PATCH /api/requests/[ref]
  Saved instantly (optimistic update)
```

### 3.3 Status Flow

```
submitted  →  under_review  →  ready  →  complete
                                └──→  rejected   (edge case, staff sets manually)
```

### 3.4 Reference Number Format

```
REF-{YYYY}-{4-digit zero-padded sequence}
Example: REF-2025-0042
```

Generated server-side on insert. Sequence is the `id` column of the requests table, zero-padded to 4 digits. Store as a separate `ref_number` column for easy lookup.

---

## 4. Feature Priority

### Must-have (ship by hour 18)
- [ ] Landing page with hero text
- [ ] Chat interface: student asks questions, AI answers from knowledge base
- [ ] AI cites its source ("Source: Process Overview")
- [ ] AI says "I don't know" for anything not in the knowledge base
- [ ] Requirements checklist rendered from AI response
- [ ] Submission form with Zod validation
- [ ] Reference number generation and success screen
- [ ] Status tracking page `/track/[ref]`
- [ ] Admin dashboard: list requests, update status
- [ ] Supabase `requests` table + API routes

### Nice-to-have (hours 18–21 if ahead of schedule)
- [ ] React Bits animated hero text (TextPressure or similar)
- [ ] React Bits animated checklist items (staggered fade-in)
- [ ] React Bits animated reference number reveal (counter or typewriter)
- [ ] React Bits status timeline animation (step reveal)
- [ ] Copy-to-clipboard on reference number
- [ ] Admin: filter by status

### Skip entirely
- Real auth, OAuth, sessions
- File uploads
- Notifications
- Multiple workflows
- Dark mode toggle (Tailwind dark: classes only if trivial)

---

## 5. AI Behaviour

### Design principle
The AI is a **retrieval + template engine, not a generative model**. No vector DB. No embeddings. Match the student's question against a small, hand-written JSON knowledge base and return a structured response.

### Knowledge base format (`/lib/kb.json`)

```jsonc
[
  {
    "id": "process_overview",
    "title": "Process Overview",
    "keywords": ["how", "process", "steps", "request", "get", "enrollment verification", "letter"],
    "content": "To request an enrollment verification letter, visit the Registrar's Office (Room 101, Admin Building) during office hours Monday–Friday 9am–5pm. Alternatively, submit a request online through this portal. Processing takes 3–5 business days. [ASSUMPTION: invented details]",
    "type": "info"
  },
  {
    "id": "requirements",
    "title": "Requirements",
    "keywords": ["need", "bring", "require", "document", "checklist", "what"],
    "content": "You will need: (1) Your Student ID card, (2) A completed request form, (3) The purpose of the letter (e.g. bank, landlord, employer). There is a $5 processing fee payable at the cashier. [ASSUMPTION: invented fee]",
    "type": "checklist",
    "items": [
      "Valid Student ID card",
      "Completed request form",
      "Stated purpose of letter",
      "$5 processing fee (payable at cashier)"
    ]
  },
  {
    "id": "turnaround",
    "title": "Turnaround Time",
    "keywords": ["how long", "when", "days", "time", "ready", "turnaround", "wait"],
    "content": "Standard processing takes 3–5 business days. Urgent requests (next business day) are available for an additional $10 fee. [ASSUMPTION: invented]",
    "type": "info"
  },
  {
    "id": "pickup",
    "title": "Pickup / Delivery",
    "keywords": ["pickup", "collect", "email", "deliver", "send", "receive", "get it"],
    "content": "You can pick up your letter at the Registrar's Office or request email delivery of a digitally signed PDF. [ASSUMPTION: invented]",
    "type": "info"
  },
  {
    "id": "status",
    "title": "Tracking Your Request",
    "keywords": ["track", "status", "check", "reference", "number", "where", "update"],
    "content": "After submitting, you will receive a reference number (e.g. REF-2025-0042). Use the 'Track Request' page and enter your reference number to see the current status.",
    "type": "info"
  }
]
```

### Matching logic (`/lib/ai.ts`)

```ts
// Pseudocode — implement in ~50 lines
function getAIResponse(userMessage: string): AIResponse {
  const msg = userMessage.toLowerCase()
  const match = kb.find(entry =>
    entry.keywords.some(kw => msg.includes(kw))
  )
  if (!match) {
    return {
      answer: "I don't have information about that. Please contact the Registrar's Office directly.",
      source: null,
      type: "unknown",
      items: null
    }
  }
  return {
    answer: match.content,
    source: match.title,
    type: match.type,
    items: match.items ?? null
  }
}
```

### Structured AI response schema (Zod)

```ts
const AIResponseSchema = z.object({
  answer: z.string(),
  source: z.string().nullable(),   // shown as "Source: Process Overview"
  type: z.enum(["info", "checklist", "unknown"]),
  items: z.array(z.string()).nullable()  // rendered as animated checklist if type === "checklist"
})
```

### Rules the AI must follow
1. **Never approve or reject** a request ("Your request looks good!" is forbidden)
2. **Never guess** fees, deadlines, or office hours — if not in the KB, say "I don't know"
3. **Always cite source** — display `Source: {entry.title}` below every answer
4. **Checklist type** triggers the animated checklist component automatically
5. **No hallucination** — the KB is the only source of truth

---

## 6. Database Schema (Supabase)

### Table: `requests`

```sql
create table requests (
  id          bigserial primary key,
  ref_number  text not null unique,          -- REF-2025-0042
  full_name   text not null,
  student_id  text not null,
  purpose     text not null,
  delivery    text not null check (delivery in ('pickup', 'email')),
  email       text,                          -- required if delivery = 'email'
  status      text not null default 'submitted'
              check (status in ('submitted','under_review','ready','complete','rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### Seed data (for demo)

```sql
insert into requests (ref_number, full_name, student_id, purpose, delivery, status)
values
  ('REF-2025-0001', 'Alex Rivera',   'S10001', 'Bank account opening', 'email',  'complete'),
  ('REF-2025-0002', 'Jordan Lee',    'S10002', 'Scholarship application','pickup','ready'),
  ('REF-2025-0003', 'Morgan Patel',  'S10003', 'Apartment rental',    'email',  'under_review'),
  ('REF-2025-0004', 'Casey Nguyen',  'S10004', 'Employment verification','pickup','submitted');
```

### Supabase RLS
For the demo, disable RLS or use a permissive policy. **Do not implement real auth.**

---

## 7. API Endpoints

All routes in `/app/api/` (Next.js App Router).

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/chat` | Accept `{ message: string }`, return `AIResponse` | None |
| `POST` | `/api/requests` | Submit new request, return `{ ref_number }` | None |
| `GET` | `/api/requests/[ref]` | Get status for a reference number | None |
| `GET` | `/api/requests` | List all requests (admin) | Demo header |
| `PATCH` | `/api/requests/[ref]` | Update status (admin) | Demo header |

**Demo auth header:** `x-demo-role: staff` — checked server-side, no real security, just prevents accidental student access to admin endpoints.

### POST `/api/requests` — request body schema (Zod)

```ts
const SubmitRequestSchema = z.object({
  full_name:  z.string().min(2).max(100),
  student_id: z.string().min(3).max(20),
  purpose:    z.string().min(5).max(200),
  delivery:   z.enum(["pickup", "email"]),
  email:      z.string().email().optional()
}).refine(
  data => data.delivery !== "email" || !!data.email,
  { message: "Email is required for email delivery", path: ["email"] }
)
```

---

## 8. Project Structure

```
campusassist-ai/
├── app/
│   ├── page.tsx                  # Landing page + hero
│   ├── chat/
│   │   └── page.tsx              # Chat interface
│   ├── submit/
│   │   └── page.tsx              # Submission form
│   ├── success/
│   │   └── page.tsx              # Reference number reveal
│   ├── track/
│   │   └── [ref]/page.tsx        # Status tracking
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   └── api/
│       ├── chat/route.ts
│       ├── requests/
│       │   ├── route.ts          # POST + GET (list)
│       │   └── [ref]/route.ts    # GET + PATCH
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── ChatWindow.tsx
│   ├── ChecklistCard.tsx         # React Bits animated checklist
│   ├── RefNumberReveal.tsx       # React Bits number reveal
│   ├── StatusTimeline.tsx        # React Bits step animation
│   └── AdminTable.tsx
├── lib/
│   ├── ai.ts                     # KB matching logic
│   ├── kb.json                   # Knowledge base
│   ├── supabase.ts               # Supabase client
│   ├── schemas.ts                # All Zod schemas
│   └── utils.ts                  # ref number generator, helpers
├── types/
│   └── index.ts
└── plan.md
```

---

## 9. React Bits Animation Spots

Install: `npm install react-bits` (or use their copy-paste CDN components).

| Spot | Component | Trigger | Condition |
|---|---|---|---|
| Hero headline | `TextPressure` or `BlurText` | On page load | Always |
| Checklist items | `FadeContent` / staggered `AnimatedList` | When AI returns `type: "checklist"` | Only for checklist responses |
| Reference number | `CountUp` or `GlitchText` | On success page mount | Always |
| Status timeline steps | `ScrollReveal` or step-by-step reveal | On tracking page mount | Always |

**Rules for React Bits usage:**
- Add animations **only after the functional flow is working end-to-end**
- Each animation must degrade gracefully if the component fails to load
- Use `prefers-reduced-motion` media query — skip animations if user has it set
- No animation should block user interaction or delay data display

---

## 10. How to Work With Bob

### Workflow
1. **Always plan first** — before asking Bob to write a component, describe what it should do and what props it takes. Bob will confirm before writing.
2. **Small tasks** — one component or one route per request. "Write the full app" produces worse results than "write the `/api/requests` POST route with this Zod schema."
3. **Review diffs** — read every diff before accepting. Bob makes targeted changes; you decide if they fit.
4. **Paste errors** — if something breaks, paste the full error message. Don't paraphrase.
5. **Commit often** — after each working feature, commit. Hackathons end with broken WIP otherwise.
6. **Don't ask Bob to guess** — if you haven't decided something (e.g. a field name), decide it first, then ask.

### Prompt templates to use
```
"Bob, write [X] that does [Y]. It should accept props [Z]. 
 Use the Zod schema in /lib/schemas.ts. Don't add anything beyond what I described."

"Bob, the error is: [paste]. The relevant file is [file]. Fix only this error."

"Bob, review this component for correctness. Don't rewrite it, just tell me if anything is wrong."
```

---

## 11. Team Split

> **Assumption:** Two people, no defined roles yet. Adjust as needed.

### Person A — Frontend & UX
- Landing page, chat interface, checklist card
- Submission form (client-side Zod validation, form state)
- Success page (ref number reveal)
- Status tracking page
- React Bits animation integrations (after Person B's APIs are live)

### Person B — Backend & Data
- Supabase project setup, table creation, seed data
- `/lib/supabase.ts`, `/lib/ai.ts`, `/lib/kb.json`
- All API routes (`/api/chat`, `/api/requests`, `/api/requests/[ref]`)
- Admin dashboard (table + status update)
- Zod schemas in `/lib/schemas.ts`

### Shared
- Initial Next.js + Tailwind + shadcn/ui + Supabase setup (do together, first 30 min)
- Integration testing (hour 18–20)
- Demo script rehearsal (hour 22–23)
- Final polish / bug fixes (hour 23–24)

---

## 12. Commands Reference

> Full command details in [`agents.md`](agents.md#commands). Quick reference:

```bash
pnpm dev                                # start dev server
pnpm build                              # production build
pnpm start                              # serve production build
pnpm lint                               # run ESLint
pnpm test                               # run all tests
pnpm --filter @bobhackathon/web test    # run web package tests only
pnpm add <pkg>                          # add dependency
pnpm add -D <pkg>                       # add dev dependency
pnpm dlx shadcn@latest add <component>  # add shadcn/ui component
```

---

## 13. Prep Checklist (Before the Clock Starts)

- [ ] Node.js 20+ installed on both machines
- [ ] `pnpm` available on both machines (`npm i -g pnpm` if not)
- [ ] Git repo created, both have push access
- [ ] Supabase account created, new project ready (takes ~2 min to provision)
- [ ] Supabase `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` noted
- [ ] Bootstrap command ready: `pnpm create next-app@latest campusassist-ai --typescript --tailwind --app --eslint --src-dir no --import-alias "@/*"`
- [ ] shadcn/ui init command ready: `pnpm dlx shadcn@latest init`
- [ ] VS Code + ESLint + Prettier configured
- [ ] Both people have read `plan.md` and `agents.md`
- [ ] Both people have read the React Bits docs for the 4 chosen components
- [ ] Demo laptop decided (whose machine runs the demo?)

---

## 14. Hour-by-Hour Timeline

| Hours | Focus | Milestone |
|---|---|---|
| 0:00–0:30 | Project setup: Next.js, Tailwind, shadcn/ui, Supabase, env vars, git | Repo pushed, app runs locally |
| 0:30–1:30 | Person B: Supabase schema + seed + `/lib/supabase.ts` + `/lib/kb.json` + `/lib/ai.ts` | DB live, AI matcher unit-testable |
| 0:30–1:30 | Person A: Landing page layout + hero text (static, no animation yet) | Landing page renders |
| 1:30–3:00 | Person B: `/api/chat` route + `/api/requests` POST + GET routes | APIs return correct JSON |
| 1:30–3:00 | Person A: Chat interface UI (message list, input, send button) | Chat UI renders, calls `/api/chat` |
| 3:00–5:00 | Person A: Submission form (fields, Zod client validation, submit to API) | Form submits, shows ref number |
| 3:00–5:00 | Person B: `/api/requests/[ref]` GET + PATCH, admin dashboard data layer | Status update works in Supabase |
| 5:00–7:00 | Person A: Success page + tracking page `/track/[ref]` | Student can track their request |
| 5:00–7:00 | Person B: Admin dashboard UI (table + status dropdown) | Staff can update status |
| 7:00–9:00 | **Integration:** connect all pages end-to-end, fix mismatches | Full flow works: chat → submit → track → admin update → track reflects change |
| 9:00–11:00 | Bug fix sprint + checklist card component + AI source citation display | AI shows source; checklist renders |
| 11:00–13:00 | **Sleep / break** (staggered if possible) | — |
| 13:00–15:00 | Polish: loading states, error states, empty states, form error messages | No blank screens or silent failures |
| 15:00–17:00 | Person A: React Bits animations (hero, checklist, ref number, timeline) | Animations live, graceful fallback |
| 15:00–17:00 | Person B: Seed data review, demo data looks realistic | Admin table looks convincing |
| 17:00–18:00 | **⛔ Feature freeze** — no new features after this point | |
| 18:00–20:00 | End-to-end QA (test checklist below) | All must-haves verified |
| 20:00–21:00 | Bug fixes from QA only — no scope creep | Stable build |
| 21:00–22:00 | Demo script rehearsal (both people, full run-through) | Under 5 minutes |
| 22:00–23:00 | Pitch outline preparation + README | Submission ready |
| 23:00–24:00 | Buffer: last fixes, final commit, submission | ✅ Submitted |

---

## 15. Testing Checklist

### Functional
- [ ] Chat: known question returns correct answer with source citation
- [ ] Chat: unknown question returns "I don't have information about that"
- [ ] Chat: checklist question renders checklist card
- [ ] Form: submits successfully with valid data
- [ ] Form: shows validation error for missing required fields
- [ ] Form: shows validation error for missing email when delivery = email
- [ ] Success page: displays correct reference number
- [ ] Tracking: valid ref number shows correct status
- [ ] Tracking: invalid ref number shows "not found" message
- [ ] Admin: all requests visible in table
- [ ] Admin: status update saves and is reflected on tracking page
- [ ] Admin: non-staff cannot access `/admin` (redirect or empty state)

### Edge cases
- [ ] Submit the same student ID twice — both requests get unique ref numbers
- [ ] Ref number with leading zeros displays correctly (REF-2025-0001 not REF-2025-1)
- [ ] Very long student name / purpose doesn't break layout
- [ ] Empty chat message doesn't submit

### Animations (if implemented)
- [ ] Animations do not block form interaction
- [ ] Page is usable before animations complete
- [ ] `prefers-reduced-motion` disables animations

---

## 16. Demo Script (≤5 minutes)

> Practice this. Muscle memory beats panic.

1. **(0:00–0:30)** Open landing page. Say: "A student needs an enrollment verification letter. Let's see how CampusAssist AI helps."
2. **(0:30–1:30)** Type: "How do I get an enrollment verification letter?" → Show AI answer with source citation.
3. **(1:30–2:00)** Type: "What do I need to bring?" → Show animated checklist.
4. **(2:00–3:00)** Click "Start my request" → fill out form → submit → show animated reference number.
5. **(3:00–3:30)** Navigate to `/track/REF-2025-0005` → show "Submitted" status.
6. **(3:30–4:30)** Switch to Staff View → find the request → change status to "Under Review" → switch back to student view → refresh tracking → show updated status.
7. **(4:30–5:00)** Type: "What is the fee for an urgent request?" → show AI answer. Then type something not in the KB → show "I don't know" response. Close with: "The AI only answers from approved content — it never guesses."

---

## 17. Pitch Outline (2–3 minutes)

1. **Problem** (20 sec): Students waste time figuring out administrative processes. Staff waste time on incomplete submissions.
2. **Solution** (30 sec): CampusAssist AI — one chat interface that explains the process, ensures complete submissions, and keeps students informed without involving staff unless necessary.
3. **Live demo** (see §16 above)
4. **AI design choice** (30 sec): The AI answers only from content we wrote and approved. It cites its source. It says "I don't know" instead of guessing. It never approves or rejects anything. That matters in a campus context.
5. **Stack** (15 sec): Next.js, Supabase, Zod, shadcn/ui, React Bits. Deployed on Vercel.
6. **What's next** (20 sec): Additional workflows (transcript requests, room bookings), real auth, staff knowledge base editor, multi-campus support.

---

## 18. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase provisioning delay | Low | High | Create project during prep, before clock starts |
| React Bits animation breaks layout | Medium | Medium | Add animations last; wrap in try/catch or conditional render |
| KB matching too naive (misses questions) | Medium | Low | Add more keywords; AI "I don't know" is acceptable fallback |
| Integration bugs between frontend and API | High | High | Agree on API response shape in schemas.ts before either person starts |
| One person blocked waiting for the other | Medium | High | Mock API responses locally; don't block on each other |
| Scope creep ("let's add auth real quick") | High | High | Refer to this plan. Feature freeze at hour 17. |
| Demo machine crashes | Low | High | Deploy to Vercel by hour 22; demo from URL not localhost |

---

## 18. "Done" Checklist

- [ ] Student can ask the AI a question and get an answer with a source citation
- [ ] AI says "I don't know" for out-of-scope questions
- [ ] Student can submit a request form and receive a reference number
- [ ] Student can track their request by reference number
- [ ] Staff (demo role) can update request status
- [ ] Status change is reflected on the student tracking page
- [ ] No hardcoded secrets in the repo (use `.env.local`)
- [ ] App is deployed and accessible via a public URL
- [ ] Demo script rehearsed at least once
- [ ] README explains what the project is and how to run it
- [ ] `plan.md` is in the repo root ✅

---

*This plan is a living document. Update it as decisions are made. Mark assumptions clearly. One workflow done well is the goal.*
