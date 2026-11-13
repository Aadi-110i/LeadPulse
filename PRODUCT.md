# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase answers the stack, so no stack decision was delegated.

- Frontend: React 19 + Vite 8, CSS Modules, `lucide-react` icons, `recharts` for data.
- Backend: Node.js + Express 5, `pg` for PostgreSQL, `ioredis` + `bullmq` for the Redis job queue, `jsonwebtoken` + `bcryptjs` for auth, `zod` for validation.
- Auth: JWT bearer tokens issued by the API, persisted client-side.
- Data: PostgreSQL is the system of record (leads, calls, summaries, users). Redis + BullMQ is the async delivery queue for WhatsApp follow-ups.

## Users

Two audiences share one product:

- **The buyer/operator** — a small-to-medium business owner or sales lead who takes customer calls and forgets to follow up. They open LeadPulse between calls, not for eight hours a day. Their job is to know what every lead needs next and to act before the lead goes cold.
- **The integrator** — a developer wiring LeadPulse into an existing CRM or workflow over REST. Their job is to predict the API: clear endpoints, predictable JSON, no SDK ceremony.

The primary product surface is the dashboard (Operate mode). The marketing site and API reference are supporting surfaces.

## Product Purpose

LeadPulse manages the customer communication lifecycle from the first call to the final conversion. It transcribes and summarizes each call with an LLM, extracts sentiment and next steps, and queues a WhatsApp follow-up that goes out within minutes of the call ending. Success means the owner stops losing leads to forgotten follow-ups, and a sales team can see every lead's state at a glance.

## Positioning

The differentiated mechanism is the pairing of call understanding with reliable asynchronous delivery: an LLM produces a structured summary and sentiment, and that output becomes a queued, retried WhatsApp message rather than a note a human has to copy. The product is sold on the pipeline outcome, not on the summary.

Everything is reachable over one clean REST API, so LeadPulse plugs into an existing CRM instead of asking a team to migrate.

## Operating Context

- Calls arrive as metadata (duration, transcript, outcome) or live recordings.
- A lead moves through the pipeline: `new` → `contacted` → `converted`.
- Follow-up delivery happens asynchronously; a job can be queued, delayed, retried, or dead-lettered. The team watches delivery rate and failed jobs, not synchronous send results.
- Integrators work from API docs and copy-paste snippets, not from a UI.
- The API is the contract. A lead record's shape is stable enough to key off (`id`, `status`, `ai_summary`, `sentiment`, `followup_sent`, `last_call`).

## Capabilities and Constraints

- **Call logging API** — record a call with `lead_id`, `duration_seconds`, `transcript`, `outcome`.
- **LLM summarization** — GPT-4o extracts key points, sentiment, and next steps.
- **WhatsApp follow-up** — automated message through Twilio / Meta Cloud API after a call.
- **Async job queue** — BullMQ + Redis handles retries, delays, and dead-letter queues.
- **Lead pipeline** — track every lead across stages in real time.
- **Observability** — request latency, failed jobs, webhook delivery tracked per lead.
- **JWT auth** — bearer tokens, role-scoped.
- **REST API first** — clean endpoints, robust JSON responses, developer-facing.
- **Styling constraint (user-confirmed):** all styling lives in external stylesheets (CSS Modules). No inline `style={...}` objects in components, and no selector specificity that blocks an external override. Components must be restyleable from outside their own module.
- **Data constraint (user-confirmed):** PostgreSQL and Redis are the intended backing services with a real schema and migrations. The app must still boot and remain usable when those services are unreachable, so a degraded mode is required rather than a hard crash.
- Illustrative numbers in the UI are labelled as illustrative. Unverified commercial claims (customers, benchmarks, testimonials) must not be presented as fact.

## Brand Commitments

- Name: **LeadPulse**. Logo mark and wordmark exist in the current build and are preserved in structure.
- Voice: plain, technical, developer-friendly. Short declarative sentences. Controls name their action.
- The product is positioned as an API-first backend with a real dashboard attached, not as a no-code CRM.
- Existing README copy and API request/response shapes are product truth and are preserved.

## Evidence on Hand

- `README.md` — the canonical product description, feature table, API reference, and architecture diagram.
- `server/` — working Express scaffolding: auth routes, controller, service, JWT middleware, zod validation, and an in-memory user model.
- `src/` — the incumbent React implementation, its mock dataset, and the existing copy.
- Example API values in the README (`total_leads: 1240`, `calls_today: 84`, `avg_latency_ms: 342`, `failed_jobs: 3`, `whatsapp_delivery_rate: 0.982`) are the repo's own example payload and are the honest source for dashboard figures.

**Absences — must not be fabricated:** there are no real customer logos, no production testimonials, no verified performance benchmarks, no confirmed pricing, and no real WhatsApp sender number. The current build's pricing tiers and marketing statistics are invented and must be labelled illustrative or replaced.

## Product Principles

1. **Never lose a follow-up.** The queue exists so a lead is not forgotten. Reliability outranks cleverness.
2. **The API is the product.** The dashboard is one client of the same REST contract an integrator uses.
3. **Observable by default.** Latency, failed jobs, and delivery rate are first-class, not a hidden admin page.
4. **Show the system's actual state.** Deliveries, retries, and queue depth are visible and honest rather than smoothed over.
5. **Degrade, don't die.** If Postgres or Redis is down, say so plainly and keep the parts that still work usable.

## Accessibility & Inclusion

Not separately established. Baseline web accessibility applies: keyboard-operable controls, visible focus, sufficient contrast, and reduced-motion fallbacks for animation.
