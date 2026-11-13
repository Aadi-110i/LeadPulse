# LeadPulse — Design Specification

**Date:** 2026-11-06
**Status:** Approved direction, pending build
**Source of truth:** `PRODUCT.md` (product truth), `docs/comps/` (approved visual direction)

---

## 1. What we are building

A faithful recreation of the LeadPulse marketing site and product app, rebuilt so that every
surface is clean, premium, and genuinely functional — not a static mock.

The original site (github.com/Aadi-110i/LeadPulse, deployed at lead-pulse-zeta.vercel.app) is a
dark, neon, glow-heavy "AI command grid". Its bundle confirms the full component tree: hero with
floating tags, stats strip, bento features grid, tabbed API block, pricing grid, docs layout with
sidebar, footer with status; plus a three-column dashboard with a command dock, KPI row, activity
log and status badges, and an auth flow with access keys.

**We keep the product, the information architecture, and the API shape. We replace the visual
treatment** — the glow stacks, floating overlay tags, gradient text, and monospace-everything
typography — with a restrained, correctly-typeset system.

## 2. Decisions on record

| Decision | Choice | Source |
|---|---|---|
| Audience | Mixed: marketing site **and** work-focused product app | User |
| Visual direction | **Split** — light landing, dark app | User |
| Dashboard layout | Keep the original three-column command centre | User |
| Unverified figures | Keep, clearly labelled illustrative | User |
| Data layer | Real PostgreSQL + Redis, project-local | User |
| "Not overlay" | No inline `style={}` objects; all styling in external CSS Modules, externally overridable | User |

### The "not overlay" rule, stated precisely

This is a **CSS architecture constraint**, not a visual one:

- No `style={{ ... }}` props on any component. Every declaration lives in a CSS Module file.
- No `!important` in our own stylesheets.
- No selector specificity above the level needed; no ID selectors, no deeply nested descendant
  chains used for theming.
- Tokens live on `:root` / `[data-surface]` custom properties, so any external stylesheet can
  retheme a component by overriding a variable rather than fighting a selector.
- No decorative element is positioned on top of content. Backgrounds are surfaces; nothing floats
  over a paragraph.

> Interpretive note: the original's `heroGlow`, `visualOrb`, `floatingTag` and `gridOverlay` layers
> are exactly the "overlay" pattern the user asked to avoid, so we drop them too. Both readings
> point the same way.

## 3. Visual worlds

Two registers, one family. They share type family, spacing rhythm, component geometry, and the
same underlying token names — so they read as one product, and the switch is a deliberate
register change rather than two products.

### 3.1 Landing / marketing — "Paper Dispatch"

Cool white dispatch sheet. Ruled ledger. Cobalt signal.

```
--surface-ground   #f1f3f6    paper
--surface-raised   #ffffff    cards
--rule             #dee2e9    hairlines
--rule-strong      #c6ccd6
--ink              #0c0f14
--ink-muted        #5a6270
--ink-faint        #8a92a0
--accent           #2b4ae0    cobalt
--accent-deep      #1e37b4
--positive         #14713d
--caution          #9a5b06
--negative         #a8271c
```

Type: **Familjen Grotesk** (display + text), **JetBrains Mono** (data, code, identifiers only).

### 3.2 App / dashboard / auth — "Quiet Console"

Graphite instrument panel. One warm brass accent. Mono only where data lives.

```
--surface-ground   #0e1013
--surface-raised   #16191e
--surface-high     #1c2027
--rule             #262b33
--rule-soft        #1e2229
--ink              #edeff3
--ink-muted        #98a1af
--ink-faint        #6b7482
--accent           #e0a45e    brass
--positive         #6fbf8e
--negative         #e0715f
```

Type: **Schibsted Grotesk** (display + text), **JetBrains Mono** (data, code, identifiers only).

### 3.3 Rules that hold in both

- Body measure 65–75ch. Reading widths are capped by `max-width` in the token layer, not ad hoc.
- Display tracking tightens to −0.04em; body tracking is 0; micro-labels sit at +0.06em.
- One accent per surface. Accent is never used for body text.
- Elevation is declared **once**: a surface gets a hairline border *or* a shadow, never both.
  A border plus a glow is a ghost card and is banned.
- Card radii 10–14px. Buttons 8–9px.
- Depth shadows are **offset**, never a zero-offset halo.
- Micro-labels are mono, uppercase, ≤11px, and always name a field or a unit.
- Motion: one authored moment per surface (the dashboard's live pulse), `prefers-reduced-motion`
  honoured globally.
- No gradient text. No blur/glass as decoration. No glow behind text.
- Icons: `lucide-react` only, 16/18/20px, `strokeWidth={1.75}`. No emoji, no Unicode glyphs
  standing in for icons.

## 4. Typography

| Role | Landing | App | Size / line |
|---|---|---|---|
| Display | Familjen Grotesk 700 | Schibsted Grotesk 600 | `clamp(2.7rem, 5.4vw, 4.25rem)` / 1.03 |
| Section heading | Familjen 600 | Schibsted 600 | `clamp(1.75rem, 3vw, 2.5rem)` / 1.15 |
| Lead paragraph | 17px | 17px | 1.6 |
| Body | 15–16px | 15–16px | 1.6 |
| Micro-label | mono 11px | mono 11px | uppercase, +0.06em |
| Data | mono, tabular numerals | mono, tabular numerals | — |

Rules: no mono paragraph text; no all-caps body copy; every heading set in the display face at a
real size (not stretched); numbers use `font-variant-numeric: tabular-nums` so columns align.

## 5. Frontend architecture

```
src/
  main.jsx                  entry, router mount
  App.jsx                   route table + providers
  styles/
    tokens.css              :root token layer (both worlds, scoped by [data-surface])
    base.css                reset, element defaults, focus, motion prefs
    utilities.css           layout primitives that genuinely repeat
  api/
    client.js               fetch wrapper, auth header, error normalisation
    endpoints.js            typed endpoint functions
  auth/
    AuthProvider.jsx        session state, token storage, login/logout
  components/               shared, each with its own .module.css
    Button/ Icon/ Field/ Chip/ Table/ Tabs/ Toast/ EmptyState/ ...
  pages/
    Landing/                Persuade
    Dashboard/              Operate
    Docs/                   Read
    Auth/                   Auth
  data/
    seed.js                 demo dataset mirroring the README payload
```

Routing: `react-router-dom` v7. Routes `/`, `/app`, `/app/pipeline`, `/app/calls`,
`/app/observability`, `/docs`, `/signin`, `/signup`. Deep links must work; the current build's
`useState` view-switching is replaced.

### Landing sections (order mirrors the original)

1. **Header** — brand, Product / API / Pricing / Docs, Sign in, Start free (sticky, hairline bottom).
2. **Hero** — display headline, lead paragraph, primary + secondary CTA, and a real product visual
   (a live lead record card). No glow, no orb, no floating tags.
3. **Proof strip** — four figures from the README example payload, labelled illustrative.
4. **Features** — bento grid, six capabilities drawn from the README feature table:
   Call Logging, Lead Retrieval, Webhook Events, LLM Summarization, WhatsApp Follow-ups,
   Observability. Each card: icon, name, one-sentence mechanism, one proof line.
5. **API** — tabbed request/response viewer with working copy buttons and a runnable sample.
6. **Pricing** — three tiers, labelled illustrative, one highlighted.
7. **Docs preview** — sidebar + doc cards, linking into `/docs`.
8. **Footer** — link grid, "All systems operational" status line, tagline.

### Dashboard (three-column command centre, as chosen)

```
┌──────────────────────────────────────────────────────────────┐
│ Header: brand | nav | session                                 │
├───────────┬──────────────────────────────────┬───────────────┤
│ Left rail │ Main workspace                   │ Right column  │
│ nav       │ KPI row (4 tiles)                │ Live pulse    │
│ endpoints │ Pipeline / calls table            │ Activity log  │
│ CTA card  │ Detail of selection               │ Job health    │
└───────────┴──────────────────────────────────┴───────────────┘
```

- Left rail: section nav, the API endpoint list, a status card.
- Main: KPI row (Total leads, Calls today, Avg latency, Failed jobs), then a switchable table
  (Pipeline / Calls) with search, status filter, and sorting that actually work.
- Right: live pulse feed (newest activity, auto-refreshing), queue health, delivery rate.
- Selecting a lead opens an **inline** detail panel in the main column — not a modal, not an
  overlay.

### Docs

Sidebar of endpoints; each endpoint expands inline to show method, path, auth header, request
body, and response. Code blocks have working copy buttons.

### Auth

Split layout: form on one side, product promise on the other. Email + password, real JWT issued
by our API against PostgreSQL. Errors surface inline: "Invalid email or access key", "This account
already exists", "Access key must be at least 6 characters" — the original's copy. Session expiry
is visible ("Session Active").

## 6. Backend architecture

```
server/src/
  app.js                    express app
  config/env.js             env parsing + validation
  db/
    pool.js                 pg Pool
    migrate.js              migration runner
    migrations/*.sql        schema
  repositories/
    leads.repository.js     SQL only
    calls.repository.js
    users.repository.js
    stats.repository.js
  services/
    auth.service.js         bcrypt + JWT (already present)
    summary.service.js      LLM summarisation (provider interface + deterministic stub)
    followup.service.js     queue submission
    queue/
      index.js              picks BullMQ (Redis) or the fallback driver
      bullmq.driver.js
      memory.driver.js      durable file-backed fallback
  routes/
    auth.routes.js
    leads.routes.js
    calls.routes.js
    stats.routes.js
    webhooks.routes.js
  middleware/auth.middleware.js
  workers/followup.worker.js
```

### Endpoints

```
POST   /api/auth/signup          { email, password } -> { token, user }
POST   /api/auth/signin          { email, password } -> { token, user }
GET    /api/auth/me              -> { user }
GET    /api/leads                ?status=&q=            -> { data, meta }
GET    /api/leads/:id                                 -> { data }
PATCH  /api/leads/:id            { status }             -> { data }
GET    /api/calls                ?lead_id=              -> { data }
POST   /api/calls                { lead_id, duration_seconds, transcript, outcome }
GET    /api/stats                                    -> { data }
GET    /api/observability                            -> { data }
GET    /api/health                                    -> { status, services }
```

All protected routes require `Authorization: Bearer <jwt>`.

### PostgreSQL schema

```sql
users(id uuid pk, email citext unique, password_hash text, role text, created_at timestamptz)
leads(id uuid pk, external_id text unique, name text, company text, phone text,
      email text, status text check (status in ('new','contacted','converted','lost')),
      ai_summary text, sentiment text, followup_sent boolean, created_at, updated_at)
calls(id uuid pk, lead_id uuid fk, duration_seconds int, transcript text, outcome text,
      summary text, sentiment text, next_step text, created_at)
followup_jobs(id uuid pk, lead_id uuid fk, channel text, status text,
               attempts int, error text, created_at, completed_at)
api_keys(id uuid pk, user_id uuid fk, label text, prefix text, hashed_key text, created_at)
```

Migrations are plain SQL files run by `npm run migrate` in `server/`. Seeded with a realistic
demo dataset so the dashboard is populated on first run.

### Queue

`queue/index.js` selects a driver at boot:

- **BullMQ** when `REDIS_URL` is reachable — real Redis, real retries, real dead-letter.
- **File-backed driver** otherwise — same interface, persists to `server/.data/queue.json`,
  survives restart, surfaces the same job status.

The UI shows which driver is live rather than pretending. Retry and failure states are visible
because that is the product's actual subject.

### Degradation

If PostgreSQL is unreachable the API returns `503` with a clear body and the frontend shows a
"database offline" state instead of an empty dashboard. If Redis is down, follow-ups still queue
through the file driver and the UI says so.

## 7. Honesty policy

- Figures shown on the landing come from the README example payload and are labelled
  "illustrative".
- Pricing tiers are labelled illustrative; no tier claims support response times or uptime that
  we cannot evidence.
- No customer logos, testimonials, or benchmark claims.
- AI summaries in the seed data are clearly synthetic samples drawn from the original bundle's own
  example strings.

## 8. Accessibility

Keyboard operable throughout, visible focus rings, AA contrast on both surfaces, `aria-live` on
the activity feed and toasts, `prefers-reduced-motion` honoured, and no information conveyed by
colour alone (every status chip pairs colour with a text label).

## 9. Verification plan

1. `npm run build` clean, `npm run lint` clean.
2. Migrations applied to the project-local Postgres; seed applied.
3. Server boots; `/api/health` reports both services.
4. Browser pass at 1440px and 390px across `/`, `/app`, `/app/pipeline`, `/docs`, `/signin`.
5. Every interactive control exercised: nav, theme register switch, copy buttons, tabs, search,
   filter, sort, row selection, lead status change, call logging, signup, signin, signout.
6. Network panel shows no failed requests; console shows no errors.
7. **Zero inline `style` props** — enforced by a lint rule and a grep check.

## 10. Out of scope

- Live LLM calls and real WhatsApp sending (provider interfaces and stubs only — no credentials).
- Payment processing.
- Multi-tenant billing.
