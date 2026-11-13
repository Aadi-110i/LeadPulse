# LeadPulse

**Never lose a follow-up again.**

LeadPulse turns a customer call into a structured summary, a sentiment score, a next
step, and a queued WhatsApp follow-up — then shows you the whole pipeline while it
happens. It is an API-first product with a real dashboard attached, built on
PostgreSQL and Redis.

This repository is a full rebuild of the LeadPulse concept: a marketing site, an API
reference with a live request runner, an authentication flow, and a three-column
operations dashboard — all backed by a real database and a real job queue.

---

## Table of contents

- [What is real here](#what-is-real-here)
- [The two surfaces](#the-two-surfaces)
- [Stack](#stack)
- [Running it](#running-it)
- [Project layout](#project-layout)
- [API reference](#api-reference)
- [Data model](#data-model)
- [The queue](#the-queue)
- [Design system](#design-system)
- [Verification](#verification)
- [Honesty policy](#honesty-policy)
- [Known limits](#known-limits)

---

## 🏗️ System Architecture
                ┌─────────────────────────────────────┐
                │           Client / CRM System       │
                └──────────────┬──────────────────────┘
                               │ REST API calls
                ┌──────────────▼──────────────────────┐
                │         Express.js API Server       │
                │  /api/calls  /api/leads  /api/logs  │
                └───┬──────────────────┬──────────────┘
                    │                  │
       ┌────────────▼───┐     ┌────────▼──────────┐
       │  PostgreSQL DB │     │   Redis + BullMQ  │
       │  Leads, Calls, │     │   Job Queue for   │
       │  Summaries     │     │   WhatsApp sends  │
       └────────────────┘     └────────┬──────────┘
                                       │
                ┌──────────────────────▼──────────────┐
                │         Worker Service              │
                │  Calls OpenAI → Summarizes call     │
                │  Triggers Twilio WhatsApp webhook   │
                └─────────────────────────────────────┘

## What is real here

Most demo dashboards mock the interesting parts. This build does not:

| Area | How it is implemented |
| --- | --- |
| Authentication | Real bcrypt password hashing, real JWT issuing and verification against Postgres |
| Leads, calls, jobs, webhooks | Real tables with a real migration runner — every dashboard figure is a live `SELECT` |
| Follow-up delivery | Real BullMQ queue on Redis, with retries, exponential backoff, and a dead-letter state |
| Summarisation | A deterministic local analyser behind a swappable provider interface |
| API docs | A request runner that calls the running API and shows the real status and body |
| Dashboard numbers | Live database reads only — never a fixture |

The only things that are simulated are the two that would need paid third-party
credentials: the LLM summariser and the WhatsApp send. Both sit behind interfaces, so
swapping in a real provider is a single file change. See
[Known limits](#known-limits).

---

## The two surfaces

The product deliberately changes register between its public and private halves, while
sharing one vocabulary of tokens, type, and spacing.

**Paper Dispatch** — the marketing site and API reference. A cool-white dispatch sheet,
hairline rules doing the structural work, cobalt as the only accent, set in Familjen
Grotesk. It reads like a printed spec sheet.

**Quiet Console** — the dashboard and the sign-in flow. A graphite instrument panel,
brass as the single accent, Schibsted Grotesk for prose and JetBrains Mono only where
real data lives. It reads like a machine you operate rather than a page you read.

```
[data-surface="marketing"]   Paper Dispatch  — landing, docs
[data-surface="app"]         Quiet Console   — dashboard, auth
```

Both are defined in `src/styles/tokens.css`. Nothing else in the codebase declares a
colour.

---

## Stack

**Frontend** — React 19, Vite 8, React Router 7, CSS Modules, `lucide-react` for icons,
`recharts` for the trend chart. No UI framework, no utility CSS.

**Backend** — Node.js, Express 5, `pg` for PostgreSQL, `ioredis` + `bullmq` for the
queue, `jsonwebtoken` + `bcryptjs` for auth.

**Data** — PostgreSQL 14 is the system of record. Redis 7 is the transport for the
delivery queue.

---

## Running it

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally
- Redis 6.2+ running locally (BullMQ's floor)

### 1. Install

```bash
npm install
```

### 2. Configure the API

```bash
cp server/.env.example server/.env
```

Edit `server/.env` so `DATABASE_URL` and `REDIS_URL` point at your instances:

```ini
DATABASE_URL=postgres://leadpulse:leadpulse@127.0.0.1:5433/leadpulse
REDIS_URL=redis://127.0.0.1:6380
JWT_SECRET=change-me-before-deploying
```

### 3. Create the schema and the demo dataset

```bash
npm run db:setup      # runs the migrations, then the seed
```

The seed creates one owner account and a realistic dataset — 64 leads, ~145 calls, and
~115 follow-up jobs with a truthful mix of delivered, retried, waiting, and
dead-lettered states.

### 4. Run both processes

```bash
npm start             # API on :3000 and Vite on :5173, together
```

Or separately:

```bash
npm run server        # API only  -> http://127.0.0.1:3000
npm run dev           # web only  -> http://127.0.0.1:5173
```

### 5. Sign in

```
demo@leadpulse.dev
demo1234
```

The sign-in page also has a one-click demo button that fills these in.

### Running Postgres and Redis on Windows

If you do not already have them, WSL2 works well and both services are reachable from
Windows over localhost forwarding:

```bash
# Postgres 14, unpacked rootless into ~/pgbuild, datadir ~/pgdata, port 5433
wsl -d Ubuntu-22.04 -- bash /path/to/LEADPLUS/.data/setup-wsl-pg.sh

# Redis 7.2.5 built from source, port 6380
wsl -d Ubuntu-22.04 -- bash /path/to/LEADPLUS/.data/build-redis.sh
```

Those scripts are development helpers and are not tracked in git; the important part is
that `DATABASE_URL` and `REDIS_URL` point at something real.

### Degraded mode

If Redis is unreachable the API does not crash. It falls back to a file-backed queue
driver with the same interface and reports `driver=file` on `/api/health`. If Postgres
is unreachable the API fails loudly instead of inventing data.

---

## Project layout

```
src/
  api/                 fetch client, endpoint map, clipboard helper
  auth/                AuthProvider — session bootstrap, sign-in/out
  components/ui/       Button, Chip, Field, TextInput, Select, Tabs, Toast, EmptyState
  data/apiDocs.js      the API reference content the docs page renders
  pages/
    Landing/           hero, how-it-works, features, API tabs, pricing, docs preview
    Docs/              endpoint reference with the live request runner
    Auth/              split-layout sign-in and sign-up
    Dashboard/         the three-column command centre
      sections/        Overview, Pipeline, Calls, Observability
      components/      LeadDetail, LogCallForm
      hooks/           useDashboardData
  styles/
    tokens.css         the single source of colour, type, spacing and motion
    base.css           reset, focus rings, scrollbars, reduced-motion

server/
  index.js             migrations at boot, queue boot, /api/health, rate limiting
  src/
    config/env.js      environment loading and defaults
    db/                pool, migration runner, migrations, seed
    middleware/        auth guard, error handler
    repositories/      data access — leads, calls, users, stats
    routes/            HTTP layer
    services/          auth, summary analyser, follow-up lifecycle, queue drivers
    utils/             helpers

scripts/
  api-smoke.mjs        28 end-to-end API checks against a running server
  verify.mjs           41 headless browser checks across every route and interaction

docs/
  superpowers/specs/   the design and architecture spec this build follows
  comps/               the three rendered visual directions that were compared
```


<<<<<<< HEAD
=======
## API reference

All endpoints return `{ status, data }` on success and `{ status, error, message }` on
failure. Protected routes take `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account, returns a token |
| `POST` | `/api/auth/signin` | Exchange credentials for a token |
| `GET` | `/api/auth/me` | The current user |
| `GET` | `/api/auth/demo` | The seeded demo account |
| `GET` | `/api/leads` | List and filter leads |
| `GET` | `/api/leads/:id` | One lead with its call history |
| `PATCH` | `/api/leads/:id` | Update a lead's pipeline status |
| `GET` | `/api/calls` | Call history |
| `POST` | `/api/calls` | Log a call — summarises it and queues a follow-up |
| `GET` | `/api/stats` | Overview figures, pipeline, sentiment, 14-day trend |
| `GET` | `/api/stats/activity` | Merged activity feed |
| `GET` | `/api/stats/observability` | Job, webhook, and latency detail |
| `GET` | `/api/webhooks/events` | Webhook delivery log |
| `GET` | `/api/health` | Service and queue status |

`GET /api/leads` accepts `status`, `q`, `sortBy`, `sortDir`, `limit`, and `offset`, and
returns `meta.total` alongside the page of rows.

```bash
# Log a call — summarises it, scores it, and queues the follow-up
curl -X POST http://127.0.0.1:3000/api/calls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
        "leadId": "<uuid>",
        "durationSeconds": 214,
        "transcript": "We take about forty inbound calls a day...",
        "outcome": "Pricing question"
      }'
```

The interactive version of this lives in the app at `/docs`, where every endpoint has a
runner that fires a real request and renders the real response.

---
>>>>>>> 19e99cf (docs: add product documentation)

## Data model

```
users            email, password_hash, name, role
leads            external_id, name, company, phone, email, status,
                 ai_summary, sentiment, sentiment_score, followup_sent, next_step
calls            lead_id, duration_seconds, transcript, outcome, summary,
                 sentiment, sentiment_score, next_step
followup_jobs    lead_id, channel, status, attempts, error, payload,
                 completed_at
webhook_events   event_type, target_url, status, status_code, payload
api_keys         user_id, label, prefix, hashed_key
```

`followup_jobs.status` is one of `queued`, `processing`, `sent`, `failed`, or
`dead_letter`.

The migration in `server/src/db/migrations/001_init.sql` is written to be re-runnable —
every statement is idempotent, so `npm run migrate` is safe to repeat.

---

## The queue

Logging a call creates one follow-up job and hands it to the queue. The driver only
decides *when* a job runs; every state transition lives in
`server/src/services/followup.service.js`, so BullMQ and the file fallback behave
identically.

```
POST /api/calls
      │
      ▼
  job created (queued)
      │
      ▼
  BullMQ worker picks it up
      │
      ├─ delivered ─────────────────► sent
      │
      └─ failed ──► queued (retry, 1.5s exponential backoff)
                        │
                        ├─ delivered ─────────► sent
                        │
                        └─ failed at max attempts ──► dead_letter
```

Three outcomes are simulated, each deterministic per job id so the observable rates are
stable across restarts:

- **Blocked recipient** — the first attempt fails and the retry clears it.
- **Transient upstream 503** — the first attempt fails and the retry clears it.
- **Permanent opt-out** — every attempt fails and the job dead-letters.

The result is a delivery rate in the high nineties with a small, real number of
dead-lettered jobs, and a latency distribution that shows the cost of a retry.

---

## Design system

All styling lives in external CSS Modules. There are no inline `style={{...}}` props
anywhere in the app, and an ESLint rule enforces it:

```js
// eslint.config.js
'no-restricted-syntax': [
  'error',
  {
    selector: 'JSXAttribute[name.name="style"]',
    message:
      'Inline styles are not allowed. Put the rule in the component CSS Module and use a class.',
  },
]
```

Beyond that:

- **One token vocabulary.** Every colour, type step, spacing step, radius, and duration
  is a CSS custom property in `src/styles/tokens.css`. There is not a single hard-coded
  hex value in any component stylesheet. Re-theming a surface means overriding a token,
  not fighting a selector.
- **Externally overridable.** Module classes are the only styling hook, so any rule can
  be restyled from outside the module that owns it.
- **Mono only for data.** JetBrains Mono is for code, IDs, dates, and figures — never
  for prose.
- **One elevation.** A component uses a border *or* a shadow, never both, and shadows
  are offset rather than a diffuse glow.
- **No decorative overlays.** No gradient text, no glass or blur panels, no glow behind
  type, no floating ornament above the content.
- **Readability.** Body copy is capped at a 68-character measure. Display tracking
  tightens to `-0.035em`. Micro-labels are mono, 11px, uppercase, `0.06em` tracking.
- **Reduced motion** is honoured globally.

The dashboard keeps its original three-column command centre: a left rail of endpoints
and queue state, the main workspace, and a right column carrying the live pulse,
delivery state, and recent webhooks. Lead detail opens inline in the pipeline — it is
never a modal overlay.

---

## Verification

Two suites, both runnable against a live stack.

```bash
npm run lint        # ESLint, including the no-inline-style rule
npm run test:api    # 28 end-to-end API checks
npm run test:ui     # 41 headless browser checks
npm run verify      # all three
```

`scripts/verify.mjs` drives the system Edge browser through every route and
interaction: pricing toggle, API tab switching, copy buttons, the docs request runner
returning a real HTTP 200, sign-in, the KPI row, the trend chart, pipeline search,
sorting and direction flipping, inline lead detail with zero dialogs, status changes,
call logging, the queue and latency views, sign-out, and horizontal-overflow checks at
390 px. It fails on any console error.

`scripts/api-smoke.mjs` covers the API directly: health, sign-in, `/me`, 401 handling,
wrong password, validation errors, duplicate signup, lead filtering, search, sorting,
404s, status updates, call logging, job queueing, stats, activity, observability, and
webhook events.

Both suites write screenshots to `.data/shots/`.

---

## Honesty policy

This build will not fabricate credibility.

- The landing page's figures come from the project's own README and are labelled
  illustrative.
- The pricing tiers are labelled illustrative — there is no confirmed pricing.
- There are no customer logos, testimonials, or benchmark claims, because none exist.
- The dashboard shows **live database numbers only**. Where a number appears, it came
  from a `SELECT` against the running database.
- The docs page runs the real API and shows the real response, including errors.

---

## Known limits

- **No live LLM.** `server/src/services/summary.service.js` uses a deterministic local
  analyser. It returns the same summary, sentiment, score, and next step for the same
  transcript, and the provider interface is designed to be swapped for a real model.
- **No real WhatsApp send.** `followup.service.js` simulates the delivery lifecycle —
  success, retry, dead-letter — without calling Meta's API. The job lifecycle, the
  retry policy, and the observability surfaces are real.
- **No inbound webhooks.** `webhook_events` records outbound deliveries; the table and
  the observability view are complete, but nothing posts into the API yet.
- **Single-tenant.** Users exist and are authenticated, but data is not yet scoped per
  account.

---

## Licence

MIT.
